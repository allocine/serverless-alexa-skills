'use strict';

const AlexaApi = require('./AlexaApi');

module.exports = {
  createSkill() {
    return this.getVendorId()
      .then(vendorId => new AlexaApi(this.getToken(this.tokenFilePath), this.getClient()).createSkill(
        vendorId,
        this.options.name,
        this.options.locale,
        this.options.type
      ));
  },
};

