'use strict';

require('es6-promise').polyfill();
var _ = require('lodash');
var LinkCollection = require('../../src/link_collection.js');

var chai = require('chai');
chai.use(require('chai-as-promised'));
var expect = chai.expect;

describe('LinkCollection', function () {

  describe('following a link collection with failures', function() {
    var collection, res;

    beforeEach(function() {
      var linkRes = {
        follow: _.constant({ $promise: Promise.reject('oh no')})
      };

      collection = LinkCollection.fromArray([linkRes]);

      res = collection.follow();
    });

    it('should eventually be rejected w/ the error from the failed link', function() {
      return expect(res.$promise).to.eventually.be.rejectedWith('oh no');
    });

    it('should have the $error set', function() {
      return expect(res.$promise).to.eventually.be.rejected.then(function() {
        expect(res.$error).to.equal('oh no');
      });
    });
  });
});

