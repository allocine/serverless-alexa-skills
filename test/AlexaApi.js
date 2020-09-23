'use strict';

const { expect } = require('chai');
const AlexaApi = require('./../lib/AlexaApi');

describe('AlexaApi', () => {
  let alexaApi;

  beforeEach(() => {
    alexaApi = new AlexaApi(
      { expired: () => false, token: { access_token: 'token' } },
      { id: 'id', secret: 'secret' }
    );
  });

  describe('#constructor()', () => {
    it('should have Authorization header', () =>
      alexaApi.getHeaders().then(headers => expect(headers.Authorization).to.equal('token')));
  });
});
