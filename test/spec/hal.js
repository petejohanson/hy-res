'use strict';

var HalExtension = require('../../src/hal');
var expect = require('chai').expect;

describe('HalExtension', function () {
  var addlMediaType = 'application/vnd.co.format+json';
  var extension;


  beforeEach(function() {
    extension = new HalExtension([addlMediaType]);
  });

  describe('extension applicability', function() {
    it('should apply to application/hal+json content type', function() {
      expect(extension.applies({}, { 'content-type': 'application/hal+json' }, 200)).to.be.true;
    });

    it('should apply to application/hal+json content type with params', function() {
      expect(extension.applies({}, { 'content-type': 'application/hal+json; charset=utf-8' }, 200)).to.be.true;
    });
    it('should apply to additional media type', function() {
      expect(extension.applies({}, { 'content-type': addlMediaType }, 200)).to.be.true;
    });
  });

  describe('links parser', function() {
    it('should return the links', function() {
      var links = extension.linkParser({_links: { self: { href: '/orders/123' } } }, {}, {}, {});
      expect(links.self[0].href).to.equal('/orders/123');
    });
  });

  describe('data parser', function() {
    it('should return the properties without _links or _embedded', function() {
      var data = extension.dataParser({
        _links: { self: { href: '/orders/123' } },
        name: 'John Doe'
      }, {});

      expect(data).to.eql({ name: 'John Doe' });
    });
  });

  it('should have standard and custom media types', function() {
    expect(extension.mediaTypes).to.eql(['application/hal+json', addlMediaType]);
  });
});
