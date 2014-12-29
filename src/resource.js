'use strict';

var _ = require('lodash');
var LinkCollection = require('./link_collection');

var Resource = function(extensions) {
  this.$resolved = false;
  this.$error = null;
  this.$$links = {};
  this.$$embedded = {};
  this.$$extensions = extensions;

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

  this.$links = function(rel) {
    if (!this.$$links.hasOwnProperty(rel)) {
      return [];
    }

    return this.$$links[rel];
  };

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

    var ret = new Resource(this.$$extensions);
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
    var myself = this;
    ret.$promise = new Promise(function(resolve, reject) {
      this.$promise.then(function(r) {
        var resources = r.$followAll(rel, options);
        Array.prototype.push.apply(ret, resources);
        return resources.$promise;
      }).then(function(r) {
        ret.$resolved = true;
        resolve(ret);
      }, function(err) {
        ret.$resolved = true;
        ret.$error = err;
        reject(err);
      });
    }.bind(this));

    return ret;
  };
};

Resource.prototype.$subs = function(rel) {
  if (!this.$$embedded.hasOwnProperty(rel)) {
    return [];
  }

  return this.$$embedded[rel];
};


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

Resource.prototype.$embedded = Resource.prototype.$sub;
Resource.prototype.$embeddeds = Resource.prototype.$subs;

Resource.prototype.$has = function(rel) {
  return this.$links(rel).length > 0 || this.$subs(rel).length > 0;
};

Resource.prototype.$$resolve = function(data, headers) {
  _.forEach(this.$$extensions, function(e) {
    if (!e.applies(data, headers)) {
      return;
    }

    _.assign(this, e.dataParser(data, headers));

    _.assign(this.$$links, e.linkParser(data, headers));
    _.forEach(e.embeddedParser(data, headers), function(raw, rel) {
      if (_.isArray(raw)) {
        var embeds = raw.map(function(e) { return Resource.embedded(e, headers, this.$$extensions); }, this);

        embeds.$promise = Promise.resolve(embeds);
        embeds.$resolved = true;
        this.$$embedded[rel] = embeds;
      } else {
        this.$$embedded[rel] = Resource.embedded(raw, headers, this.$$extensions);
      }
    }, this);
  }, this);

  this.$resolved = true;
};

Resource.embedded = function(raw, headers, extensions) {
  var ret = new Resource(extensions);
  ret.$$resolve(raw, headers);
  ret.$promise = Promise.resolve(ret);
  return ret;
};

Resource.fromRequest = function(request, extensions) {
  var res = new Resource(extensions);
  res.$promise =
    request.then(function(response) {
        res.$$resolve(response.data, response.headers);
        return res;
      }, function(response) {
        // TODO: What to do for failure case?
      });

  return res;
};

module.exports = Resource;
