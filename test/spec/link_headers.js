'use strict';

require('es6-promise').polyfill();
var LinkHeaderExtension = require('../../src/link_header.js');
var Context = require('../../src/context.js');

var expect = require('chai').expect;

describe('LinkHeaderExtension', function () {
  var ext;
  var http;

  beforeEach(function() {
    http = sinon.mock();
    ext = new LinkHeaderExtension();
  });

  describe('extension applicability', function() {
    it('should apply when Link header(s) found', function() {
      expect(ext.applies({}, { 'link': '</posts?page=2>; rel=next' })).to.be.true;
    });

    it('should not apply with no Link headers found', function() {
      expect(ext.applies({}, { })).to.be.false;
    });
  });

  describe('links parser', function() {
    var links;

    beforeEach(function() {
      links = ext.linkParser({}, { 'link': '</posts?page=3>; rel=next, </posts?page=1>; rel="prev"' }, new Context(http));
    });

    it('should return the links', function() {
      expect(links.next[0].href).to.equal('/posts?page=3');
      expect(links.prev[0].href).to.equal('/posts?page=1');
    });

    describe('following a link', function() {
      it('should GET the expected URL', function() {
          http.once()
              .withArgs(sinon.match({ url: '/posts?page=3' }))
              .returns(Promise.resolve({data: {}, headers: {}}));

          links.next[0].follow();
          http.verify();
      });
    });
  });

  describe('parsing multiple links with the same rel', function() {
    var links;
    beforeEach(function() {
      links = ext.linkParser({}, { 'link':  '</posts?page=1>; rel="section"; title="Page 1", </posts?page=2>; rel="section"; title="Page 2"' }, new Context(http));
    });

    it('has the first link', function() {
      expect(links.section[0].href).to.eql('/posts?page=1');
      expect(links.section[0].title).to.eql('Page 1');
    });

    it('has the second link', function() {
      expect(links.section[1].href).to.eql('/posts?page=2');
      expect(links.section[1].title).to.eql('Page 2');
    });
  });
});
