'use strict';

/**
 *
 * @constructor
 * @implements {CurieBinding}
 * @arg {WebLink} link The web link including the name/prefix and URI Template
 *
 * @classdesc
 * A CURIE prefix binding that encompasses the
 * [HAL](https://tools.ietf.org/html/draft-kelly-json-hal-07)
 * processing rules for using a [URI Template](http://tools.ietf.org/html/rfc6570)
 * to create the final URIs.
 */
var HalCurieBinding = function(link) {
  this.$$link = link;
  this.prefix = link.name;
};

HalCurieBinding.prototype.expand = function(reference) {
  return this.$$link.resolvedUrl({rel: reference});
};

module.exports = HalCurieBinding;
