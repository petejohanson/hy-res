'use strict';

require('es6-promise').polyfill();

var HalCurie = require('../../src/hal_curie_binding');
var WebLink = require('../../src/web_link');
var Context = require('../../src/context');
var chai = require('chai');
chai.use(require('chai-things'));
var expect = chai.expect;

describe('HalCurieBinding', function () {
  var curie;

  beforeEach(function() {
    var webLink = new WebLink({
      name: 'ea',
      templated: true,
      href: 'http://api.co/rel{/rel}'
    }, new Context());

    curie = new HalCurie(webLink);
  });

  describe('basic properties', function() {
    it('should have prefix populated from HAL name link property', function() {
      expect(curie).to.have.property('prefix').eql('ea');
    });
  });

  describe('curie expansion', function() {
    it('should expand a referenced using the provided URI Template', function() {
      expect(curie.expand('find')).to.eql('http://api.co/rel/find');
    });
  });
});
