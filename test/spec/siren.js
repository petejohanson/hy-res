'use strict';

var SirenExtension = require('../../src/siren');

var expect = require('chai').expect;

describe('SirenExtension', function () {
  var addlMediaType = 'application/vnd.co.sirenformat+json';
  var ext;

  beforeEach(function() {
    ext = new SirenExtension([addlMediaType]);
  });

  describe('extension applicability', function() {
    it('should apply to application/vnd.siren+json content type', function() {
      expect(ext.applies({}, { 'content-type':  'application/vnd.siren+json' })).to.be.true();
    });

    it('should apply to application/vnd.siren+json content type with params', function() {
      expect(ext.applies({}, { 'content-type': 'application/vnd.siren+json; charset=utf-8' }, 200)).to.be.true();
    });

    it('should apply to a custom content type', function() {
      expect(ext.applies({}, { 'content-type':  addlMediaType })).to.be.true();
    });
  });

  describe('links parser', function() {
    it('should return the basic link', function() {
      var links = ext.linkParser({links: [ { rel: ['self'], href: '/orders/123' } ] }, {});
      expect(links.self[0].href).to.eql('/orders/123');
    });

    it('should return link for each relation in rel array', function() {
      var links = ext.linkParser({links: [ { rel: ['self', 'order'], href: '/orders/123' } ] }, {});
      expect(links.self[0].href).to.eql('/orders/123');
      expect(links.order[0].href).to.eql('/orders/123');
    });

    it('should return a link array for duplicate link rels', function() {
      var links = ext.linkParser({
        links: [
          { rel: ['self'], href: '/orders/123' },
          { rel: ['section'], href: '/orders?page=2' },
          { rel: ['section'], href: '/orders?page=3' }
        ]
      }, {});
      expect(links.section.length).to.eql(2);
      expect(links.section[0].href).to.eql('/orders?page=2');
    });

    it('should include sub-entity links', function() {
      var links = ext.linkParser({
        links: [
          { rel: ['self'], href: '/orders/123' }
        ],
        entities: [
          {
            rel: ['order'],
            href: '/orders/123'
          }
        ]
      }, {});

      expect(links.order[0].href).to.eql('/orders/123');
    });
  });

  describe('the embedded parser', function() {
    it('should return the fully embedded entities', function() {
      var embedded = ext.embeddedParser({
        entities: [
          {
            rel: ['order'],
            links: [
              { rel: ['self'], href: '/orders/123' }
            ],
            title: 'My Order #123'
          }
        ]
      }, {});

      expect(embedded.order[0].title).to.eql('My Order #123');
    });
  });

  describe('data parser', function() {
    it('should return the properties field values', function() {
      var data = ext.dataParser({
        links: [ { rel: ['self'], href: '/orders/123' } ],
        properties: {
          name: 'John Doe'
        }
      }, {});

      expect(data).to.eql({ name: 'John Doe' });
    });

    it('should include the title, if present', function() {
      var data = ext.dataParser({
        links: [ { rel: ['self'], href: '/orders/123' } ],
        properties: {
          name: 'John Doe'
        },
        title: 'My Order #123'
      }, {});

      expect(data).to.eql({
        name: 'John Doe',
        title: 'My Order #123'
      });
    });
  });

  describe('form parser', function() {
    var forms;

    beforeEach(function() {
      forms = ext.formParser({
        actions: [
          {
            name: 'create-form',
            title: 'New Post',
            fields: [
              { name: 'title', type: 'text' }
            ]
          }
        ]
      });
    });

    it('should return the actions keyed by name', function() {
      expect(forms['create-form'][0]).to.exist();
    });

    describe('the parsed form', function() {
      var f;

      beforeEach(function() { f = forms['create-form'][0]; });

      it('should have the title', function() {
        expect(f.title).to.equal('New Post');
      });

      it('should default the type', function() {
        expect(f.type).to.equal('application/x-www-form-urlencoded');
      });

      it('should default the method', function() {
        expect(f.method).to.equal('GET');
      });

      it('should have form fields', function() {
        expect(f.field('title')).to.exist();
      });
    });
  });

  it('should have standard and custom media types', function() {
    expect(ext.mediaTypes).to.eql(['application/vnd.siren+json', addlMediaType]);
  });
});
