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
      expect(ext.applies({}, { 'content-type': 'application/json' })).to.be.true;
    });
    it('should apply to application/json content type with params', function() {
      expect(ext.applies({}, { 'content-type': 'application/json; charset=utf-8' }, 200)).to.be.true;
    });

    it('should not apply when no content type at all (e.g. 204 response)', function() {
      expect(ext.applies({}, {}, 204)).to.be.false;
    });
  });

  describe('data parser', function() {
    it('should return the data', function() {
      var data = ext.dataParser({ name: 'John Doe', id: '123' }, {});

      expect(data).to.deep.include.members([
        {name: 'name', value: 'John Doe' },
        {name: 'id', value: '123' }
      ]);
    });
  });

  it('should have application/json media types', function() {
    expect(ext.mediaTypes).to.eql(['application/json']);
  });
});
