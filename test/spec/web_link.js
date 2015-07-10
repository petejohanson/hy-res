'use strict';

require('es6-promise').polyfill();

var _ = require('lodash');

var chai = require('chai');
var expect = chai.expect;
chai.use(require('sinon-chai'));
chai.use(require('chai-hy-res'));
chai.use(require('chai-as-promised'));
chai.config.truncateThreshold = 0;
var Context = require('../../src/context.js');
var WebLink = require('../../src/web_link.js');
var HalExtension = require('../../src/hal.js');
var JsonExtension = require('../../src/json.js');
var LinkHeaderExtension = require('../../src/link_header.js');

describe('WebLink', function () {

  describe('creating a web link', function() {
    var link;
    var http;
    var defaultOptions;

    beforeEach(function() {
      http = sinon.stub();
      defaultOptions = {};
      var extensions = [new HalExtension(), new JsonExtension(), new LinkHeaderExtension()];

      var ctx = new Context(http, extensions, defaultOptions).forResource({
        url: 'http://api.server.com/',
        headers: {
          'content-type': 'application/hal+json'
        }
      });
      link = new WebLink({
        href: '/posts/123',
        title: 'Hypermedia and AngularJS'
      }, ctx);
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

      beforeEach(function() {
        httpPromise = new Promise(function(resolve, reject) {
          httpResolve = resolve;
        });
        http
          .withArgs(sinon.match({ url: 'http://api.server.com/posts/123' }))
          .returns(httpPromise);

        resource = link.follow();
      });

      it('is an unresolved resource', function() {
        expect(resource).to.be.an.unresolved.resource;
      });

      it('passes an Accept header with extension content types, preferring the context content type', function() {
        expect(http).to.be.calledWith(sinon.match.has('headers', { 'Accept': 'application/hal+json,application/json;q=0.5' }));
      });

      describe('once the request completes', function() {
        beforeEach(function() {
          httpResolve({data: { title: 'Hypermedia and AngularJS' }, headers: { 'content-type': 'application/hal+json' }, config: { url: 'http://api.server.com/posts/123' }});
          return httpPromise;
        });

        it('is a resolved resource', function() {
          expect(resource).to.be.a.resolved.resource;
        });

        it('has the expected properties', function() {
          expect(resource.title).to.equal('Hypermedia and AngularJS');
        });
      });
    });

    describe('following a link that returns an error', function() {
      var resource;
      var httpResolve;
      var httpPromise;

      beforeEach(function() {
        httpPromise = Promise.reject({data: {}, headers: {}, status: 404});
        http
          .withArgs(sinon.match({ url: 'http://api.server.com/posts/123' }))
          .returns(httpPromise);

        resource = link.follow();
      });

      it('has the follow rejection in the $error', function() {
        return expect(resource.$promise).to.be.rejected.and.to.eventually.have.property('$error').eql({message: 'HTTP request to load resource failed', inner: {data: {}, headers: {}, status: 404}});
      });

      it('has a rejected promise with the resource', function() {
        return expect(resource.$promise).to.be.rejectedWith(resource);
      });
    });

    describe('following the link when there are default options', function() {
      beforeEach(function() {
        http.returns(Promise.resolve({}));
        defaultOptions.protocol = { headers: { 'Prefer': 'return=representation' } };

        link.follow({ protocol: { headers: { 'Accept': 'text/plain' } } });
      });

      it('invokes the http request with the merged options', function() {
        expect(http).to.be.calledWith(sinon.match.has('headers', { 'Accept': 'text/plain', 'Prefer': 'return=representation' }));
      });
    });
  });

  describe('creating a templated web link', function() {
    var link;

    beforeEach(function() {
      link = new WebLink({
        href: '/posts{/id}',
        templated: true
      }, new Context(), {}, []);
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

      link = new WebLink({
        href: '/posts?page=2',
        type: 'application/json'
      }, new Context(http, extensions));
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
        expect(res).to.not.be.null;
      });
    });

    describe('following the link with explicit Accept header in options', function() {
      it('sends the provided Accept header', function() {
        httpPromise = new Promise(function(resolve, reject) {
        });
        http.withArgs(sinon.match.has('headers', { 'Accept': 'text/plain' })).returns(httpPromise);

        var res = link.follow({ protocol: { headers: { 'Accept': 'text/plain' } }});
        expect(http).to.be.calledWith(sinon.match.has('headers', { 'Accept': 'text/plain' }));
        expect(res).to.not.be.null;
      });
    });
  });
});
