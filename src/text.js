'use strict';

var _ = require('lodash');

/**
 * Create a new text extension.
 *
 * @constructor
 * @implements {Extension}
 * @arg {Boolean} [options.wildcard] Whether the extension should operate
 * in wildcard mode.
 * @arg {Array<String>} [options.subTypes] The additional `text` subtypes
 * that should be handled by the extension
 *
 * @classdesc
 * Extension for parsing text data from `text/` media type responses.
 * The text of the response will be available as the property `text` on
 * the {@link Resource}. By default, only `text/plain` content type is handled,
 * but other types can be included, or the extension can be used in
 * 'wildcard' mode and accept `text/*`.
 *
 */
var TextExtension = function(options) {
  options = options || {};

  var wildcard = options.wildcard;
  var mediaTypeSet = { 'text/plain': true };

  if (wildcard) {
    mediaTypeSet = { 'text/*': true };
  } else {
    var subTypes = options.subTypes || [];
    for (var i = 0; i < subTypes.length; i++) {
      mediaTypeSet['text/' + subTypes[i]] = true;
    }
  }

  this.mediaTypes = _.keys(mediaTypeSet);

  this.applies = function(data, headers) {
    var h = headers['content-type'];
    if (!h) {
      return false;
    }

    // Handle parameters, e.g. text/plain; charset=UTF-8
    var type = h.split(';')[0];

    return wildcard ? type.substr(0, 'text/'.length) === 'text/' : mediaTypeSet[type] !== undefined;
  };

  this.dataParser = function(data) {
    var ret = [];

    if (data) {
      ret.push({ name: 'text', value: data });
    }

    return ret;
  };

};

module.exports = TextExtension;
