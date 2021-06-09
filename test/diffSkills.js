'use strict';

const { expect } = require('chai');
const diffSkills = require('./../lib/diffSkills');

describe('diffSkills()', () => {
  beforeEach(() => {
    diffSkills.serverless = { service: { custom: { alexa: { skills: [] } } } };
  });

  it('should return diff if it has the same ID', () => {
    const localSkills = [{
      id: 'foo',
      manifest: { foo: 'bar' },
    }];
    const remoteSkills = [{
      skillId: 'foo',
      manifest: { foo: 'buz' },
    }];

    diffSkills.serverless.service.custom.alexa.skills = localSkills;
    diffSkills.diffSkills(remoteSkills).then((ret) => {
      expect(ret.length).to.equal(1);
    });
  });

  it('should not return diff if it has not the same ID', () => {
    const localSkills = [{
      id: 'foo',
      manifest: { foo: 'bar' },
    }];
    const remoteSkills = [{
      skillId: 'bar',
      manifest: { foo: 'buz' },
    }];

    diffSkills.serverless.service.custom.alexa.skills = localSkills;
    diffSkills.diffSkills(remoteSkills).then((ret) => {
      expect(ret.length).to.equal(0);
    });
  });

  it('should not return diff of live stages', () => {
    const localSkills = [{
      id: 'foo',
      manifest: { foo: 'bar' },
    }];
    const remoteSkills = [{
      skillId: 'foo',
      stage: 'live',
      manifest: { foo: 'buz' },
    }, {
      skillId: 'foo',
      stage: 'development',
      manifest: { foo: 'but' },
    }];

    diffSkills.serverless.service.custom.alexa.skills = localSkills;
    diffSkills.diffSkills(remoteSkills).then((ret) => {
      expect(ret.length).to.equal(1);
      expect(ret[0].diff[0].lhs).to.equal('but');
    });
  });
});
