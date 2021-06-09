'use strict';

const { expect } = require('chai');
const diffModels = require('./../lib/diffModels');

describe('diffModels()', () => {
  beforeEach(() => {
    diffModels.serverless = { service: { custom: { alexa: { skills: [] } } } };
  });

  it('should return diff if it has the same ID', () => {
    const localSkills = [{
      id: 'foo',
      models: {
        'ja-JP': { foo: 'bar' },
      },
    }];
    const remoteSkills = [{
      id: 'foo',
      locale: 'ja-JP',
      model: { foo: 'buz' },
    }];

    diffModels.serverless.service.custom.alexa.skills = localSkills;
    diffModels.diffModels(remoteSkills).then((ret) => {
      expect(ret.length).to.equal(1);
    });
  });

  it('should not return diff if it has not the same ID', () => {
    const localSkills = [{
      id: 'foo',
      models: {
        'ja-JP': { foo: 'bar' },
      },
    }];
    const remoteSkills = [{
      id: 'bar',
      locale: 'ja-JP',
      model: { foo: 'buz' },
    }];

    diffModels.serverless.service.custom.alexa.skills = localSkills;
    diffModels.diffModels(remoteSkills).then((ret) => {
      expect(ret.length).to.equal(0);
    });
  });

  it('should ignore the remote model version', () => {
    const localSkills = [{
      id: 'foo',
      models: {
        'ja-JP': { foo: 'bar' },
      },
    }];
    const remoteSkills = [{
      id: 'foo',
      locale: 'ja-JP',
      model: { foo: 'bar', version: '2' },
    }, {
      id: 'foo',
      locale: 'ja-JP',
      model: { foo: 'buz', version: '1' },
    }];

    diffModels.serverless.service.custom.alexa.skills = localSkills;
    diffModels.diffModels(remoteSkills).then((ret) => {
      expect(ret[0].diff).to.equal(undefined);
      expect(ret[1].diff.length).to.equal(1);
    });
  });
});
