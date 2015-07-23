'use strict';

require('es6-promise').polyfill();

var _ = require('lodash');

var chai = require('chai');
var expect = chai.expect;
chai.use(require('sinon-chai'));
chai.use(require('chai-hy-res'));
var Context = require('../../src/context.js');
var Resource = require('../../src/resource.js');
var Form = require('../../src/form.js');
var Json = require('../../src/json.js');

describe('Form', function () {

  describe('creating a form', function() {
    var form;
    var http;
    var data;

    beforeEach(function() {
      http = sinon.stub();

      data = {
        name: 'create-form',
        title: 'New Post',
        method: 'POST',
        href: '/posts',
        type: 'application/x-www-form-urlencoded',
        fields: [
          { name: 'title', type: 'text', title: 'Title', value: 'First Post!' },
          { name: 'parent', type: 'hidden', value: '123' }
        ]
      };

      var ctx = new Context(http, [{mediaTypes: ['application/vnd.siren+json', 'application/vnd.custom+json']}]);
      ctx = ctx.forResource({url: 'http://localhost/', headers: {'content-type': 'application/vnd.custom+json' }});
      form = new Form(data, ctx);
    });

    it('has the data properties', function() {
      expect(form.title).to.equal('New Post');
    });

    it('can access fields by name', function() {
     var titleField = form.field('title');
     expect(titleField).to.have.property('type', 'text');
     expect(titleField).to.have.property('title', 'Title');
     var parentField = form.field('parent');
     expect(parentField).to.have.property('type', 'hidden');
     expect(parentField).to.have.property('value', '123');
    });

    describe('cloning the form', function() {
      var copy;

      beforeEach(function() {
        copy = form.clone();
      });

      it('is not the original form', function() {
        expect(copy).not.to.be.equal(form);
      });

      it('has cloned fields', function() {
        expect(copy.field('title')).to.eql(form.field('title'));
        expect(copy.field('title')).not.to.equal(form.field('title'));
      });
    });

    describe('form submission', function() {
      var result;

      beforeEach(function() {
        http.returns(Promise.resolve({data: {}, headers: {}, status: 200 }));
        result = form.submit({ protocol: { headers: { Prefer: 'return=representation' }}});
      });

      it('should request the absolute form URL', function() {
        expect(http).to.have.been.calledWith(sinon.match({ url: 'http://localhost/posts' }));
      });

      it('should return a Resource', function() {
        expect(result).to.be.an.instanceof(Resource);
      });

      it('should use the form method', function() {
        expect(http).to.have.been.calledWith(sinon.match({ method: 'POST' }));
      });

      it('should use the content type', function() {
        expect(http).to.have.been.calledWith(sinon.match({ headers: { 'Content-Type': 'application/x-www-form-urlencoded' }}));
      });

      it('should generate an Accept header based on registered extensions, prefering context content type', function() {
        expect(http).to.have.been.calledWith(sinon.match({ headers: { 'Accept': 'application/vnd.siren+json;q=0.5,application/vnd.custom+json' }}));
      });

      it('should send the field data', function() {
        expect(http).to.have.been.calledWith(sinon.match({ data: { title: 'First Post!', parent: '123' } }));
      });

      it('should include the protocol options', function() {
        expect(http).to.have.been.calledWith(sinon.match({ headers: { 'Prefer': 'return=representation'}}));
      });
    });
  });

  describe('form submission that results in 201 Created response', function() {

    var form, http, resp;

    beforeEach(function() {
      http = sinon.stub();
      form = new Form({
        name: 'create-form',
        href: '/posts',
        method: 'POST',
        fields: []
      }, new Context(http, [new Json()]));

      http
        .withArgs(sinon.match({url: '/posts', method: 'POST'}))
        .returns(Promise.resolve({data: {}, headers: {'location': '/posts/123' }, status: 201}));

      http
        .withArgs(sinon.match({url: '/posts/123', method: 'GET'}))
        .returns(Promise.resolve({data: { title: 'yay' }, headers: {'content-type': 'application/json' }, status: 200}));
      resp = form.submit();

      return resp.$promise;
    });

    it('makes a GET call on the created location', function() {
      expect(http).to.be.calledWith(sinon.match({url: '/posts/123', method: 'GET'}));
    });

    it('returns the response from the created location', function() {
      expect(resp).to.be.a.resolved.resource;
      expect(resp.title).to.eql('yay');
    });
  });

  describe('form submission that results in 201 Created response but no Location header', function() {

    var form, http, resp;

    beforeEach(function() {
      http = sinon.stub();
      form = new Form({
        name: 'create-form',
        href: '/posts',
        method: 'POST',
        fields: []
      }, new Context(http, [new Json()]));

      http
        .withArgs(sinon.match({url: '/posts', method: 'POST'}))
        .returns(Promise.resolve({data: { title: 'yay'}, headers: { 'content-type': 'application/json'}, status: 201}));

      resp = form.submit();

      return resp.$promise;
    });

    it('returns the response from the initial form call', function() {
      expect(resp).to.be.a.resolved.resource;
      expect(resp.title).to.eql('yay');
    });
  });

  describe('form w/ GET method', function() {
    var form, http, data;

    beforeEach(function() {
      http = sinon.stub();

      data = {
        name: 'create-form',
        title: 'New Post',
        href: '/posts',
        method: 'GET',
        fields: [
          { name: 'q', type: 'text', title: 'Search', value: 'First Query!' },
        ]
      };

      form = new Form(data, new Context(http));
    });

    it('sends field values as query parameters', function() {
      http.returns(Promise.resolve({data: {}, headers: {}, status: 200 }));
      form.submit();
      expect(http).to.have.been.calledWith(sinon.match({ method: 'GET', params: { q: 'First Query!' } }));
    });

  });
});
