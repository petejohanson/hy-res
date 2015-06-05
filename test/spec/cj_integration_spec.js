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
});

