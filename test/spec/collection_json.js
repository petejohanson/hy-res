'use strict';

var _ = require('lodash');
var Context = require('../../src/context');
var CollectionJsonExtension = require('../../src/collection_json');
var chai = require('chai');
chai.use(require('chai-hy-res'));
chai.use(require('sinon-chai'));
var expect = chai.expect;

describe('CollectionJsonExtension', function () {
  var addlMediaType = 'application/vnd.co.format+json';
  var extension;

  beforeEach(function() {
    extension = new CollectionJsonExtension([addlMediaType]);
  });

  describe('extension applicability', function() {
    it('should apply to application/vnd.collection+json content type', function() {
      expect(extension.applies({}, { 'content-type': 'application/vnd.collection+json' }, 200)).to.be.true;
    });

    it('should apply to application/vnd.collection+json content type with params', function() {
      expect(extension.applies({}, { 'content-type': 'application/vnd.collection+json; charset=utf-8' }, 200)).to.be.true;
    });
    it('should apply to additional media type', function() {
      expect(extension.applies({}, { 'content-type': addlMediaType }, 200)).to.be.true;
    });

    it('should not apply to 204 No Content responses', function() {
      expect(extension.applies({}, {}, 204)).to.be.false;
    });
  });

  describe('links parser', function() {
    var links;
    beforeEach(function() {
      links = extension.linkParser(
        { 'collection' :
          {
            'version' : '1.0',
            'href' : 'http://example.org/friends/',

            'links' : [
              {'rel' : 'feed', 'href' : 'http://example.org/friends/rss'},
              {'rel' : 'queries', 'href' : 'http://example.org/friends/queries'}
            ]
          }
        }, {}, {}, {});
    });

    it('should include the href as the self link', function() {
      expect(links.self).to.exist;
      expect(links.self).to.have.property('length', 1);
      expect(links.self[0].href).to.equal('http://example.org/friends/');
    });

    it('should include the links for the collection', function() {
      expect(links.feed[0]).to.have.property('href', 'http://example.org/friends/rss');
      expect(links.queries[0]).to.have.property('href', 'http://example.org/friends/queries');
    });
  });

  describe('embedded parser', function() {
    var http, embeds;
    beforeEach(function() {
      http = sinon.stub();
      embeds = extension.embeddedParser(
        { 'collection' :
          {
            'version' : '1.0',
            'href' : 'http://example.org/friends/',

            'items' : [
              {
                'href' : 'http://example.org/friends/jdoe',
                'data' : [
                  {'name' : 'full-name', 'value' : 'J. Doe', 'prompt' : 'Full Name'},
                  {'name' : 'email', 'value' : 'jdoe@example.org', 'prompt' : 'Email'}
                ],
                'links' : [
                  {'rel' : 'blog', 'href' : 'http://examples.org/blogs/jdoe', 'prompt' : 'Blog'},
                  {'rel' : 'avatar', 'href' : 'http://examples.org/images/jdoe', 'prompt' : 'Avatar', 'render' : 'image'}
                ]
              },

              {
                'href' : 'http://example.org/friends/msmith',
                'data' : [
                  {'name' : 'full-name', 'value' : 'M. Smith', 'prompt' : 'Full Name'},
                  {'name' : 'email', 'value' : 'msmith@example.org', 'prompt' : 'Email'}
                ],
                'links' : [
                  {'rel' : 'blog', 'href' : 'http://examples.org/blogs/msmith', 'prompt' : 'Blog'},
                  {'rel' : 'avatar', 'href' : 'http://examples.org/images/msmith', 'prompt' : 'Avatar', 'render' : 'image'}
                ]
              }
            ],

            'template' : {
              'data' : [
                {'name' : 'full-name', 'value' : '', 'prompt' : 'Full Name'},
                {'name' : 'email', 'value' : '', 'prompt' : 'Email'},
                {'name' : 'blog', 'value' : '', 'prompt' : 'Blog'},
                {'name' : 'avatar', 'value' : '', 'prompt' : 'Avatar'}

              ]
            }
          }
        }, {}, new Context(http, [extension]));
    });

    it('should return the items using the "item" link relation', function() {
      expect(embeds.item).to.have.property('length', 2);
    });

    it('should return the proper self link for each item', function() {
      expect(embeds.item[0]).to.have.link('self').with.property('href', 'http://example.org/friends/jdoe');
      expect(embeds.item[1]).to.have.link('self').with.property('href', 'http://example.org/friends/msmith');
    });

    it('should have the other links for the items', function() {
      expect(embeds.item[0]).to.have.link('blog').with.property('href', 'http://examples.org/blogs/jdoe');
    });

    it('should have the data fields for the items', function() {
      expect(embeds.item[0]).to.have.property('full-name', 'J. Doe');
    });

    describe('the edit-form form for the embedded item', function () {
      var editForm;
      beforeEach(function() {
        http.returns(Promise.resolve({data: {}, headers: {}, status: 204}));
        editForm = embeds.item[0].$form('edit-form');
      });

      it('should contain the edit-form', function() {
        expect(editForm).to.exist;
      });

      it('should have the item fields populated', function() {
        expect(editForm.field('full-name')).to.have.property('value', 'J. Doe');
        expect(editForm.field('email')).to.have.property('value', 'jdoe@example.org');
      });

      it('should include the template fields not already defined for that item', function() {
        expect(editForm.field('avatar')).to.exist;
        expect(editForm.field('blog')).to.exist;
      });

      describe('submitting the edit-form', function() {
        var resp;
        beforeEach(function() {
          editForm.field('full-name').value = 'John Doe';
          resp = editForm.submit();

          return resp.$promise;
        });

        it('makes an HTTP PUT to the item URL with the field data', function() {
          expect(http).to.have.been.calledWith(sinon.match(
            {
              url: 'http://example.org/friends/jdoe',
              method: 'PUT',
              headers: { 'Content-Type': 'application/vnd.collection+json' },
              data: { 'full-name': 'John Doe', email: 'jdoe@example.org' }
            }
          ));
        });
      });
    });
  });

  describe('data parser', function() {
    it('should return the data array', function() {
      var data = extension.dataParser({
        'href' : 'http://example.org/friends/msmith',
        'data' : [
          {'name' : 'full-name', 'value' : 'M. Smith', 'prompt' : 'Full Name'},
          {'name' : 'email', 'value' : 'msmith@example.org', 'prompt' : 'Email'}
        ],
        'links' : [
          {'rel' : 'blog', 'href' : 'http://examples.org/blogs/msmith', 'prompt' : 'Blog'},
          {'rel' : 'avatar', 'href' : 'http://examples.org/images/msmith', 'prompt' : 'Avatar', 'render' : 'image'}
        ]
      }, {});

      expect(data).to.deep.include.members([
          {'name' : 'full-name', 'value' : 'M. Smith', 'prompt' : 'Full Name'},
          {'name' : 'email', 'value' : 'msmith@example.org', 'prompt' : 'Email'}
      ]);
    });
  });

  describe('form parser', function() {
    var forms;

    beforeEach(function() {
      forms = extension.formParser({
        'collection': {
          items: [
            {
              href: '/friends/jdoe',
              data: [
                { name: 'name', value: 'John Doe' },
                { name: 'email', value: 'jdoe@jdoe.com' }
              ]
            }
          ],
          'queries' : [
            {
              'rel' : 'search',
              'href' : 'http://example.org/friends/search',
              'prompt' : 'Search',
              'data' : [
                {'name' : 'search', 'value' : 'default search'}
              ]
            }
          ]
        }
      }, {}, new Context({}, [extension]));
    });

    it('creates forms for the included queries', function() {
      expect(forms.search).to.have.property('length', 1);
      expect(forms.search[0]).to.exist;
      expect(forms.search[0].href).to.equal('http://example.org/friends/search');
      expect(forms.search[0].method).to.equal('GET');
      expect(forms.search[0].prompt).to.equal('Search');
      expect(forms.search[0].field('search')).to.have.property('value', 'default search');
    });

    describe('item creation form', function() {
      beforeEach(function() {
        forms = extension.formParser({
          collection: {
            href: '/posts',
            template : {
              data: [
                { name: 'title', prompt: 'Post Title' },
                { name: 'post', prompt: 'Post Content' }
              ]
            }
          }
        }, {}, {});
      });

      it('includes actions for template for item creation', function() {
        expect(_.get(forms, 'create-form[0]')).to.exist;
      });

      describe('the item creation form', function() {
        var form;
        beforeEach(function() {
          form = _.get(forms, 'create-form[0]');
        });

        it('has the collection href', function() {
          expect(form.href).to.equal('/posts');
        });

        it('has a method of POST', function() {
          expect(form.method).to.equal('POST');
        });

        it('has a type of application/vnd.collection+json', function() {
          expect(form.type).to.equal('application/vnd.collection+json');
        });

        it('has the included fields', function() {
          expect(form.fields).to.deep.include.members([
            { name: 'title', prompt: 'Post Title' },
            { name: 'post', prompt: 'Post Content' }
          ]);
        });
      });
    });
  });

  it('should have standard and custom media types', function() {
    expect(extension.mediaTypes).to.eql(['application/vnd.collection+json', addlMediaType]);
  });
});
