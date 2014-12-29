/**
 * Created by peter on 9/18/14.
 */
'use strict';

var expect = require('chai').expect;

module.exports.unresolvedResourceBehavior = function(context) {
  describe('(shared unresolved resource)', function() {
    beforeEach(function() {
      this.resource = context.resource;
    });

    it('should not be $resolved', function() {
      expect(this.resource.$resolved).to.be.false();
    });

    it('should have a $promise', function() {
      expect(this.resource.$promise).not.to.be.null();
    });

    it('should not have an $error', function() {
      expect(this.resource.$error).to.be.null();
    });
  });
};

module.exports.resolvedResourceBehavior = function(context) {
  describe('(shared resolved resource)', function() {
    beforeEach(function() {
      this.resource = context.resource;
    });

    it('should be $resolved', function() {
      expect(this.resource.$resolved).to.be.true();
    });

    it('should not have an $error', function() {
      expect(this.resource.$error).to.be.null();
    });

    it('should have a completed promise', function() {
      var res = this.resource;
      return this.resource.$promise.then(function(r) {
        expect(res).to.equal(r);
        return r;
      });
    });
  });
};
