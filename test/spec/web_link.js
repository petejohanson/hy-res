'use strict';

require('es6-promise').polyfill();

var _ = require('lodash');
var resourceAssertions = require('../resource_assertions');

var expect = require('chai').expect;
var WebLink = require('../../src/web_link.js');
var HalExtension = require('../../src/hal.js');
var JsonExtension = require('../../src/json.js');
var LinkHeaderExtension = require('../../src/link_header.js');

describe('WebLink', function () {

  describe('creating a web link', function() {
    var link;
    var http;

    beforeEach(function() {
      http = sinon.stub();
      var extensions = [new HalExtension(), new JsonExtension(), new LinkHeaderExtension()];

      _.forEach(extensions, function(e) {
        if (e.initialize) {
          e.initialize(http, extensions);
        }
      });

      link = new WebLink({
        href: '/posts/123',
        title: 'Hypermedia and AngularJS'
      }, { url: 'http://api.server.com/' }, http, extensions);
    });

    it('had the data properties', function() {
      expect(link.href).to.equal('/posts/123');
      expect(link.title).to.equal('Hypermedia and AngularJS');
    });

    it('has a proper resolved URL', function() {
      expect(link.resolvedUrl()).to.equal('http://api.server.com/posts/123');
    });

    describe('following the link', function() {
      var resource;
      var httpResolve;
      var httpPromise;
      var context = {};

      beforeEach(function() {
        httpPromise = new Promise(function(resolve, reject) {
          httpResolve = resolve;
        });
        http
          .withArgs(sinon.match({ url: 'http://api.server.com/posts/123' }))
          .returns(httpPromise);

        resource = link.follow();
        context.resource = resource;
      });

      resourceAssertions.unresolvedResourceBehavior(context);

      it('passes an Accept header with extension content types', function() {
        expect(http.calledWith(sinon.match.has('headers', { 'Accept': 'application/hal+json,application/json' }))).to.be.true();
      });

      describe('once the request completes', function() {
        beforeEach(function() {
          httpResolve({data: { title: 'Hypermedia and AngularJS' }, headers: { 'content-type': 'application/hal+json' }, config: { url: 'http://api.server.com/posts/123' }});
          return httpPromise;
        });

        resourceAssertions.resolvedResourceBehavior(context);

        it('has the expected properties', function() {
          expect(resource.title).to.equal('Hypermedia and AngularJS');
        });
      });
    });
  });

  describe('creating a templated web link', function() {
    var link;

    beforeEach(function() {
      link = new WebLink({
        href: '/posts{/id}',
        templated: true
      }, {}, {}, []);
    });

    it('is templated', function() {
      expect(link.templated).to.equal(true);
    });

    it('processes the URI template for the resolved URL', function() {
      expect(link.resolvedUrl({ id: '123' })).to.equal('/posts/123');
    });

    describe('following the link without providing data in options', function() {
      it('should throw an exception', function() {
        var follow = function() {
          link.follow();
        };

        expect(follow).to.throw(Error);
      });
    });
  });

  describe('creating a web link with type expectation provided', function() {
    var link;
    var http, httpPromise;

    beforeEach(function() {
      http = sinon.stub();
      var extensions = [new HalExtension()];

      _.forEach(extensions, function(e) { e.initialize(http, extensions); });
      link = new WebLink({
        href: '/posts?page=2',
        type: 'application/json'
      }, {}, http, extensions);
    });

    it('has the type', function() {
      expect(link.type).to.equal('application/json');
    });

    describe('following the link with no options provided', function() {
      it('sends the type in the Accept header', function() {
        httpPromise = new Promise(function(resolve, reject) {
        });
        http.withArgs(sinon.match.has('headers', { 'Accept': 'application/json' })).returns(httpPromise);

        var res = link.follow();
        expect(res).to.not.be.null();
      });
    });

    describe('following the link with explicit Accept header in options', function() {
      it('sends the provided Accept header', function() {
        httpPromise = new Promise(function(resolve, reject) {
        });
        http.withArgs(sinon.match.has('headers', { 'Accept': 'text/plain' })).returns(httpPromise);

        var res = link.follow({ headers: { 'Accept': 'text/plain' } });
        expect(res).to.not.be.null();
      });
    });
  });
});
