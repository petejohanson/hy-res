'use strict';

require('es6-promise').polyfill();

var _ = require('lodash');

var chai = require('chai');
var expect = chai.expect;
var sinonChai = require('sinon-chai');
chai.use(sinonChai);
var Context = require('../../src/context.js');
var Form = require('../../src/form.js');

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

      // TODO: Need context to handle making relative -> absolute URL.
      form = new Form(data, Context.empty, http);
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
        result = form.submit();
      });

      it('should request the form URL', function() {
        expect(http).to.have.been.calledWith(sinon.match({ url: '/posts' }));
      });

      it('should use the form method', function() {
        expect(http).to.have.been.calledWith(sinon.match({ method: 'POST' }));
      });

      it('should use the content type', function() {
        expect(http).to.have.been.calledWith(sinon.match({ headers: { 'Content-Type': 'application/x-www-form-urlencoded' }}));
      });

      it('should send the field data', function() {
        expect(http).to.have.been.calledWith(sinon.match({ data: { title: 'First Post!', parent: '123' } }));
      });
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

      form = new Form(data, Context.empty, http);
    });

    it('sends field values as query parameters', function() {
      form.submit();
      expect(http).to.have.been.calledWith(sinon.match({ method: 'GET', params: { q: 'First Query!' } }));
    });
  });
});
