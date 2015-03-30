'use strict';

var HyRes = require('../../');

require('es6-promise').polyfill();

var expect = require('chai').expect;
var axios = require('axios');

describe('HyRes + axios to consume HALTalk', function() {
  var root;

  beforeEach(function() {
    root = new HyRes.Root('http://127.0.0.1:10000/', axios, [new HyRes.HalExtension()]).follow();
    return root.$promise;
  });

  it('is resolved', function() {
    expect(root.$resolved).to.be.true();
  });

  it('has a self link', function() {
    expect(root.$has('self')).to.be.true();
  });
});
