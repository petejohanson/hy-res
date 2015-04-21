'use strict';

require('es6-promise').polyfill();

var _ = require('lodash');

var chai = require('chai');
var expect = chai.expect;
var sinonChai = require('sinon-chai');
chai.use(sinonChai);
var Form = require('../../src/form.js');

describe('Form', function () {

  describe('creating a form', function() {
    var form;
    var http;
    var data;

    beforeEach(function() {
      http = sinon.stub();

      data = {
        title: 'New Post',
        fields: [
          { name: 'title', type: 'text', title: 'Title', value: '' },
          { name: 'parent', type: 'hidden', value: '123' }
        ]
      };
      form = new Form(data, http);
    });

    it('has the data properties', function() {
      expect(form.title).to.equal('New Post');
    });

    it('can access fields by name', function() {
     var titleField = form.field('title');
     expect(titleField).to.have.property('type', 'text');
     expect(titleField).to.have.property('title', 'Title');
    });

    describe('form submission', function() {
      var form, http, data, result;

      beforeEach(function() {
        http = sinon.stub();

        data = {
          name: 'create-form',
          method: 'POST',
          href: '/posts',
          fields: [
            { name: 'title', type: 'text', title: 'Title', value: 'First Post!' },
            { name: 'parent', type: 'hidden', value: '123' }
          ]
        };

        // TODO: Need context to handle making relative -> absolute URL.
        form = new Form(data, http);

        result = form.submit();
      });

      it('should request the correct URL', function() {
        expect(http).to.have.been.calledWith(sinon.match({ url: '/posts' }));
      });

      it('should use the correct method', function() {
        expect(http).to.have.been.calledWith(sinon.match({ method: 'POST' }));
      });

      it('should default the content tye', function() {
        expect(http).to.have.been.calledWith(sinon.match({ headers: { 'Content-Type': 'application/x-www-form-urlencoded' }}));
      });

      it('should send the field data', function() {
        expect(http).to.have.been.calledWith(sinon.match({ data: { title: 'First Post!', parent: '123' } }));
      });
    });
  });
});
