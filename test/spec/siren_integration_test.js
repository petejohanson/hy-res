'use strict';

var HyRes = require('../../');

require('es6-promise').polyfill();

var chai = require('chai');
var chaiAsPromised= require('chai-as-promised');
chai.use(chaiAsPromised);

var expect = chai.expect;

var axios = require('axios');

describe('Siren + axios to perform an action', function() {
  var root;

  beforeEach(function() {
    var rootLink = new HyRes.Root('http://127.0.0.1:10000/', axios, [new HyRes.SirenExtension(), new HyRes.JsonExtension()]);

    root = rootLink.follow();
    return root.$promise;
  });

  it('is resolved', function() {
    expect(root.$resolved).to.be.true;
  });

  it('has a self link', function() {
    expect(root.$has('self')).to.be.true;
  });

  describe('Submitting a GET query form', function() {
    var form, response;

    beforeEach(function() {
      form = root.$form('search');
      form.field('q').value = 'hy-res';

      response = form.submit();

      return response;
    });

    it('is succeeds', function() {
      return expect(response.$promise).to.eventually.have.property('$resolved', true);
    });

    it('has the response values', function() {
      return expect(response.$promise).to.eventually.have.deep.property('q', 'hy-res');
    });
  });

  describe('Submitting a application/x-www-form-urlencoded form', function() {
    var form, response;

    beforeEach(function() {
      form = root.$form('create-form');
      form.field('title').value = 'First Post!';
      form.field('post').value = 'hy-res rocks!';

      response = form.submit();

      return response;
    });

    it('is succeeds', function() {
      return expect(response.$promise).to.eventually.have.property('$resolved', true);
    });

    it('has the response values', function() {
      return expect(response.$promise).to.eventually.have.deep.property('title', 'First Post!');
    });
  });

  describe('Submitting an application/json form', function() {
    var form, response;

    beforeEach(function() {
      form = root.$form('edit-form-json');
      form.field('post').value = 'hy-res really rocks!';

      response = form.submit();

      return response;
    });

    it('is succeeds', function() {
      return expect(response.$promise).to.eventually.have.property('$resolved', true);
    });

    it('has the response values', function() {
      return expect(response.$promise).to.eventually.have.deep.property('post', 'hy-res really rocks!');
    });
  });

  describe('Submitting a multipart/form-data form', function() {
    var form, response;

    beforeEach(function() {
      form = root.$form('edit-form');
      form.field('post').value = 'hy-res really rocks!';

      response = form.submit();

      return response;
    });

    it('is succeeds', function() {
      return expect(response.$promise).to.eventually.have.property('$resolved', true);
    });

    it('has the response values', function() {
      return expect(response.$promise).to.eventually.have.property('title', 'First Post!');
    });
  });
});

