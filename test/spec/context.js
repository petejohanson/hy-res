'use strict';

require('es6-promise').polyfill();

var _ = require('lodash');

var chai = require('chai');
var expect = chai.expect;

var Context = require('../../src/context.js');

describe('Context', function () {
  var context, defaultOpts, http, extensions;
  beforeEach(function() {
    defaultOpts = {};
    http = sinon.spy();
    extensions = [{mediaTypes: ['application/json', 'application/vnd.collection+json']}];
  });

  describe('for a given resource', function() {
    beforeEach(function() {
      context = new Context(http, extensions, defaultOpts).forResource({
        url: 'http://localhost:8080',
        headers: {
          'content-type': 'application/vnd.collection+json'
        }
      });
    });

    it('resolves relative URLs', function() {
      expect(context.resolveUrl('/posts')).to.eql('http://localhost:8080/posts');
    });

    it('generates an accept header preferring the content type of the context', function() {
      expect(context.acceptHeader()).to.eql('application/json;q=0.5,application/vnd.collection+json');
    });

    it('leaves absolute URLs alone', function() {
      expect(context.resolveUrl('http://api.server.com/posts')).to.eql('http://api.server.com/posts');
    });

  });

  describe('with new set of extensions', function() {
    var newExtensions;
    var originalContext;
    beforeEach(function() {
      newExtensions = [sinon.spy()];
      originalContext = new Context(http, extensions, defaultOpts);
      context = originalContext.withExtensions(newExtensions);
    });

    it('is a new instance', function() {
      expect(context).to.not.equal(originalContext);
    });

    it('has the new extensions', function() {
      expect(context.extensions).to.eql(newExtensions);
    });
  });

  describe('the empty context', function() {
    beforeEach(function() {
      context = new Context(http, extensions, defaultOpts);
    });

    it('leaves all URLs alone', function() {
      expect(context.resolveUrl('/posts')).to.eql('/posts');
    });
  });

  describe('withDefaults', function() {
    beforeEach(function() {
      defaultOpts = { protocol: { headers: { 'Authorization': 'Bearer 123' } } };

      context = new Context(http, extensions, defaultOpts);
    });

    it('merges the defaults with the passed in options', function() {
      var merged = context.withDefaults({ data: { 'user_id': '123' }, protocol: { headers: { 'Prefer': 'return=representation' } } });

      expect(merged).to.eql({
        data: { 'user_id': '123' },
        protocol: {
          headers: {
            'Authorization': 'Bearer 123',
            'Prefer': 'return=representation'
          }
        }
      });
    });
  });
});
