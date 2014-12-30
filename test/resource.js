'use strict';


var HyRes = require('../src/hy_res');

var resourceAssertions = require('./resource_assertions');
var sinon = require('sinon');
var expect = require('chai').expect;
var _ = require('lodash');

describe('Resource', function () {
  var extensions;

  beforeEach(function() {
    extensions = [new HyRes.HalExtension()];
  });

  describe('an unresolved root resource', function() {
    var context = {};
    var resource;
    var http;
    var ordersPromise, ordersResolve;
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
            name: 'New User Discount',
            _links: {
              self: { href: '/discounts/123' }
            }
          },
          {
            name: 'SPRING20 Coupon Code',
            _links: {
              self: { href: '/discounts/321' }
            }
          }
        ]
      }
    };

    beforeEach(function() {
      http = sinon.stub();
      ordersPromise = new Promise(function(res,rej) {
        ordersResolve = res;
      });
      http.withArgs(sinon.match({ url: '/orders/123' })).returns(ordersPromise);
      resource = new HyRes.Root('/orders/123', http, extensions).follow();
      context.resource = resource;
    });

    resourceAssertions.unresolvedResourceBehavior(context);

    describe('a resolved resource', function() {
      beforeEach(function () {
        ordersResolve({ data: rawOrder, headers: { 'content-type': 'application/hal+json' } });
        return ordersPromise;
      });

      resourceAssertions.resolvedResourceBehavior(context);

      it('should contain the parsed properties', function () {
        expect(resource.type).to.eql('promo');
      });

      describe('$has', function() {
        it('should return false if not embedded or linked', function() {
          expect(resource.$has('nada')).to.be.false();
        });

        it('should return true if a link is present', function() {
          expect(resource.$has('self')).to.be.true();
        });

        it('should return true if an embedded resource is present', function() {
          expect(resource.$has('payment')).to.be.true();
        });
      });

      describe('$link', function() {
        it('should return the link for single links', function() {
          expect(resource.$link('self').href).to.eql('/orders/123');
        });

        it('should return null for a rel not present', function() {
          expect(resource.$link('blah')).to.be.null();
        });

        it('should throw an exception for a multiple valued rel', function() {
          expect(function() { resource.$link('stores'); }).to.throw();
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
      });

      describe('embedded resources', function () {
        var payment;
        beforeEach(function () {
          payment = resource.$sub('payment');
          context.resource = payment;
        });

        resourceAssertions.resolvedResourceBehavior(context);

        it('should not be null', function () {
          expect(payment).to.not.be.null();
        });

        it('should have the basic properties', function () {
          expect(payment.amount).to.eql('$10.50');
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
          for (var r in discounts) {
            context.resource = r;
            resourceAssertions.resolvedResourceBehavior(context);
          }
        });

        it('should have a resolved $promise on the array', function () {
          return discounts.$promise.then(function (a) {
            expect(a).to.eql(discounts);
            return a;
          });
        });

        it('should have a true $resolved property', function () {
          expect(discounts.$resolved).to.be.true();
        });
      });

      describe('$followOne', function() {
        describe('with a single link relation', function () {

          var customerResource;
          var customerResolve;

          beforeEach(function () {
            var customerPromise = new Promise(function(res,rej) {
              customerResolve = res;
            });

            http.withArgs(sinon.match({url: '/customers/321' })).returns(customerPromise);

            customerResource = resource.$followOne('customer');
            context.resource = customerResource;
          });

          resourceAssertions.unresolvedResourceBehavior(context);

          describe('and then resolved', function () {
            beforeEach(function () {
              var raw = {
                _links: {
                  self: { href: '/customers/321' }
                },
                name: 'John Wayne'
              };
              customerResolve({data: raw, headers: { 'content-type': 'application/hal+json' } });
              return customerResource.$promise;
            });

            resourceAssertions.resolvedResourceBehavior(context);

            it('should have the raw properties', function () {
              expect(customerResource.name).to.eql('John Wayne');
            });
          });
        });

        describe('following a link relation when embedded present', function() {
          var shippingResource;

          beforeEach(function() {
            shippingResource = resource.$followOne('shipping-address');
            context.resource = shippingResource;
          });

          resourceAssertions.resolvedResourceBehavior(context);

          it ('should have the embedded resource properties', function() {
            expect(shippingResource.street1).to.eql('123 Wilkes Lane');
          });
        });
      });

      describe('$followAll', function() {
        describe('following an link relation that is an array', function () {
          var stores;
          var requestsPromise;
          var firstStoreResolved, secondStoreResolved;

          beforeEach(function() {
            var firstPromise = new Promise(function(res,rej) {
              firstStoreResolved = res;
            });

            http.withArgs(sinon.match({url: '/stores/123' })).returns(firstPromise);
            var secondPromise = new Promise(function(res,rej) {
              secondStoreResolved = res;
            });

            http.withArgs(sinon.match({url: '/stores/456' })).returns(secondPromise);

            requestsPromise = Promise.all([firstPromise, secondPromise]);
            stores = resource.$followAll('stores');
          });

          it('has a false $resolved', function() {
            expect(stores.$resolved).to.be.false();
          });

          it('has a length of 2', function() {
            expect(stores.length).to.eql(2);
          });

          it('is an array of unresolved resources', function() {
            _.forEach(stores, function(s) {
              expect(s.$resolved).to.be.false();
              expect(s.$error).to.be.null();
            });
          });

          describe('when the background requests complete', function() {
            beforeEach(function() {
              firstStoreResolved({data: {}, headers: {}});
              secondStoreResolved({data: {}, headers: {}});

              return stores.$promise;
            });

            it('has a true $resolved property', function() {
              expect(stores.$resolved).to.be.true();
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
      });

      describe('following a link object', function() {
        var customerResource;
        var customerResolve;

        beforeEach(function () {
          var customerPromise = new Promise(function(res,rej) {
            customerResolve = res;
          });

          http.withArgs(sinon.match({url: '/customers/321' })).returns(customerPromise);

          var link = resource.$link('customer');
          customerResource = link.follow();
          context.resource = customerResource;
        });

        resourceAssertions.unresolvedResourceBehavior(context);

        describe('and then resolved', function() {
          beforeEach(function() {
            var raw = {
              _links: {
                self: { href: '/customers/321' }
              },
              name: 'John Wayne'
            };

            customerResolve({data: raw, headers: {'content-type': 'application/hal+json' }});
            return customerResource.$promise;
          });

          resourceAssertions.resolvedResourceBehavior(context);

          it('should have the raw properties', function() {
            expect(customerResource.name).to.eql('John Wayne');
          });
        });
      });

      describe('following a templated link relation', function() {
        var customerResource;
        var customerResolve;

        beforeEach(function() {
          http.withArgs(sinon.match({ url: '/customers/666' })).returns(new Promise(function(res,rej) {
            customerResolve = res;
          }));

          customerResource = resource.$followOne('customer-search', { data: { id: '666' } });
          context.resource = customerResource;
        });

        resourceAssertions.unresolvedResourceBehavior(context);

        describe('and then resolved', function() {
          beforeEach(function() {
            var raw = {
              _links: {
                self: { href: '/customers/666' }
              },
              name: 'Bruce Lee'
            };

            customerResolve({ data: raw, headers: { 'content-type': 'application/hal+json' } });

            return customerResource.$promise;
          });

          resourceAssertions.resolvedResourceBehavior(context);

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
        http.withArgs(sinon.match({ url: '/customers/321' })).returns(new Promise(function(res, rej) {
          customerResolve = res;
        }));

        http.withArgs(sinon.match({ url: '/customers/321/profile' })).returns(new Promise(function(res, rej) {
          profileResolve = res;
        }));

        profileResource = resource.$followOne('customer').$followOne('profile');
        context.resource = profileResource;
      });

      resourceAssertions.unresolvedResourceBehavior(context);

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

          ordersResolve({ data: rawOrder, headers: { 'content-type': 'application/hal+json' } });
          customerResolve({ data: rawCustomer, headers: { 'content-type': 'application/hal+json' } });
          profileResolve({ data: rawProfile, headers: { 'content-type': 'application/hal+json' } });

          return profileResource.$promise;
        });


        resourceAssertions.resolvedResourceBehavior(context);

        it('should have the profile location', function() {
          expect(profileResource.location).to.eql('Anytown, USA');
        });
      });
    });

    describe('a series of $followOne calls with embedded resource', function() {
      var customerResolve;
      var profileResource;

      beforeEach(function() {
        http.withArgs(sinon.match({ url: '/customers/321' })).returns(new Promise(function(res, rej) {
          customerResolve = res;
        }));

        profileResource = resource.$followOne('customer').$followOne('profile');
        context.resource = profileResource;
      });

      resourceAssertions.unresolvedResourceBehavior(context);

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

          ordersResolve({ data: rawOrder, headers: { 'content-type': 'application/hal+json' } });
          customerResolve({ data: rawCustomer, headers: { 'content-type': 'application/hal+json' } });

          return profileResource.$promise;
        });

        resourceAssertions.resolvedResourceBehavior(context);

        it('should have the profile location', function() {
          expect(profileResource.location).to.eql('Anytown, USA');
        });
      });
    });

    describe('a $followAll call on an unresolved resource', function() {
      var profileResources;
      var profileResolve, customerResolve;

      beforeEach(function() {
        http.withArgs(sinon.match({ url: '/customers/321' })).returns(new Promise(function(res, rej) {
          customerResolve = res;
        }));

        http.withArgs(sinon.match({ url: '/customers/321/profile' })).returns(new Promise(function(res, rej) {
          profileResolve = res;
        }));

        profileResources = resource.$followOne('customer').$followAll('profile');
        context.resource = profileResources;
      });

      resourceAssertions.unresolvedResourceBehavior(context);

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

          ordersResolve({ data: rawOrder, headers: { 'content-type': 'application/hal+json' } });
          customerResolve({ data: rawCustomer, headers: { 'content-type': 'application/hal+json' } });
          profileResolve({ data: rawProfile, headers: { 'content-type': 'application/hal+json' } });

          return profileResources.$promise;
        });

        resourceAssertions.resolvedResourceBehavior(context);

        it('should have the profile location', function() {
          expect(profileResources[0].location).to.eql('Anytown, USA');
        });
      });
    });

    describe('a $followAll call on an unresolved resource with embedded items', function() {
      var profileResources;
      var customerResolve;

      beforeEach(function() {
        http.withArgs(sinon.match({ url: '/customers/321' })).returns(new Promise(function(res, rej) {
          customerResolve = res;
        }));

        profileResources = resource.$followOne('customer').$followAll('profile');
        context.resource = profileResources;
      });

      resourceAssertions.unresolvedResourceBehavior(context);

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
          ordersResolve({ data: rawOrder, headers: { 'content-type': 'application/hal+json' } });
          customerResolve({ data: rawCustomer, headers: { 'content-type': 'application/hal+json' } });

          return profileResources.$promise;
        });

        resourceAssertions.resolvedResourceBehavior(context);

        it('should have the profile location', function() {
          expect(profileResources[0].location).to.eql('Anytown, USA');
        });
      });
    });
  });
});
