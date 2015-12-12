var _ = require('lodash');

var WebLink = require('./web_link');
var LinkCollection = require('./link_collection');

var MasonExtension = function(mediaTypes) {
  var mediaTypeSet = {
    'application/vnd.mason+json': true
  };

  mediaTypes = mediaTypes || [];
  for (var i = 0; i < mediaTypes.length; i++) {
    mediaTypeSet[mediaTypes[i]] = true;
  }

  this.mediaTypes = _.keys(mediaTypeSet);

  this.applies = function(data, headers) {
    var h = headers['content-type'];
    if (!h) {
      return false;
    }

    // Handle parameters, e.g. application/hal+json; charset=UTF-8
    var type = h.split(';')[0];
    return mediaTypeSet[type] !==  undefined;
  };
};

MasonExtension.prototype.linkParser = function(data, headers, context) {
  var ret = {};

  if (!data['@controls']) {
    return ret;
  }

  return _.mapValues(data['@controls'], function(l) { return LinkCollection.fromArray([new WebLink(l, context)])});
};


module.exports = MasonExtension;
