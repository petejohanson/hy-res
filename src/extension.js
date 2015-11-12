'use strict';

/**
 * Interface for a media type extension
 *
 * @interface Extension
 * @property {Array.<String>} mediaTypes The media types this extension can process.
 * Used to generate the HTTP Accept header for requests.
 * @property {Object.<String, Extension~encoder>} encoders Encoders for creating request bodies, keyed by media type.
 */

/**
 * @callback Extension~encoder
 * @arg {Object} data The data to encode
 * @returns {String} The data encoded to a request body string.
 */

/**
 * Determine whether this extension should be used to process
 * a particular response
 *
 * @function
 * @name Extension#applies
 * @arg {Object} data The body of the response, pre-parsed if some form of JSON.
 * @arg {Object.<string, string>} headers The HTTP headers of the response
 * @arg {Integer} status The HTTP status of the response.
 * @returns {Boolean} True if the extension should be used to process the response.
 */

/**
 * Parse any links found in the resources.
 *
 * @function
 * @name Extension#linkParser
 * @arg {Object} data The body of the response, pre-parsed if some form of JSON.
 * @arg {Object.<string, string>} headers The HTTP headers of the response
 * @arg {Integer} status The HTTP status of the response.
 * @returns {Object.<String, LinkCollection>} The links, aggregated by the link relation.
 */

/**
 * Parse any field data that is part of the resource.
 *
 * @function
 * @name Extension#dataParser
 * @arg {Object} data The body of the response, pre-parsed if some form of JSON.
 * @arg {Object.<string, string>} headers The HTTP headers of the response
 * @arg {Integer} status The HTTP status of the response.
 * @returns {Array.<{name: String, value: Object}>} The fields, as an array of name/value pairs.
 */

/**
 * Parse any embedded resources found in this resource.
 *
 * @function
 * @name Extension#embeddedParser
 * @arg {Object} data The body of the response, pre-parsed if some form of JSON.
 * @arg {Object.<string, string>} headers The HTTP headers of the response
 * @arg {Integer} status The HTTP status of the response.
 * @returns {Object.<String, Resource[]>} The embedded resources, aggregated by the link relation.
 */

/**
 * Parse any hypemedia forms found in this resource.
 *
 * @function
 * @name Extension#formParser
 * @arg {Object} data The body of the response, pre-parsed if some form of JSON.
 * @arg {Object.<string, string>} headers The HTTP headers of the response
 * @arg {Integer} status The HTTP status of the response.
 * @returns {Object.<String, Form[]>} The hypermedia forms, aggregated by the link relation.
 */

/**
 * Parse and assign hypermedia format specific attributes in this resource.
 *
 * @function
 * @name Extension#formatSpecificParser
 * @arg {Object} data The body of the response, pre-parsed if some form of JSON.
 * @arg {Object.<string, string>} headers The HTTP headers of the response
 * @arg {Integer} status The HTTP status of the response.
 * @returns {Object} The object containing any format specific properties.
 */
