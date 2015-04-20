'use strict';

var HyRes = require('../../');

require('es6-promise').polyfill();

var expect = require('chai').expect;
var axios = require('axios');

describe('HyRes + axios to consume HALTalk', function() {
  var root;

  beforeEach(function() {
    var rootLink = new HyRes.Root('http://127.0.0.1:10000/', axios, [new HyRes.HalExtension()]);

    root = rootLink.follow();
    return root.$promise;
  });

  it('is resolved', function() {
    expect(root.$resolved).to.be.true();
  });

  it('has a self link', function() {
    expect(root.$has('self')).to.be.true();
  });

  describe('following a templated link relation', function() {
    var thing;
    var id = '123';

    beforeEach(function() {
      thing = root.$followOne('thing-template', { data: { id: id } });
      return thing.$promise;
    });

    it('is resolved', function() {
      expect(thing.$resolved).to.be.true();
    });

    it('has a self link', function() {
      expect(thing.$has('self')).to.be.true();
    });
  });
});
