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
 * @function Extension#applies
 * @arg {Object} data The body of the response, pre-parsed if some form of JSON.
 * @arg {Object.<string, string>} headers The HTTP headers of the response
 * @arg {Context} context The context of the current resource/operation.
 * @returns {Boolean} True if the extension should be used to process the response.
 */

/**
 * Parse any links found in the resources.
 *
 * @function Extension#linkParser
 * @arg {Object} data The body of the response, pre-parsed if some form of JSON.
 * @arg {Object.<string, string>} headers The HTTP headers of the response
 * @arg {Context} context The context of the current resource/operation.
 * @returns {Object.<String, LinkCollection>} The links, aggregated by the link relation.
 */

/**
 * Parse any field data that is part of the resource.
 *
 * @function Extension#dataParser
 * @arg {Object} data The body of the response, pre-parsed if some form of JSON.
 * @arg {Object.<string, string>} headers The HTTP headers of the response
 * @arg {Context} context The context of the current resource/operation.
 * @returns {Array.<{name: String, value: Object}>} The fields, as an array of name/value pairs.
 */

/**
 * Parse any embedded resources found in this resource.
 *
 * @function Extension#embeddedParser
 * @arg {Object} data The body of the response, pre-parsed if some form of JSON.
 * @arg {Object.<string, string>} headers The HTTP headers of the response
 * @arg {Context} context The context of the current resource/operation.
 * @arg {Resource} the parent resource that contains the parsed resources.
 * @returns {Object.<String, Resource[]>} The embedded resources, aggregated by the link relation.
 */

/**
 * Parse any hypermedia forms found in this resource.
 *
 * @function Extension#formParser
 * @arg {Object} data The body of the response, pre-parsed if some form of JSON.
 * @arg {Object.<string, string>} headers The HTTP headers of the response
 * @arg {Context} context The context of the current resource/operation.
 * @returns {Object.<String, Form[]>} The hypermedia forms, aggregated by the link relation.
 */

/**
 * Parse any CURIE prefixes defined in this resource.
 *
 * @function Extension#curiePrefixParser
 * @arg {Object} data The body of the response, pre-parsed if some form of JSON.
 * @arg {Object.<string, string>} headers The HTTP headers of the response
 * @arg {Context} context The context of the current resource/operation.
 * @returns {Object.<String, CuriePrefix>} The curie prefixes, indexed by the prefix identifier.
 */

/**
 * Parse and assign hypermedia format specific attributes in this resource.
 *
 * @function Extension#formatSpecificParser
 * @arg {Object} data The body of the response, pre-parsed if some form of JSON.
 * @arg {Object.<string, string>} headers The HTTP headers of the response
 * @arg {Context} context The context of the current resource/operation.
 * @returns {Object} The object containing any format specific properties.
 */
