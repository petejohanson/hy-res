'use strict';

require('es6-promise').polyfill();

var HyRes = require('../../');

var chai = require('chai');
chai.use(require('chai-things'));
chai.use(require('chai-hy-res'));
chai.use(require('sinon-chai'));
chai.use(require('chai-as-promised'));
var expect = chai.expect;
var _ = require('lodash');

describe('Resource', function () {
  var extensions;

  beforeEach(function() {
    extensions = [new HyRes.HalExtension(), new HyRes.SirenExtension(), new HyRes.LinkHeaderExtension()];
  });

  describe('forms', function() {
    var resource;
    var http;
    var promise;
    var raw = {
      actions: [
        {
          name: 'create-form',
          href: '/posts',
          method: 'POST',
          title: 'New Post',
          fields: [
            { name: 'title', title: 'Title', value: 'First Post!' }
          ]
        },
        {
          name: 'edit-form',
          href: '/posts',
          method: 'POST',
          title: 'New Post',
          fields: [
            { name: 'title', title: 'Title', value: 'First Post!' }
          ]
        },
        {
          name: 'edit-form',
          href: '/posts',
          method: 'POST',
          title: 'New Post',
          fields: [
            { name: 'title', title: 'Title', value: 'First Post!' }
          ]
        }
      ]
    };

    beforeEach(function() {
      http = this.sinon.stub();
      promise = new Promise(function(res) {
        res({
          data: raw,
          headers: { 'content-type': 'application/vnd.siren+json' },
          config: { url: 'http://api.bloggityblog.com/' }
        });
      });

      http
        .withArgs(this.sinon.match({ url: 'http://api.bloggityblog.com/' }))
        .returns(promise);

      resource = new HyRes.Root('http://api.bloggityblog.com/', http, extensions).follow();

      return promise;
    });

    describe('$form', function() {
      describe('for missing name', function() {
        it('does not exist', function() {
          expect(resource.$form('blah')).to.not.exist;
        });
      });

      describe('for valid name', function() {
        it('returns the form based on the name', function() {
          expect(resource.$form('create-form')).to.be.an.instanceof(HyRes.Form);
        });

        it('returns cloned forms', function() {
          expect(resource.$form('create-form')).not.to.equal(resource.$form('create-form'));
        });
      });

      describe('for duplicate named forms', function() {
        it('throws', function() {
          expect(function() { resource.$form('edit-form'); }).to.throw();
        });
      });
    });

    describe('$forms', function() {
      var forms;

      describe('when invoking with a form name', function() {
        beforeEach(function() {
          forms = resource.$forms('create-form');
        });

        it('returns the forms based on the name', function() {
          expect(forms.length).to.equal(1);
          expect(forms[0]).to.be.an.instanceof(HyRes.Form);
        });

        it('returns cloned forms', function() {
          expect(forms[0]).not.to.equal(resource.$forms('create-form')[0]);
        });
      });

      describe('when invoking with no arguments', function() {
        beforeEach(function() {
          forms = resource.$forms();
        });

        it('returns all the forms in the resource', function() {
          expect(forms.length).to.equal(3);
          expect(forms).to.all.be.instanceof(HyRes.Form);
        });

        it('returns forms with the same name', function() {
          expect(_.filter(forms, 'name', 'edit-form').length).to.equal(2);
        });

        it('returns cloned forms', function() {
          expect(forms[0]).not.to.equal(resource.$forms()[0]);
        });
      });
    });

  });

  describe('curies', function() {
    var resource;
    var http;
    var promise;
    var raw = {
      _links: {
        curies: [
          {
            name: 'ea',
            href: 'http://api.co/rels{/rel}',
            templated: true
          }
        ]
      },

      _embedded: {
        item: {
          _links: {
            self: { href: 'http://api.co/item/123' },
            'ea:owner': { href: 'http://api.co/owners/321' }
          }
        }
      }
    };

    beforeEach(function() {
      http = this.sinon.stub();
      promise = new Promise(function(res) {
        res({
          data: raw,
          headers: { 'content-type': 'application/hal+json' },
          config: { url: 'http://api.co/' }
        });
      });

      http
        .withArgs(this.sinon.match({ url: 'http://api.co/' }))
        .returns(promise);

      resource = new HyRes.Root('http://api.co/', http, extensions).follow();

      return promise;
    });

    describe('$followCurie', function() {
      describe('for a known prefix', function() {
        // var ownerDocResolve;
        var ownerDocResource;

        beforeEach(function () {
          var ownerDocPromise = new Promise(function(/*res*/) {
            // ownerDocResolve = res;
          });

          http
            .withArgs(this.sinon.match({url: 'http://api.co/rels/owner' }))
            .returns(ownerDocPromise);

          ownerDocResource = resource.$followCurie('ea:owner');
        });

        it('is an unresolved resource', function() {
          expect(ownerDocResource).to.be.an.unresolved.resource;
        });

        it('calls the correct CURIE URL', function() {
          expect(http).to.be.calledWithMatch({ url: 'http://api.co/rels/owner' });
        });
      });

      describe('for an unknown prefix', function() {
        it('should raise an exception', function() {
          expect(function() { resource.$followCurie('foo:bar'); }).to.throw(Error, 'Unknown CURIE prefix');
        });
      });

      describe('from sub-resources', function() {
        it('uses parent scope', function() {
          // expect(resource.$sub('item').$expandCurie('ea:owner')).to.eql('http://api.co/rels/owner');
        });
      });
    });

    describe('$expandCurie', function() {
      describe('for a known prefix', function() {
        it('returns the expanded URI', function() {
          expect(resource.$expandCurie('ea:find')).to.eql('http://api.co/rels/find');
        });
      });

      describe('for an unknown prefix', function() {
        it('should raise an exception', function() {
          expect(function() { resource.$expandCurie('foo:bar'); }).to.throw(Error, 'Unknown CURIE prefix');
        });
      });

      describe('from sub-resources', function() {
        it('uses parent scope', function() {
          expect(resource.$sub('item').$expandCurie('ea:owner')).to.eql('http://api.co/rels/owner');
        });
      });
    });
  });

  describe('an unresolved root resource', function() {
    var resource;
    var http;
    var ordersPromise, ordersResolve, ordersReject;
    var rawOrder = {
      type:'promo',
      _links:{
        self: { href: '/orders/123'},
        customer: { href: '/customers/321' },
        'customer-search': { href: '/customers/{id}', templated: true },
        'shipping-address': { href: '/address/1234' },
        stores: [
          { href: '/stores/123' },
          { href: '/stores/456' }
        ],
        action: [
          { name: 'new', href: '/orders/123/new' },
          { name: 'edit', href: '/orders/123/edit' }
        ]
      },
      _embedded: {
        payment: {
          amount: '$10.50',
          _links: {
            self: { href: '/orders/123/payment' }
          }
        },
        'shipping-address': {
          street1: '123 Wilkes Lane',
          _links: {
            self: { href: '/address/1234' }
          }
        },
        discounts: [
          {
            type: 'new_user',
            name: 'New User Discount',
            _links: {
              self: { href: '/discounts/123' }
            }
          },
          {
            type: 'seasonal',
            name: 'SPRING20 Coupon Code',
            _links: {
              self: { href: '/discounts/321' }
            }
          }
        ]
      }
    };

    beforeEach(function() {
      http = this.sinon.stub();
      ordersPromise = new Promise(function(res,rej) {
        ordersResolve = res;
        ordersReject = rej;
      });

      http
        .withArgs(this.sinon.match({ url: '/orders/123' }))
        .returns(ordersPromise);

      resource = new HyRes.Root('/orders/123', http, extensions).follow();
    });

    it('is an unresolved resource', function() {
      expect(resource).to.be.an.unresolved.resource;
    });

    describe('$delete-ing it', function() {
      var deleteResp;

      beforeEach(function() {
        deleteResp = resource.$delete();

        ordersResolve({
          data: rawOrder,
          headers: { 'content-type': 'application/hal+json' },
          config: { url: '/orders/123' }
        });

        return deleteResp.$promise;
      });

      it('makes an HTTP DELETE request to the self link relation once the resource resolves', function() {
        expect(http)
          .to.have.been
          .calledWith(this.sinon.match({method: 'DELETE', url: '/orders/123' }));
      });
    });

    describe('a resolved resource', function() {
      beforeEach(function () {
        ordersResolve({
          data: rawOrder,
          headers: { 'content-type': 'application/hal+json' },
          config: { url: '/orders/123' }
        });
        return ordersPromise;
      });

      it('is a resolved resource', function() {
        expect(resource).to.be.a.resolved.resource;
      });

      it('should contain the parsed properties', function () {
        expect(resource.type).to.eql('promo');
      });

      it('should have $response populated', function () {
        expect(resource.$response).to.have.property('data').eql(rawOrder);
      });

      it('should have a null $parent', function() {
        expect(resource.$parent).to.be.null;
      });

      describe('$delete-ing it', function() {
        var deleteResp;

        beforeEach(function() {
          deleteResp = resource.$delete();

          return deleteResp.$promise;
        });

        it('makes an HTTP DELETE request to the self link relation', function() {
          expect(http)
            .to.have.been
            .calledWith(this.sinon.match({method: 'DELETE', url: '/orders/123' }));
        });
      });

      describe('$has', function() {
        it('should return false if not embedded or linked', function() {
          expect(resource.$has('nada')).to.be.false;
        });

        it('should return true if a link is present', function() {
          expect(resource.$has('self')).to.be.true;
        });

        it('should return true if an embedded resource is present', function() {
          expect(resource.$has('payment')).to.be.true;
        });

        it('with a matching link filter object', function() {
          expect(resource.$has('action', { linkFilter: { name: 'edit' } })).to.be.true;
        });

        it('with a non-matching link filter object', function() {
          expect(resource.$has('action', { linkFilter: { name: 'notthere'} })).to.be.false;
        });

        it('with a matching link filter function', function() {
          expect(resource.$has('action', { linkFilter: function(l) { return l.name === 'edit'; } })).to.be.true;
        });

        it('with a non-matching link filter function', function() {
          expect(resource.$has('action', { linkFilter: function(l) { return l.name === 'yargh'; } })).to.be.false;
        });
      });

      describe('$link', function() {
        it('should return the link for single links', function() {
          expect(resource.$link('self').href).to.eql('/orders/123');
        });

        it('should return null for a rel not present', function() {
          expect(resource.$link('blah')).to.be.null;
        });

        it('should throw an exception for a multiple valued rel', function() {
          expect(function() { resource.$link('stores'); }).to.throw();
        });

        it('should use the filter object to select the requested link', function() {
          expect(resource.$link('action', { name: 'edit' })).to.have.property('href', '/orders/123/edit');
        });

        it('should use the filter predicate to select the requested link', function() {
          expect(resource.$link('action', function(l) { return l.name === 'edit'; })).to.have.property('href', '/orders/123/edit');
        });
      });

      describe('$links', function() {
        it('should return the links for single links', function() {
          var links = resource.$links('self');
          expect(links.length).to.eql(1);
          expect(resource.$links('self')[0].href).to.eql('/orders/123');
        });

        it('should return empty array for a rel not present', function() {
          expect(resource.$links('blah')).to.eql([]);
        });

        it('should return an array for multiple links present', function() {
          var links = resource.$links('stores');
          expect(links.length).to.eql(2);
        });

        it('should use the filter object to find matching links', function() {
          var links = resource.$links('action', { name: 'edit' });
          expect(links.length).to.eql(1);
          expect(links[0]).to.have.property('href', '/orders/123/edit');
        });

        it('should use the filter function to find matching links', function() {
          var links = resource.$links('action', function(l) { return l.name === 'edit'; });
          expect(links.length).to.eql(1);
          expect(links[0]).to.have.property('href', '/orders/123/edit');
        });

        it('should return all links when no rel is provided', function() {
          var links = resource.$links();
          expect(links.length).to.be.equal(8);
          expect(links).to.all.be.instanceof(HyRes.WebLink);
          expect(_.find(links, 'rel', 'self')).to.have.property('href', '/orders/123');
          expect(_.filter(links, 'rel', 'stores').length).to.equal(2);
        });
      });

      describe('$sub called when multiple embedded resources present', function() {
        it('should throw an error', function() {
          expect(function() { resource.$sub('discounts'); }).to.throw();
        });
      });

      describe('$sub called with a filter', function() {
        it('should work with a matching object', function() {
          expect(resource.$sub('discounts', { type: 'new_user' })).to.exist;
        });

        it('should work with a matching predicate', function() {
          expect(resource.$sub('discounts', function(r) { return r.type === 'new_user'; })).to.exist;
        });
      });

      describe('embedded resources', function () {
        var payment;
        beforeEach(function () {
          payment = resource.$sub('payment');
        });

        it('is a resolved resource', function() {
          expect(payment).to.be.a.resolved.resource;
        });

        it('should not be null', function () {
          expect(payment).to.not.be.null;
        });

        it('should have $parent set properly', function() {
          expect(payment.$parent).to.eql(resource);
        });

        it('should have the basic properties', function () {
          expect(payment.amount).to.eql('$10.50');
        });

        it('should have the included links', function() {
          expect(payment).to.have.link('self').with.property('href','/orders/123/payment');
        });
      });

      describe('$subs with filtering', function() {
        it('with a match object', function() {
          var discounts = resource.$subs('discounts', { type: 'new_user' });
          expect(discounts.length).to.eql(1);
        });

        it('with a filter function', function() {
          var discounts = resource.$subs('discounts', function(r) { return r.type === 'new_user'; });
          expect(discounts.length).to.eql(1);
        });
      });

      describe('an array of embedded resources', function () {
        var discounts;
        beforeEach(function () {
          discounts = resource.$subs('discounts');
        });

        it('should contain two resources', function () {
          expect(discounts.length).to.eql(2);
        });

        it('should contain resolved resources', function () {
          return expect(discounts).to.all.have.property('$resolved', true);
        });

        it('should have a resolved $promise on the array', function () {
          return expect(discounts.$promise).to.become(discounts);
        });

        it('should have a true $resolved property', function () {
          expect(discounts.$resolved).to.be.true;
        });
      });

      describe('$followOne', function() {
        describe('with a link relation not present', function() {
          it('returns null', function() {
            expect(resource.$followOne('notfound')).to.be.null;
          });
        });

        describe('with a single link relation', function () {

          var customerResource;
          var customerResolve, customerReject;

          beforeEach(function () {
            var customerPromise = new Promise(function(res, rej) {
              customerResolve = res;
              customerReject = rej;
            });

            http
              .withArgs(this.sinon.match({url: '/customers/321' }))
              .returns(customerPromise);

            customerResource = resource.$followOne('customer');
          });

          it('is an unresolved resource', function() {
            expect(customerResource).to.be.an.unresolved.resource;
          });

          describe('and then resolved', function () {
            beforeEach(function () {
              var raw = {
                _links: {
                  self: { href: '/customers/321' }
                },
                name: 'John Wayne'
              };
              customerResolve({
                data: raw,
                headers: { 'content-type': 'application/hal+json' },
                config: { url: '/customers/321' }
              });
              return customerResource.$promise;
            });

            it('is a resolved resource', function() {
              expect(resource).to.be.a.resolved.resource;
            });

            it('should have the raw properties', function () {
              expect(customerResource.name).to.eql('John Wayne');
            });
          });

          describe('and the request has an error', function() {
            beforeEach(function() {
              customerReject({ status: 409, headers: { 'link': '</errors/123>; rel="next"' }, data: {}});
            });

            it('is rejected', function() {
              return expect(customerResource.$promise).to.eventually.be.rejected;
            });

            it('still parses the relevant response information', function() {
              return expect(customerResource.$promise).to.eventually.be.rejected.and.eventually.have.link('next').property('href').eql('/errors/123');
            });

          });
        });

        describe('with a filter object and multiple links', function () {

          var customerResource;

          beforeEach(function () {
            var customerPromise = new Promise(function () {});

            http
              .withArgs(this.sinon.match({url: '/orders/123/new'}))
              .returns(customerPromise);

            customerResource = resource.$followOne('action', { linkFilter: { name: 'new' } });
          });

          it('is an unresolved resource', function () {
            expect(customerResource).to.be.an.unresolved.resource;
          });
        });

        describe('following a link relation when embedded present', function() {
          var shippingResource;

          beforeEach(function() {
            shippingResource = resource.$followOne('shipping-address');
          });

          it('is a resolved resource', function() {
            expect(shippingResource).to.be.a.resolved.resource;
          });

          it ('should have the embedded resource properties', function() {
            expect(shippingResource.street1).to.eql('123 Wilkes Lane');
          });
        });
      });

      describe('$followAll', function() {
        describe('following an link relation that is an array with a filter', function () {
          var actions;

          beforeEach(function () {
            var firstPromise = new Promise(function () {});

            http.withArgs(this.sinon.match({url: '/orders/123/new'})).returns(firstPromise);

            actions = resource.$followAll('action', { linkFilter: { name: 'new' } });
          });

          it('has a false $resolved', function () {
            expect(actions.$resolved).to.be.false;
          });

          it('has a length of 1', function () {
            expect(actions.length).to.eql(1);
          });

          it('is an array of unresolved resources', function () {
            return expect(actions).to.all.have.property('$resolved', false);
          });
        });

        describe('following an link relation that is an array', function () {
          var stores;
          var firstStoreResolved, secondStoreResolved;

          beforeEach(function() {
            var firstPromise = new Promise(function(res) {
              firstStoreResolved = res;
            });

            http.withArgs(this.sinon.match({url: '/stores/123' })).returns(firstPromise);
            var secondPromise = new Promise(function(res) {
              secondStoreResolved = res;
            });

            http.withArgs(this.sinon.match({url: '/stores/456' })).returns(secondPromise);

            stores = resource.$followAll('stores');
          });

          it('has a false $resolved', function() {
            expect(stores.$resolved).to.be.false;
          });

          it('has a length of 2', function() {
            expect(stores.length).to.eql(2);
          });

          it('is an array of unresolved resources', function() {
            return expect(stores).to.all.have.property('$resolved', false);
          });

          describe('when the background requests complete', function() {
            beforeEach(function() {
              firstStoreResolved({data: {}, headers: {}, config: {url: '/stores/123'}});
              secondStoreResolved({data: {}, headers: {}, config: {url: '/stores/456'}});

              return stores.$promise;
            });

            it('has a true $resolved property', function() {
              expect(stores.$resolved).to.be.true;
            });

            it('has a $promise that returns the array that completes', function() {
              return stores.$promise.then(function(s) {
                expect(s[0]).to.equal(stores[0]);
                expect(s[1]).to.equal(stores[1]);
                return s;
              });
            });
          });
        });

        describe('following an link relation with some failures', function () {
          var stores;

          beforeEach(function() {
            var firstPromise = new Promise(function() {});

            http.withArgs(this.sinon.match({url: '/stores/123' })).returns(firstPromise);
            var secondPromise = Promise.reject({
              data: {},
              headers: {},
              status: 404
            });

            http.withArgs(this.sinon.match({url: '/stores/456' })).returns(secondPromise);

            stores = resource.$followAll('stores');
          });

          it('has a rejected $promise', function() {
            return expect(stores.$promise).to.be.rejectedWith(stores);
          });
        });
      });

      describe('following a link object', function() {
        var customerResource;
        var customerResolve;

        beforeEach(function () {
          var customerPromise = new Promise(function(res) {
            customerResolve = res;
          });

          http.withArgs(this.sinon.match({url: '/customers/321' })).returns(customerPromise);

          var link = resource.$link('customer');
          customerResource = link.follow();
        });

        it('is an unresolved resource', function() {
          expect(customerResource).to.be.an.unresolved.resource;
        });

        describe('and then resolved', function() {
          beforeEach(function() {
            var raw = {
              _links: {
                self: { href: '/customers/321' }
              },
              name: 'John Wayne'
            };

            customerResolve({data: raw, headers: {'content-type': 'application/hal+json' }, config: { url: '/customers/321' } });
            return customerResource.$promise;
          });

          it('is a resolved resource', function() {
            expect(customerResource).to.be.a.resolved.resource;
          });

          it('should have the raw properties', function() {
            expect(customerResource.name).to.eql('John Wayne');
          });
        });
      });

      describe('following a templated link relation', function() {
        var customerResource;
        var customerResolve;

        beforeEach(function() {
          http.withArgs(this.sinon.match({ url: '/customers/666' })).returns(new Promise(function(res) {
            customerResolve = res;
          }));

          customerResource = resource.$followOne('customer-search', { data: { id: '666' } });
        });

        it('is an unresolved resource', function() {
          expect(customerResource).to.be.an.unresolved.resource;
        });

        describe('and then resolved', function() {
          beforeEach(function() {
            var raw = {
              _links: {
                self: { href: '/customers/666' }
              },
              name: 'Bruce Lee'
            };

            customerResolve({ data: raw, headers: { 'content-type': 'application/hal+json' }, config: { url: '/orders/123' } });

            return customerResource.$promise;
          });

          it('is a resolved resource', function() {
            expect(customerResource).to.be.a.resolved.resource;
          });

          it('should have the raw properties', function() {
            expect(customerResource.name).to.eql('Bruce Lee');
          });
        });
      });
    });

    describe('a series of $followOne calls', function() {
      var profileResource;
      var profileResolve, customerResolve;

      beforeEach(function() {
        http.withArgs(this.sinon.match({ url: '/customers/321' })).returns(new Promise(function(res) {
          customerResolve = res;
        }));

        http.withArgs(this.sinon.match({ url: '/customers/321/profile' })).returns(new Promise(function(res) {
          profileResolve = res;
        }));

        profileResource = resource.$followOne('customer').$followOne('profile');
      });

      it('is an unresolved resource', function() {
        expect(profileResource).to.be.an.unresolved.resource;
      });

      describe('when the chain resolves', function() {
        beforeEach(function() {
          var rawCustomer = {
            _links: {
              self: { href: '/customers/321' },
              profile: { href: '/customers/321/profile' }
            },
            name: 'John Wayne'
          };

          var rawProfile = {
            _links: {
              self: { href: '/customers/321/profile' }
            },
            location: 'Anytown, USA'
          };

          ordersResolve({ data: rawOrder, headers: { 'content-type': 'application/hal+json' }, config: { url: '/orders/123' } });
          customerResolve({ data: rawCustomer, headers: { 'content-type': 'application/hal+json' }, config: { url: '/customers/321' } });
          profileResolve({ data: rawProfile, headers: { 'content-type': 'application/hal+json' }, config: { url: '/customers/321/profile' } });

          return profileResource.$promise;
        });


        it('is a resolved resource', function() {
          expect(profileResource).to.be.a.resolved.resource;
        });

        it('should have the profile location', function() {
          expect(profileResource.location).to.eql('Anytown, USA');
        });
      });
    });

    describe('a series of $followOne calls with embedded resource', function() {
      var customerResolve;
      var profileResource;

      beforeEach(function() {
        http.withArgs(this.sinon.match({ url: '/customers/321' })).returns(new Promise(function(res) {
          customerResolve = res;
        }));

        profileResource = resource.$followOne('customer').$followOne('profile');
      });

      it('is an unresolved resource', function() {
        expect(profileResource).to.be.an.unresolved.resource;
      });

      describe('when the chain resolves', function() {
        beforeEach(function() {
          var rawCustomer = {
            _links: {
              self: { href: '/customers/321' },
              profile: { href: '/customers/321/profile' }
            },
            _embedded: {
              profile: {
                _links: {
                  self: { href: '/customers/321/profile' }
                },
                location: 'Anytown, USA'
              }
            },
            name: 'John Wayne'
          };

          ordersResolve({ data: rawOrder, headers: { 'content-type': 'application/hal+json' }, config: { url: '/orders/123' } });
          customerResolve({ data: rawCustomer, headers: { 'content-type': 'application/hal+json' }, config: { url: '/customers/321' } });

          return profileResource.$promise;
        });

        it('is a resolved resource', function() {
          expect(profileResource).to.be.a.resolved.resource;
        });

        it('should have the profile location', function() {
          expect(profileResource.location).to.eql('Anytown, USA');
        });
      });
    });

    describe('a $followAll call on an unresolved resource', function() {
      var profileResources;
      var profileResolve, customerResolve;

      beforeEach(function() {
        http.withArgs(this.sinon.match({ url: '/customers/321' })).returns(new Promise(function(res) {
          customerResolve = res;
        }));

        http.withArgs(this.sinon.match({ url: '/customers/321/profile' })).returns(new Promise(function(res) {
          profileResolve = res;
        }));

        profileResources = resource.$followOne('customer').$followAll('profile');
      });

      it('is an unresolved resource', function() {
        expect(profileResources).to.be.an.unresolved.resource;
      });

      describe('when the chain resolves', function() {
        beforeEach(function() {
          var rawCustomer = {
            _links: {
              self: { href: '/customers/321' },
              profile: { href: '/customers/321/profile' }
            },
            name: 'John Wayne'
          };

          var rawProfile = {
            _links: {
              self: { href: '/customers/321/profile' }
            },
            location: 'Anytown, USA'
          };

          ordersResolve({ data: rawOrder, headers: { 'content-type': 'application/hal+json' }, config: { url: '/orders/123' } });
          customerResolve({ data: rawCustomer, headers: { 'content-type': 'application/hal+json' }, config: { url: '/customers/321' } });
          profileResolve({ data: rawProfile, headers: { 'content-type': 'application/hal+json' }, config: { url: '/customers/321/profile' } });

          return profileResources.$promise;
        });

        it('is a resolved resource', function() {
          expect(profileResources).to.be.a.resolved.resource;
        });

        it('should have the profile location', function() {
          expect(profileResources[0].location).to.eql('Anytown, USA');
        });
      });

      describe('when the request has an error', function() {
        beforeEach(function() {
          ordersReject({ status: 400, headers: {}, data: {}});
        });

        it('is rejected', function() {
          return expect(profileResources.$promise).to.eventually.be.rejected;
        });

      });
    });

    describe('a $followAll call on an unresolved resource with embedded items', function() {
      var profileResources;
      var customerResolve;

      beforeEach(function() {
        http.withArgs(this.sinon.match({ url: '/customers/321' })).returns(new Promise(function(res) {
          customerResolve = res;
        }));

        profileResources = resource.$followOne('customer').$followAll('profile');
      });

      it('is an unresolved resource', function() {
        expect(profileResources).to.be.an.unresolved.resource;
      });

      describe('when the chain resolves', function() {
        beforeEach(function() {
          var rawCustomer = {
            _links: {
              self: { href: '/customers/321' },
              profile: { href: '/customers/321/profile' }
            },
            _embedded: {
              profile: {
                _links: {
                  self: { href: '/customers/321/profile' }
                },
                location: 'Anytown, USA'
              }
            },
            name: 'John Wayne'
          };
          ordersResolve({ data: rawOrder, headers: { 'content-type': 'application/hal+json' }, config: { url: '/orders/123' } });
          customerResolve({ data: rawCustomer, headers: { 'content-type': 'application/hal+json' }, config: { url: '/customers/321' } });

          return profileResources.$promise;
        });

        it('is a resolved resource', function() {
          expect(profileResources).to.be.a.resolved.resource;
        });

        it('should have the profile location', function() {
          expect(profileResources[0].location).to.eql('Anytown, USA');
        });
      });
    });
  });
});
