'use strict';

require('es6-promise').polyfill();

var _ = require('lodash');

var chai = require('chai');
var expect = chai.expect;
//var sinonChai = require('sinon-chai');
//chai.use(sinonChai);
var Context = require('../../src/context.js');

describe('Context', function () {
  var context, http, extensions;
  beforeEach(function() {
    http = sinon.spy();
    extensions = [sinon.spy()];
  });

  describe('with a URL', function() {
    beforeEach(function() {
      context = new Context(http, extensions).withUrl('http://localhost:8080');
    });

    it('resolves relative URLs', function() {
      expect(context.resolveUrl('/posts')).to.eql('http://localhost:8080/posts');
    });

    it('leaves absolute URLs alone', function() {
      expect(context.resolveUrl('http://api.server.com/posts')).to.eql('http://api.server.com/posts');
    });

  });

  describe('the empty context', function() {
    beforeEach(function() {
      context = new Context(http, extensions);
    });

    it('leaves all URLs alone', function() {
      expect(context.resolveUrl('/posts')).to.eql('/posts');
    });
  });
});
