'use strict';

var _ = require('lodash');
var Context = require('./context');
var LinkCollection = require('./link_collection');

/**
 * @constructor
 *
 * @classdesc
 * {@link Resource} instaces behave like AngularJS' `ngResource`, in that
 * resources are returned directly from calls, and the values in the resource
 * will be merged into the object once the background request(s) complete.
 * Doing so allows a view layer to directly bind to the resource fields. Should
 * you need to do something once the resource is loaded, the `$promise`
 * property of the resource is available.
 *
 * {@link Resource} offers several functions you can use to interact with links,
 * embedded resources, and forms included in the resource.
 */
var Resource = function() {
  /**
   * This property is a ES6 promise that can be used to perform work once the
   * resource is resolved. For resources that were embedded, the promise may already
   * resolved when the resource is initially created.
   * @type {Promise}
   */
  this.$promise = null;

  /**
   * This property is a simple boolean `true/false` value indicating whether
   * the specific resource has been resolved or not.
   * @type {boolean}
   */
  this.$resolved = false;

  /**
   * If there is a problem resolving the {@link Resource}, this will contain
   * the error information.
   */
  this.$error = null;

  this.$$links = {};
  this.$$embedded = {};
  this.$$forms = {};

  /**
   * Get the single {@link WebLink} for the given relation.
   *
   * @arg {string} rel The link relation to look up.
   * @returns {WebLink} The link with the given link relation, or null if not found.
   * @throws An error if multiple links are present for the link relation.
   * @example
   * res.$link('next')
   * => WebLink { href: '/posts?page=2' }
   */
  this.$link = function(rel) {
    var ret = this.$links(rel);
    if (ret.length === 0) {
      return null;
    }
    if (ret.length > 1) {
      throw 'Multiple links present';
    }

    return ret[0];
  };

  /**
   * Return a {@link LinkCollection} for the given link relation.
   *
   * @arg {string} [rel] The link relation to look up. If not provided, all
   * links in the resource will be return.
   * @returns {LinkCollection} The links with the given link relation, or
   * all the links in the resource if a rel is not provided.
   * @example
   * res.$links('posts')
   * => LinkCollection [ WebLink { href: '/posts/123' }, WebLink { href: '/posts/345' } ]
   */
  this.$links = function(rel) {
    if (!rel) {
      return LinkCollection.fromArray(_.flatten(_.values(this.$$links)));
    }

    return _.get(this.$$links, rel, []);
  };

  /**
   * Get the single {@link Form} for the given relation. The returned form
   * is a cloned copy of the {@link Form} in the resource. Each call to
   * this function will return a new copy, so that multiple forms can be
   * created, modified, and submitted without reloading the containing
   * {@link Resource}.
   *
   * @arg {string} rel The link relation to look up.
   * @returns {Form} The copy of form with the given link relation, or null if not found.
   * @throws An error if multiple forms are present for the link relation.
   * @example
   * res.$form('create-form')
   * => Form { href: '/posts?page=2', method: 'POST', ... }
   */
  this.$form = function(rel) {
    var ret = _.get(this.$$forms, rel, []);

    if (ret.length === 0) {
      return null;
    }

    if (ret.length > 1) {
      throw 'Multiple forms present';
    }

    return ret[0].clone();
  };

  /**
   * Get the {@link Form} instances for the given relation. The returned forms
   * are a cloned copy of the {@link Form} instances in the resource. Each call
   * to this function will return new copies, so that multiple forms can be
   * created, modified, and submitted without reloading the containing
   * {@link Resource}.
   *
   * @arg {string} [rel] The link relation to look up. If omitted, returns all forms in the resource.
   * @returns {Array} An array of cloned forms, or an empty array if not found.
   * @example
   * res.$forms('create-form')
   * => [Form { href: '/posts?page=2', method: 'POST', ... }]
   * @example
   * res.$forms()
   * => [Form { href: '/posts?page=2, 'method: 'POST", ... }]
   */
  this.$forms = function(rel) {
    if (!rel) {
      return _.invoke(_.flatten(_.values(this.$$forms)), 'clone');
    }

    return _.invoke(_.get(this.$$forms, rel, []), 'clone');
  };

  /**
   * Follows a link relation, if present.  The link relation will be looked for
   * in the embedded resources first, and fall back to checking for the
   * presence of a link and loading those. Depending on whether an embedded
   * version is found, or only a link, will determine whether the resource will
   * already be resolved, or will be so in the future. The optional `options`
   * parameter can be used to pass additional options to the underlying http
   * request.
   *
   * @arg {string} rel The link relation to follow.
   * @arg {Object} [options] Options for following the link. For details, see {@link WebLink#follow}.
   * @returns {Resource} The linked/embedded resource, or null if the link relation is not found.
   * @throws Will throw an error if multiple instances of the relation are present.
   * @example
   * res.$followOne('next')
   * => Resource { $resolved: false, $promise: $q promise object }
   */
  this.$followOne = function(rel, options) {
    if (this.$resolved) {
      var res = this.$sub(rel);
      if (res !== null) {
        return res;
      }

      var l = this.$link(rel);
      if (l === null) {
        return null; // TODO: Return a resource w/ an error?s
      }

      return l.follow(options);
    }

    var ret = new Resource();
    ret.$promise =
        this.$promise.then(function(r) {
          return r.$followOne(rel, options).$promise;
        }).then(function(r) {
          var promise = ret.$promise;
          _.assign(ret, r);
          ret.$promise = promise;
          return ret;
        });

    return ret;
  };

  /**
   * Follow all links for the given relation and return an array of resources.
   * If the link relation is not present, then an empty array will be returned.
   * It will first attempt to locate the link relation in the embedded
   * resources, and fall back to checking for the presence of a link and
   * loading those. Depending on whether an embedded version is found, or only
   * links, will determine whether the resources will already be resolved, or
   * will be so in the future.
   *
   * @arg {string} rel The link relation to follow.
   * @arg {Object} [options] Options for following the link. For details, see {@link WebLink#follow}.
   * @returns {Array} The linked/embedded resources, or an enmpty array if the link relation is not found.
   * @example
   * res.$followAll('item')
   * => [Resource { $resolved: false, $promise: $q promise object }, Resource { $resolved: false, $promise: $q promise object }]
   */
  this.$followAll = function(rel, options) {
    if (this.$resolved) {
      var subs = this.$subs(rel);
      if (subs.length > 0) {
        return subs;
      }

      return LinkCollection.fromArray(this.$links(rel)).follow(options);
    }

    var ret = [];
    ret.$resolved = false;
    ret.$error = null;
    ret.$promise =
      this.$promise.then(function(r) {
        var resources = r.$followAll(rel, options);
        Array.prototype.push.apply(ret, resources);
        return resources.$promise.catch(function(err) {
          ret.$resolved = true;
          ret.$error = { message: 'One or more resources failed to load for $followAll(' + rel + ')', inner: err };
          throw ret;
        });
      }, function(err) {
        ret.$resolved = true;
        ret.$error = { message: 'Parent resolution failed, unable to $followAll(' + rel + ')', inner: err };
        throw ret;
      }).then(function() {
        ret.$resolved = true;
        return ret;
      });

    return ret;
  };
};

