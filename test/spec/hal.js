'use strict';

require('es6-promise').polyfill();

var HalExtension = require('../../src/hal');
var Resource = require('../../src/resource');
var Context = require('../../src/context');
var chai = require('chai');
chai.use(require('chai-things'));
chai.use(require('chai-hy-res'));
var expect = chai.expect;

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

    it('should not apply to 204 No Content responses', function() {
      expect(extension.applies({}, {}, 204)).to.be.false;
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
        name: 'John Doe',
        id: '123'
      }, {});

      expect(data).to.deep.include.members([
        {name: 'name', value: 'John Doe' },
        {name: 'id', value: '123' }
      ]);
    });
  });

  describe('embedded parser', function() {
    var subs;
    beforeEach(function() {
      subs = extension.embeddedParser({
        _embedded: {
          'item': [
            {
              _links: {
                self: { href: '/posts/123' }
              },
              name: 'Welcome to hy-res'
            },
            {
              _links: {
                self: { href: '/posts/124' }
              },
              name: 'angular-hy-res integration'
            }
          ]
        }
      }, { 'content-type': 'application/hal+json' }, new Context({}, [extension]));
    });

    it('returns the items keyed by relation', function() {
      expect(subs.item).to.have.property('length', 2);
      expect(subs.item).to.all.be.instanceof(Resource);
    });

    it('parses the links of the embedded resources', function() {
      expect(subs.item[0]).to.have.link('self').with.property('href', '/posts/123');
      expect(subs.item[1]).to.have.link('self').with.property('href', '/posts/124');
    });
  });

  it('should have standard and custom media types', function() {
    expect(extension.mediaTypes).to.eql(['application/hal+json', addlMediaType]);
  });
});
