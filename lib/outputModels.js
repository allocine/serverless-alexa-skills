'use strict';

const YAML = require('js-yaml');

module.exports = {
  outputModels(models) {
    models.forEach((model) => {
      this.serverless.cli.log(`
      -------------------
      [Skill ID] ${model.id}
      [Locale] ${model.locale}
      [Interaction Model]
      ${YAML.dump(model.model)}`);
    });
  },
};
