'use strict';

const BbPromise = require('bluebird');
const { diff } = require('deep-diff');

module.exports = {
  diffModels(remoteModels) {
    return BbPromise.resolve(remoteModels)
      .map((model) => {
        const remote = { ...model };
        delete remote.model.version;
        const localSkills = this.serverless.service.custom.alexa.skills;
        const local = localSkills.find(skill => skill.id === remote.id);
        let ret;
        if (!(typeof local === 'undefined')) {
          let localModel = null;
          if (remote.locale in local.models) {
            localModel = local.models[remote.locale];
          }
          ret = {
            skillId: local.id,
            locale: remote.locale,
            diff: diff(remote.model, localModel),
          };
        }
        return BbPromise.resolve(ret);
      })
      .then(ret => BbPromise.resolve(ret.filter(v => !(typeof v === 'undefined'))));
  },
};
