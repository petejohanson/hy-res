'use strict';

var SirenExtension = require('../../src/siren');
var Resource = require('../../src/resource');
var Context = require('../../src/context');

var chai = require('chai');
chai.use(require('chai-things'));
var expect = chai.expect;

describe('SirenExtension', function () {
  var addlMediaType = 'application/vnd.co.sirenformat+json';
  var ext;

  beforeEach(function() {
    ext = new SirenExtension([addlMediaType]);
  });

  describe('extension applicability', function() {
    it('should apply to application/vnd.siren+json content type', function() {
      expect(ext.applies({}, { 'content-type':  'application/vnd.siren+json' })).to.be.true;
    });

    it('should apply to application/vnd.siren+json content type with params', function() {
      expect(ext.applies({}, { 'content-type': 'application/vnd.siren+json; charset=utf-8' }, 200)).to.be.true;
    });

    it('should apply to a custom content type', function() {
      expect(ext.applies({}, { 'content-type':  addlMediaType })).to.be.true;
    });

    it('should not apply to 204 No Content responses', function() {
      expect(ext.applies({}, {}, 204)).to.be.false;
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

    it('should return a link array for duplicate embedded rels', function() {
      var links = ext.linkParser({
        entities: [
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

    it('should ignore full embedded entities', function() {
      var links = ext.linkParser({
        links: [
          { rel: ['self'], href: '/orders/123' }
        ],
        entities: [
          {
            rel: ['order'],
            properties: { status: 'completed' }
          }
        ]
      }, {});

      expect(links.order).to.not.exist;
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
      }, { 'content-type': 'application/vnd.siren+json' }, new Context({}, [ext]));

      expect(embedded.order).to.all.be.instanceof(Resource);
      expect(embedded.order[0].title).to.eql('My Order #123');
    });

    it('should ignore embedded links', function() {
      var embedded = ext.embeddedParser({
        entities: [
          {
            rel: ['order'],
            href: '/orders/123'
          }
        ]
      }, {});

      expect(embedded.order).to.not.exist;
    });
  });

  describe('data parser', function() {
    it('should return the properties field values', function() {
      var data = ext.dataParser({
        links: [ { rel: ['self'], href: '/orders/123' } ],
        properties: {
          name: 'John Doe',
          id: '123'
        }
      }, {});

      expect(data).to.deep.include.members([
        {name: 'name', value: 'John Doe' },
        {name: 'id', value: '123' }
      ]);
    });

    it('should include the title, if present', function() {
      var data = ext.dataParser({
        links: [ { rel: ['self'], href: '/orders/123' } ],
        properties: {
          name: 'John Doe',
          id: '123'
        },
        title: 'My Order #123'
      }, {});

      expect(data).to.deep.include.members([
        {name: 'name', value: 'John Doe' },
        {name: 'id', value: '123' },
        {name: 'title', value: 'My Order #123' }
      ]);
    });
  });

  describe('form parser', function() {
    describe('parsing an entity w/o actions', function() {
      it('should return an empty object', function() {
        expect(ext.formParser({}, {})).to.eql({});
      });
    });

    describe('parsing an entity w/ actions', function() {
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
        expect(forms['create-form'][0]).to.exist;
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
          expect(f.field('title')).to.exist;
        });
      });
    });
  });

  it('should have standard and custom media types', function() {
    expect(ext.mediaTypes).to.eql(['application/vnd.siren+json', addlMediaType]);
  });
});
