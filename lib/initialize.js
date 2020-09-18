'use strict';

const path = require('path');
const so2 = require('simple-oauth2');
const homedir = require('os').homedir();

module.exports = {
  initialize() {
    this.localServerPort = this.serverless.service.custom.alexa.localServerPort || 9090;
    this.tokenFilePath = this.serverless.service.custom.alexa.tokenFilePath || path.join(homedir, '.serverless', this.TOKEN_FILE_NAME);
    const { clientId, clientSecret } = this.serverless.service.custom.alexa;
    if (!clientId) {
      throw new Error('Missing `clientId` in custom.alexa configuration');
    }
    if (!clientSecret) {
      throw new Error('Missing `clientSecret` in custom.alexa configuration');
    }
    this.oauth2 = so2.create({
      client: {
        id: clientId,
        secret: clientSecret,
      },
      auth: {
        authorizeHost: 'https://www.amazon.com',
        authorizePath: '/ap/oa',
        tokenHost: 'https://api.amazon.com',
        tokenPath: '/auth/o2/token',
      },
    });
  },
};
