'use strict';

var _ = require('lodash');
var Context = require('./context');
var LinkCollection = require('./link_collection');

var Resource = function(extensions) {
  this.$resolved = false;
  this.$error = null;
  this.$$links = {};
  this.$$embedded = {};
  this.$$forms = {};
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
    return _.get(this.$$links, rel, []);
  };

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

  this.$forms = function(rel) {
    return _.invoke(_.get(this.$$forms, rel, []), 'clone');
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
      myself.$promise.then(function(r) {
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
    });

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

var defaultParser = _.constant({});

Resource.prototype.$$resolve = function(data, headers, context) {
  _.forEach(this.$$extensions, function(e) {
    if (!e.applies(data, headers, context)) {
      return;
    }

    _.assign(this, (e.dataParser || defaultParser)(data, headers, context));
    _.assign(this.$$links, (e.linkParser || defaultParser)(data, headers, context));
    _.assign(this.$$forms, (e.formParser || defaultParser)(data, headers, context));

    _.forEach((e.embeddedParser || _.constant([]))(data, headers, context), function(raw, rel) {
      var embeds = raw.map(function(e) { return Resource.embedded(e, headers, this.$$extensions, context); }, this);

      embeds.$promise = Promise.resolve(embeds);
      embeds.$resolved = true;
      this.$$embedded[rel] = embeds;
    }, this);
  }, this);

  this.$resolved = true;
};

Resource.prototype.$$reject = function(error) {
  this.$error = error;
  this.$resolved = true;
};

Resource.embedded = function(raw, headers, extensions, context) {
  var ret = new Resource(extensions);
  ret.$$resolve(raw, headers, context);
  ret.$promise = Promise.resolve(ret);
  return ret;
};

Resource.fromRequest = function(request, extensions) {
  var res = new Resource(extensions);
  res.$promise =
    request.then(function(response) {
        var context = Context.empty;
        if (response.config && response.config.url) {
          context = new Context(response.config.url);
        }
        res.$$resolve(response.data, response.headers, context);
        return res;
      }, function(response) {
        res.$$reject(response);
      });

  return res;
};

module.exports = Resource;
