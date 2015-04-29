'use strict';

var _ = require('lodash');

/**
 * A collection of {@link WebLink} instances.
 *
 * @constructor
 */
var LinkCollection = function() {
  var coll = Object.create(Array.prototype);
  coll = (Array.apply(coll, arguments) || coll);

  LinkCollection.injectClassMethods(coll);
  return (coll);
};

LinkCollection.injectClassMethods = function(c) {
  for (var method in LinkCollection.prototype) {
    if (LinkCollection.prototype.hasOwnProperty(method)) {
      c[method] = LinkCollection.prototype[method];
    }
  }

  return c;
};

LinkCollection.fromArray = function(links) {
  return LinkCollection.apply(null, links);
};

/**
 * Returns an array of {@link Resource} instances. In addition, the array has a
 * `$promise` property that will resolve when all of the {@link Resource}
 * instances resolve, allowing you to perform some logic once everything has
 * been fetched.
 *
 * @arg {Object} options The options to pass to {@link WebLink#follow} for each link.
 * @return {Array} the resources that result from following the contained links.
 */
LinkCollection.prototype.follow = function(options) {
  var res = _.invoke(this, 'follow', options);
  res.$promise = Promise.all(_.pluck(res, '$promise'));
  res.$resolved = false;
  res.$error = null;
  res.$promise.then(function(r) {
    res.$resolved = true;
  }, function(err) {
    res.$resolved = true;
    res.$error = err;
  });

  return res;
};

module.exports = LinkCollection;
