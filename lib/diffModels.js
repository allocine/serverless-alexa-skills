'use strict';

const BbPromise = require('bluebird');
const { diff } = require('deep-diff');

module.exports = {
  diffModels(remoteModels) {
    return BbPromise.bind(this)
      .then(() => BbPromise.resolve(remoteModels))
      .map(function (remote) {
        return BbPromise.bind(this)
          .then(() => BbPromise.resolve(remote))
          .map(function (model) {
            const remoteModel = { ...model };
            delete remoteModel.model.version;
            const localSkills = this.serverless.service.custom.alexa.skills;
            const local = localSkills.find(skill => skill.id === remoteModel.id);
            let ret;
            if (!(typeof local === 'undefined')) {
              let localModel = null;
              if (remoteModel.locale in local.models) {
                localModel = local.models[remoteModel.locale];
              }
              ret = {
                skillId: local.id,
                locale: remoteModel.locale,
                diff: diff(remoteModel.model, localModel),
              };
            }
            return BbPromise.resolve(ret);
          })
          .then(ret => BbPromise.resolve(ret.filter(v => !(typeof v === 'undefined'))));
      });
  },
};
