'use strict';

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

LinkCollection.prototype = {
  follow:  function(options) {
    var res = this.map(function(l) {
      return l.follow(options);
    });
    res.$promise = Promise.all(res.map(function(r) { return r.$promise; }));
    res.$resolved = false;
    res.$error = null;
    res.$promise.then(function(r) {
      res.$resolved = true;
    }, function(err) {
      res.$resolved = true;
      res.$error = err;
    });

    return res;
  }
};

module.exports = LinkCollection;
