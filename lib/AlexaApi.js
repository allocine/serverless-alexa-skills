'use strict';

const BbPromise = require('bluebird');
const request = require('superagent');
const qs = require('querystring');
const Alexa = require('ask-smapi-sdk');

const URL_BASE = 'https://api.amazonalexa.com';
const URL_VERSION = 'v1';

class AlexaApi {
  constructor(token, client) {
    this.accessToken = token;
    this.smapi = new Alexa.StandardSmapiClientBuilder().withRefreshTokenConfig({
      refreshToken: this.accessToken.token.refresh_token,
      clientId: client.id,
      clientSecret: client.secret,
    }).client();
  }
  _getHeaders(contentType) {
    const headers = {
      Authorization: this.accessToken.token.access_token,
    };
    if (contentType) {
      headers['content-type'] = 'application/json';
    }
    return headers;
  }
  getHeaders(contentType) {
    if (this.accessToken.expired()) {
      return this.accessToken.refresh().then((newToken) => {
        this.accessToken = newToken;
        return BbPromise.resolve(this._getHeaders(contentType));
      });
    }
    return BbPromise.resolve(this._getHeaders(contentType));
  }
  get(path, params) {
    let url = URL_BASE;

    if (path.startsWith(`/${URL_VERSION}`)) {
      url += path;
    } else {
      url = `${url}/${URL_VERSION}${path}`;
    }

    if (!(typeof params === 'undefined')) {
      url = `${url}?${qs.stringify(params)}`;
    }

    return this.getHeaders()
      .delay(200)
      .then(headers => request.get(url).set(headers))
      .then(({ body }) => body);
  }

  post(path, params) {
    const url = `${URL_BASE}/${URL_VERSION}${path}`;
    return this.getHeaders('application/json')
      .then(headers => request.post(url).set(headers).send(params))
      .then(({ body }) => body);
  }
  put(path, params) {
    const url = `${URL_BASE}/${URL_VERSION}${path}`;
    return this.getHeaders('application/json').then(headers => request.put(url).set(headers).send(params))
      .then(({ body }) => body);
  }
  delete(path) {
    const url = `${URL_BASE}/${URL_VERSION}${path}`;
    return this.getHeaders().then(headers => request.delete(url).set(headers))
      .then(({ body }) => body);
  }
  getVendors() {
    return this.get('/vendors').then(obj => BbPromise.resolve(obj.vendors));
  }
  _getSkills(vendorId, nextToken = null) {
    const params = { vendorId };
    if (nextToken !== null) {
      params.nextToken = nextToken;
    }
    return this.get('/skills', params).then(function (obj) {
      const ret = obj.skills;
      if (obj.nextToken != null) {
        ret.concat(this._getSkills(vendorId, obj.nextToken));
      }
      return BbPromise.resolve(ret);
    });
  }
  getSkills(vendorId) {
    return BbPromise.bind(this)
      .then(function () {
        return BbPromise.resolve(this._getSkills(vendorId));
      })
      .mapSeries(function (skill) {
        return this.get(skill._links.self.href)
          .then(ret => BbPromise.resolve(Object.assign({}, ret, {
            skillId: skill.skillId,
            stage: skill.stage,
          })));
      });
  }
  getModels(vendorId) {
    return BbPromise.bind(this)
      .then(function () {
        return BbPromise.resolve(this.getSkills(vendorId));
      })
      .mapSeries(function (skill) {
        const skillLocales = skill.manifest.publishingInformation.locales;
        const locales = Object.keys(skillLocales).map(function (locale) {
          return { id: this.skillId, locale };
        }, skill);
        return BbPromise.bind(this)
          .then(() => BbPromise.resolve(locales))
          .mapSeries(function (locale) {
            return this.get(`/skills/${locale.id}/stages/development/interactionModel/locales/${locale.locale}`)
              .then(body => BbPromise.resolve({
                id: locale.id,
                locale: locale.locale,
                model: body,
              }))
              .catch((err) => {
                if (err.statusCode === 404) {
                  return BbPromise.resolve({
                    id: locale.id,
                    locale: locale.locale,
                    model: null,
                  });
                }
                return BbPromise.reject(err);
              });
          });
      });
  }
  createSkill(vendorId, name, locale, type) {
    return this.post('/skills', {
      vendorId,
      manifest: {
        publishingInformation: {
          locales: {
            [locale]: {
              name,
            },
          },
        },
        apis: {
          [type]: {},
        },
      },
    }).then(body => BbPromise.resolve(body.skillId));
  }
  updateSkill(skillId, manifest) {
    return this.smapi.updateSkillManifestV1(skillId, 'development', { manifest })
      .then(() => BbPromise.resolve(skillId))
      .catch((err) => {
        if (err.statusCode === 400) {
          if (err.response.violations) {
            const messages = err.response.violations.map(v => v.message).join(', ');
            throw new Error(`Manifest model violations: ${messages}`);
          }
        }
        throw err;
      });
  }
  updateModel(skillId, locale, model) {
    return this.put(
      `/skills/${skillId}/stages/development/interactionModel/locales/${locale}`,
      model
    ).then(() => BbPromise.resolve({ id: skillId, locale }));
  }
  deleteSkill(id) {
    return this.delete(`/skills/${id}`);
  }
}

module.exports = AlexaApi;
