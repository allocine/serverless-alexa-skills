'use strict';

const AlexaApi = require('./AlexaApi');

module.exports = {
  getRemoteModels() {
    const alexaApi = new AlexaApi(this.getToken(this.tokenFilePath), this.getClient());
    return this.getVendorId().then(function (vendorId) {
      return alexaApi.getModels(vendorId);
    });
  },
};
