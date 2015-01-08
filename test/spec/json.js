'use strict';

var JsonExtension = require('../../src/json');

var expect = require('chai').expect;

describe('JsonExtension', function () {
  var ext;

  beforeEach(function() {
    ext = new JsonExtension();
  });

  describe('extension applicability', function() {
    it('should apply when application/json content type', function() {
      expect(ext.applies({}, { 'content-type': 'application/json' })).to.be.true();
    });
    it('should apply to application/json content type with params', function() {
      expect(ext.applies({}, { 'content-type': 'application/json; charset=utf-8' }, 200)).to.be.true();
    });
  });

  describe('data parser', function() {
    it('should return the data', function() {
      var data = ext.dataParser({ name: 'John Doe' }, {});
      expect(data).to.eql({ name: 'John Doe' });
    });
  });
});
