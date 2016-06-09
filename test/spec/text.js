'use strict';

require('es6-promise').polyfill();

var TextExtension = require('../../src/text');
var chai = require('chai');
chai.use(require('chai-things'));
chai.use(require('chai-hy-res'));
var expect = chai.expect;

describe('TextExtension', function () {
  describe('with explicit media types', function() {
    var addlSubType = 'rtf';
    var extension;

    beforeEach(function() {
      extension = new TextExtension({ subTypes: [addlSubType] });
    });

    describe('extension applicability', function() {
      it('should apply to text/plain content type', function() {
        expect(extension.applies({}, { 'content-type': 'text/plain' }, 200)).to.be.true;
      });

      it('should apply to text/plain content type with params', function() {
        expect(extension.applies({}, { 'content-type': 'text/plain; charset=utf-8' }, 200)).to.be.true;
      });

      it('should apply to additional media type', function() {
        expect(extension.applies({}, { 'content-type': 'text/' + addlSubType }, 200)).to.be.true;
      });

      it('should not apply to 204 No Content responses', function() {
        expect(extension.applies({}, {}, 204)).to.be.false;
      });
    });

    describe('data parser', function() {
      it('should return the response data in the \'text\' property', function() {
        var data = extension.dataParser('This is the text', {});

        expect(data).to.deep.include.members([
          {name: 'text', value: 'This is the text' }
        ]);
      });
    });

    it('should have standard and custom media types', function() {
      expect(extension.mediaTypes).to.eql(['text/plain', 'text/' + addlSubType]);
    });
  });

  describe('with wildcard mode', function() {
    var extension;

    beforeEach(function() {
      extension = new TextExtension({ wildcard: true });
    });

    describe('extension applicability', function() {
      it('should apply to text/plain content type', function() {
        expect(extension.applies({}, { 'content-type': 'text/plain' }, 200)).to.be.true;
      });

      it('should apply to text/plain content type with params', function() {
        expect(extension.applies({}, { 'content-type': 'text/plain; charset=utf-8' }, 200)).to.be.true;
      });

      it('should apply to text/rtf content type', function() {
        expect(extension.applies({}, { 'content-type': 'text/rtf' }, 200)).to.be.true;
      });

      it('should not apply to 204 No Content responses', function() {
        expect(extension.applies({}, {}, 204)).to.be.false;
      });

      it('should apply to text/xml content type', function() {
        expect(extension.applies({}, { 'content-type': 'text/xml' }, 200)).to.be.true;
      });
    });

    it('should have the wildcard text media type', function() {
      expect(extension.mediaTypes).to.eql(['text/*']);
    });
  });
});
