'use strict';

var HyRes = require('../../');
var CJExtension = require('../../src/collection_json');

require('es6-promise').polyfill();

var chai = require('chai');
chai.use(require('chai-as-promised'));
chai.use(require('chai-hy-res'));

var expect = chai.expect;

var axios = require('axios');

describe('Collection+JSON + axios to perform an action', function() {
  var root;

  beforeEach(function() {
    var rootLink = new HyRes.Root('http://127.0.0.1:10000/', axios, [new CJExtension(), new HyRes.JsonExtension()]);

    root = rootLink.follow();
    return root.$promise;
  });

  it('is resolved', function() {
    expect(root.$resolved).to.be.true;
  });

  it('has a self link', function() {
    expect(root).to.have.link('self');
  });

  it('has the other links', function() {
    expect(root).to.have.link('posts').with.property('href', '/posts');
  });

  describe('the embedded items', function() {
    var items;
    beforeEach(function() {
      items = root.$subs('item');
    });

    it('has the right number of embedded items', function() {
      expect(items).to.have.property('length', 2);
    });

    it('The embedded items have self links', function() {
      expect(items[0]).to.have.link('self').with.property('href', 'http://example.org/friends/jdoe');
    });
  });

  describe('creating an item', function() {
    var form;

    beforeEach(function() {
      return root.$followOne('posts').$promise.then(function(pr) {
        form = pr.$form('create-form');
      });
    });

    it('has the form for creating an item', function() {
      expect(form).to.exist;
      expect(form).to.be.an.instanceof(HyRes.Form);
    });

    describe('submitting the form', function() {
      var resp;

      beforeEach(function() {
        form.field('title').value = 'Hello World';
        form.field('body').value = 'First post!';
        resp = form.submit();
      });

      it('creates a response', function() {
        expect(resp).to.be.a.resource;
      });

      describe('the form submission response', function() {
        beforeEach(function() {
          return resp.$promise;
        });

        it('is a resolved resource', function() {
          expect(resp).to.be.a.resolved.resource;
        });

        it('contains one embedded item with the submitted values', function() {
          var item = resp.$sub('item');
          expect(item).to.exist;
          expect(item.title).to.eql('Hello World');
          expect(item.body).to.eql('First post!');
        });
      });
    });
  });
});

