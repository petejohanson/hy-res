'use strict';

var _ = require('lodash');
var Resource = require('./resource');
var UriTemplate = require('URIjs/src/URITemplate');

/**
 * Create a new WebLink.
 * @constructor
 * @arg {Object} data the field values for the link
 * @arg {Context} context The resource context containing the link
 *
 * @classdesc
 * Currently, there is one implementation of the concept of a link,
 * {@link WebLink}, which encapsulates the data and concepts codified in
 * [RFC5988](http://tools.ietf.org/html/rfc5988). The standard data fields (if
 * defined for the specific link), such as `href`, `title`, `type`, etc are all
 * defined on the link.
 */
var WebLink = function(data, context) {
  _.extend(this, data);
  this.$$context = context;
};

/**
 * Dereference the link, returning an asynchronously
 * populated {@link Resource}.
 * @arg options The options for the request.
 * @tutorial uri-templates
 */
WebLink.prototype.follow = function(options) {
  options = (options || {});
  options.headers = (options.headers || {});

  if(!options.headers.Accept) {
    if (this.type) {
      options.headers.Accept = this.type;
    } else {
      var accept = _.reduce(_.flatten(_.compact(_.pluck(this.$$context.extensions, 'mediaTypes'))), function(acc, s) { return acc + ',' + s; });
      if (accept) {
        options.headers.Accept = accept;
      }
    }
  }

  var requestOptions = _.extend(options, { url: this.resolvedUrl(options.data) });
  return Resource.fromRequest(this.$$context.http(requestOptions), this.$$context);
};

/**
 * The `resolvedUrl` function of a `HyRes.WebLink` can be used to see what the final resolved URL will be for the link once processing:
 *
 * * URI Template parameters passed in the `data` argument.
 * * Converting any relative URLs to absolute ones given the context of the web link, i.e. the URL of the response that contained the link.
 * @arg {Object} data The values to optionally insert into any URI template used for the `href` value.
 */
WebLink.prototype.resolvedUrl = function(data) {
  var url = this.href;

  if (this.templated) {
    url = new UriTemplate(url).expand(data);
  }

  return this.$$context.resolveUrl(url);
};

module.exports = WebLink;
