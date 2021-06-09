'use strict';

const BbPromise = require('bluebird');
const { diff } = require('deep-diff');

module.exports = {
  diffSkills(remoteSkills) {
    return BbPromise.bind(this)
      .then(() => BbPromise.resolve(remoteSkills))
      .map(function (remote) {
        // Skip live stages
        if (remote.stage === 'live') return BbPromise.resolve();

        const localSkills = this.serverless.service.custom.alexa.skills;
        const local = localSkills.find(skill => skill.id === remote.skillId);
        // Skip skills that are not part of the local config
        if (typeof local === 'undefined') return BbPromise.resolve();

        // Return diff
        return BbPromise.resolve({
          skillId: local.id,
          diff: diff(remote.manifest, local.manifest),
        });
      })
      .then(ret => BbPromise.resolve(ret.filter(v => !(typeof v === 'undefined'))));
  },
};