/**
 * Look up the embedded/sub resources for the given link relation.
 *
 * @arg {string} rel The link relation to follow.
 * @returns {Array} Array of embedded resources, or empty array if the link relation is not found.
 * @example
 * res.$subs('item')
 * => [Resource { $resolved: true, $promise: resolved $q promise, ... various properties }]
 */
Resource.prototype.$subs = function(rel) {
  if (!this.$$embedded.hasOwnProperty(rel)) {
    return [];
  }

  return this.$$embedded[rel];
};


/**
 * Look up the embedded/sub resource for the given link relation.
 *
 * @arg {string} rel The link relation to follow.
 * @returns {Resource} The embedded resource, or null if the link relation is not found.
 * @throws Will throw an error if multiple instances of the relation are present.
 * @example
 * res.$sub('item')
 * => Resource { $resolved: true, $promise: resolved $q promise, ... various properties }
 */
Resource.prototype.$sub = function(rel) {
  var ret = this.$subs(rel);
  if (ret.length === 0) {
    return null;
  }
  if (ret.length > 1) {
    throw 'Multiple sub-resources present';
  }

  return ret[0];
};

/**
 * Alias for {@link Resource#$sub}.
 * @function
 */
Resource.prototype.$embedded = Resource.prototype.$sub;

/**
 * Alias for {@link Resource#$subs}.
 * @function
 */
Resource.prototype.$embeddeds = Resource.prototype.$subs;

/**
 * Check for existence of a linked or embedded resource for the given link
 * relation. The function does _not_ take into account whether the resource is
 * resolved or not, so the return value may be different once the resource is
 * resolved.
 * @arg {string} rel The link relation to check for.
 * @return {boolean} True if the link relation is found in links or embedded, otherwise false.
 */
Resource.prototype.$has = function(rel) {
  return this.$links(rel).length > 0 || this.$subs(rel).length > 0;
};

/**
 * Send an HTTP DELETE request to the resource's 'self' link.
 * @return {Resource} A resources with the response of the DELETE request.
 */
Resource.prototype.$delete = function() {
  return this.$followOne('self', { protocol: {method: 'DELETE'} });
};

var defaultParser = _.constant({});

Resource.prototype.$$resolve = function(data, headers, context) {
  _.forEach(context.extensions, function(e) {
    if (!e.applies(data, headers, context)) {
      return;
    }

    var fields = (e.dataParser || _.constant([])).apply(e, [data, headers, context]);

    _.assign(this, _.reduce(fields, function(result, val) {
        result[val.name] = val.value;
        return result;
      }, {}));

    _.assign(this.$$links, (e.linkParser || defaultParser).apply(e, [data, headers, context]));
    _.assign(this.$$forms, (e.formParser || defaultParser).apply(e, [data, headers, context]));
    _.assign(this.$$embedded, (e.embeddedParser || defaultParser).apply(e, [data, headers, context]));
  }, this);

  this.$resolved = true;
};

Resource.prototype.$$reject = function(error) {
  this.$error = error;
  this.$resolved = true;
};

Resource.embedded = function(raw, headers, context) {
  var ret = new Resource();
  ret.$$resolve(raw, headers, context);
  ret.$promise = Promise.resolve(ret);
  return ret;
};

Resource.embeddedCollection = function(items, headers, context) {
  var embeds = items.map(function(e) { return Resource.embedded(e, headers, context); }, this);

  embeds.$promise = Promise.resolve(embeds);
  embeds.$resolved = true;

  return embeds;
};

Resource.fromRequest = function(request, context) {
  var res = new Resource();
  res.$promise =
    request.then(function(response) {
        context = context.baseline();
        if (response.config && response.config.url) {
          context = context.forResource({
            url: response.config.url,
            headers: response.headers
          });
        }
        res.$$resolve(response.data, response.headers, context);
        return res;
      }, function(response) {
        res.$$reject({message: 'HTTP request to load resource failed', inner: response });
        throw res;
      });

  return res;
};

module.exports = Resource;
