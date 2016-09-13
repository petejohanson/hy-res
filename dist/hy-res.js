/**
 * hy-res - Generic hypermedia client supporting several formats
 * @version v0.0.26 - 2016-09-13
 * @link https://github.com/petejohanson/hy-res
 * @author Pete Johanson <peter@peterjohanson.com>
 * @license MIT License, http://www.opensource.org/licenses/MIT
 */
var HyRes =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	
	module.exports = {
	  Root: __webpack_require__(1),
	  WebLink: __webpack_require__(9),
	  Resource: __webpack_require__(10),
	  Form: __webpack_require__(13),
	  FieldUtils: __webpack_require__(16),
	  LinkCollection: __webpack_require__(11),
	  HalExtension: __webpack_require__(17),
	  JsonExtension: __webpack_require__(19),
	  TextExtension: __webpack_require__(20),
	  LinkHeaderExtension: __webpack_require__(21),
	  SirenExtension: __webpack_require__(23),
	  CollectionJsonExtension: __webpack_require__(24)
	};


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _ = __webpack_require__(2);
	var Context = __webpack_require__(3);
	var WebLink = __webpack_require__(9);

	/**
	 * Entrypoint to an API.
	 * @constructor
	 * @extends WebLink
	 * @arg {string} url The URL of the root of the API
	 * @arg http The ES6 promise based HTTP abstraction (e.g. AngularJS $http, or
	 * [axios](https://www.npmjs.com/package/axios)
	 * @arg {Array} extensions The extensions to use for processing responses
	 * @arg {Object} [defaultOptions] Default options used when following links.
	 * See {@link Context#withDefaults} and {@link WebLink#follow}
	 */
	var Root = function(url, http, extensions, defaultOptions) {
	  var ctx = new Context(http, extensions, defaultOptions);

	  WebLink.call(this, { href: url }, ctx.forResource({url: url}));
	};

	Root.prototype = _.create(WebLink.prototype, {
	  'constructor': Root
	});

	module.exports = Root;


/***/ },
/* 2 */
/***/ function(module, exports) {

	module.exports = _;

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var URI = __webpack_require__(4);
	var _ = __webpack_require__(2);

	/**
	 * Create a new context with the given http abstraction and set of
	 * extensions
	 * @constructor
	 *
	 * @classdesc
	 * The {@link Context} encapsulates the state/context of a given resource
	 * or request, including extensions available, the http mechanism for
	 * dereferencing URLs, etc.
	 */
	var Context = function(http, extensions, defaultOptions) {
	  this.http = http;
	  this.extensions = extensions;
	  this.defaultOptions = defaultOptions || {};
	  this.headers = {};
	};

	/**
	 * Given a possibly relative URL, resolve it using the context's
	 * base URL, if it exists.
	 * @arg {String} url The (possibly relative) URL to resolve.
	 * @returns String The resolved URL. This may still be relative is no base
	 * URL is set in the given context.
	 */
	Context.prototype.resolveUrl = function(url) {
	  if (this.url) {
	    url = new URI(url).absoluteTo(this.url).toString();
	  }
	  return url;
	};

	/**
	 * Generate an HTTP Accept header from the extension media types,
	 * preferring the context content type over others, e.g
	 * `application/vnd.siren+json;application/json;q=0.5`.
	 * @returns {string} The generated Accept header value
	 */
	Context.prototype.acceptHeader = function() {
	  var mediaTypes = _(this.extensions).pluck('mediaTypes').flatten().compact();
	  if (this.headers['content-type']) {
	    var preferred = this.headers['content-type'];
	    mediaTypes = mediaTypes.map(function(mt) { return mt === preferred ? mt : mt + ';q=0.5'; });
	  }
	  return mediaTypes.join(',');
	};

	/**
	 * Create a copy of the context with any base URL removed.
	 * @returns {Context} the new context with base URL context removed.
	 */
	Context.prototype.baseline = function() {
	  return this.forResource(undefined);
	};

	/**
	 * Create a copy of the context with a new resource context
	 * @arg {Object} resource The context resource object.
	 * @arg {String} resource.url The new context URL.
	 * @arg {Object} resource.headers The headers of the resource context.
	 * @returns {Context} The new context with the given resource.
	 */
	Context.prototype.forResource = function(resource) {
	  var c = new Context(this.http, this.extensions, this.defaultOptions);
	  resource = resource || {};
	  c.url = resource.url;
	  c.headers = resource.headers || {};

	  return c;
	};

	/**
	 * Merge the default options with the provided ones to produce the final
	 * options for a follow operation.
	 * @arg {Object} [options] The request specific options.
	 * @returns {Object} The merged options.
	 */
	Context.prototype.withDefaults = function(options) {
	  return _.merge({}, this.defaultOptions, options || {});
	};

	/**
	 * Create a new context with the provided extensions overriding the existing ones.
	 * @param {Array} extensions The new set of extensions to use for the context
	 * @returns {Context} A new context w/ the provided extensions
	 */
	Context.prototype.withExtensions = function(extensions) {
	  return new Context(this.http, extensions, this.defaultOptions);
	};

	module.exports = Context;


/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	/*!
	 * URI.js - Mutating URLs
	 *
	 * Version: 1.16.1
	 *
	 * Author: Rodney Rehm
	 * Web: http://medialize.github.io/URI.js/
	 *
	 * Licensed under
	 *   MIT License http://www.opensource.org/licenses/mit-license
	 *   GPL v3 http://opensource.org/licenses/GPL-3.0
	 *
	 */
	(function (root, factory) {
	  'use strict';
	  // https://github.com/umdjs/umd/blob/master/returnExports.js
	  if (true) {
	    // Node
	    module.exports = factory(__webpack_require__(5), __webpack_require__(7), __webpack_require__(8));
	  } else if (typeof define === 'function' && define.amd) {
	    // AMD. Register as an anonymous module.
	    define(['./punycode', './IPv6', './SecondLevelDomains'], factory);
	  } else {
	    // Browser globals (root is window)
	    root.URI = factory(root.punycode, root.IPv6, root.SecondLevelDomains, root);
	  }
	}(this, function (punycode, IPv6, SLD, root) {
	  'use strict';
	  /*global location, escape, unescape */
	  // FIXME: v2.0.0 renamce non-camelCase properties to uppercase
	  /*jshint camelcase: false */

	  // save current URI variable, if any
	  var _URI = root && root.URI;

	  function URI(url, base) {
	    var _urlSupplied = arguments.length >= 1;
	    var _baseSupplied = arguments.length >= 2;

	    // Allow instantiation without the 'new' keyword
	    if (!(this instanceof URI)) {
	      if (_urlSupplied) {
	        if (_baseSupplied) {
	          return new URI(url, base);
	        }

	        return new URI(url);
	      }

	      return new URI();
	    }

	    if (url === undefined) {
	      if (_urlSupplied) {
	        throw new TypeError('undefined is not a valid argument for URI');
	      }

	      if (typeof location !== 'undefined') {
	        url = location.href + '';
	      } else {
	        url = '';
	      }
	    }

	    this.href(url);

	    // resolve to base according to http://dvcs.w3.org/hg/url/raw-file/tip/Overview.html#constructor
	    if (base !== undefined) {
	      return this.absoluteTo(base);
	    }

	    return this;
	  }

	  URI.version = '1.16.1';

	  var p = URI.prototype;
	  var hasOwn = Object.prototype.hasOwnProperty;

	  function escapeRegEx(string) {
	    // https://github.com/medialize/URI.js/commit/85ac21783c11f8ccab06106dba9735a31a86924d#commitcomment-821963
	    return string.replace(/([.*+?^=!:${}()|[\]\/\\])/g, '\\$1');
	  }

	  function getType(value) {
	    // IE8 doesn't return [Object Undefined] but [Object Object] for undefined value
	    if (value === undefined) {
	      return 'Undefined';
	    }

	    return String(Object.prototype.toString.call(value)).slice(8, -1);
	  }

	  function isArray(obj) {
	    return getType(obj) === 'Array';
	  }

	  function filterArrayValues(data, value) {
	    var lookup = {};
	    var i, length;

	    if (getType(value) === 'RegExp') {
	      lookup = null;
	    } else if (isArray(value)) {
	      for (i = 0, length = value.length; i < length; i++) {
	        lookup[value[i]] = true;
	      }
	    } else {
	      lookup[value] = true;
	    }

	    for (i = 0, length = data.length; i < length; i++) {
	      /*jshint laxbreak: true */
	      var _match = lookup && lookup[data[i]] !== undefined
	        || !lookup && value.test(data[i]);
	      /*jshint laxbreak: false */
	      if (_match) {
	        data.splice(i, 1);
	        length--;
	        i--;
	      }
	    }

	    return data;
	  }

	  function arrayContains(list, value) {
	    var i, length;

	    // value may be string, number, array, regexp
	    if (isArray(value)) {
	      // Note: this can be optimized to O(n) (instead of current O(m * n))
	      for (i = 0, length = value.length; i < length; i++) {
	        if (!arrayContains(list, value[i])) {
	          return false;
	        }
	      }

	      return true;
	    }

	    var _type = getType(value);
	    for (i = 0, length = list.length; i < length; i++) {
	      if (_type === 'RegExp') {
	        if (typeof list[i] === 'string' && list[i].match(value)) {
	          return true;
	        }
	      } else if (list[i] === value) {
	        return true;
	      }
	    }

	    return false;
	  }

	  function arraysEqual(one, two) {
	    if (!isArray(one) || !isArray(two)) {
	      return false;
	    }

	    // arrays can't be equal if they have different amount of content
	    if (one.length !== two.length) {
	      return false;
	    }

	    one.sort();
	    two.sort();

	    for (var i = 0, l = one.length; i < l; i++) {
	      if (one[i] !== two[i]) {
	        return false;
	      }
	    }

	    return true;
	  }

	  URI._parts = function() {
	    return {
	      protocol: null,
	      username: null,
	      password: null,
	      hostname: null,
	      urn: null,
	      port: null,
	      path: null,
	      query: null,
	      fragment: null,
	      // state
	      duplicateQueryParameters: URI.duplicateQueryParameters,
	      escapeQuerySpace: URI.escapeQuerySpace
	    };
	  };
	  // state: allow duplicate query parameters (a=1&a=1)
	  URI.duplicateQueryParameters = false;
	  // state: replaces + with %20 (space in query strings)
	  URI.escapeQuerySpace = true;
	  // static properties
	  URI.protocol_expression = /^[a-z][a-z0-9.+-]*$/i;
	  URI.idn_expression = /[^a-z0-9\.-]/i;
	  URI.punycode_expression = /(xn--)/i;
	  // well, 333.444.555.666 matches, but it sure ain't no IPv4 - do we care?
	  URI.ip4_expression = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/;
	  // credits to Rich Brown
	  // source: http://forums.intermapper.com/viewtopic.php?p=1096#1096
	  // specification: http://www.ietf.org/rfc/rfc4291.txt
	  URI.ip6_expression = /^\s*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))(%.+)?\s*$/;
	  // expression used is "gruber revised" (@gruber v2) determined to be the
	  // best solution in a regex-golf we did a couple of ages ago at
	  // * http://mathiasbynens.be/demo/url-regex
	  // * http://rodneyrehm.de/t/url-regex.html
	  URI.find_uri_expression = /\b((?:[a-z][\w-]+:(?:\/{1,3}|[a-z0-9%])|www\d{0,3}[.]|[a-z0-9.\-]+[.][a-z]{2,4}\/)(?:[^\s()<>]+|\(([^\s()<>]+|(\([^\s()<>]+\)))*\))+(?:\(([^\s()<>]+|(\([^\s()<>]+\)))*\)|[^\s`!()\[\]{};:'".,<>?«»“”‘’]))/ig;
	  URI.findUri = {
	    // valid "scheme://" or "www."
	    start: /\b(?:([a-z][a-z0-9.+-]*:\/\/)|www\.)/gi,
	    // everything up to the next whitespace
	    end: /[\s\r\n]|$/,
	    // trim trailing punctuation captured by end RegExp
	    trim: /[`!()\[\]{};:'".,<>?«»“”„‘’]+$/
	  };
	  // http://www.iana.org/assignments/uri-schemes.html
	  // http://en.wikipedia.org/wiki/List_of_TCP_and_UDP_port_numbers#Well-known_ports
	  URI.defaultPorts = {
	    http: '80',
	    https: '443',
	    ftp: '21',
	    gopher: '70',
	    ws: '80',
	    wss: '443'
	  };
	  // allowed hostname characters according to RFC 3986
	  // ALPHA DIGIT "-" "." "_" "~" "!" "$" "&" "'" "(" ")" "*" "+" "," ";" "=" %encoded
	  // I've never seen a (non-IDN) hostname other than: ALPHA DIGIT . -
	  URI.invalid_hostname_characters = /[^a-zA-Z0-9\.-]/;
	  // map DOM Elements to their URI attribute
	  URI.domAttributes = {
	    'a': 'href',
	    'blockquote': 'cite',
	    'link': 'href',
	    'base': 'href',
	    'script': 'src',
	    'form': 'action',
	    'img': 'src',
	    'area': 'href',
	    'iframe': 'src',
	    'embed': 'src',
	    'source': 'src',
	    'track': 'src',
	    'input': 'src', // but only if type="image"
	    'audio': 'src',
	    'video': 'src'
	  };
	  URI.getDomAttribute = function(node) {
	    if (!node || !node.nodeName) {
	      return undefined;
	    }

	    var nodeName = node.nodeName.toLowerCase();
	    // <input> should only expose src for type="image"
	    if (nodeName === 'input' && node.type !== 'image') {
	      return undefined;
	    }

	    return URI.domAttributes[nodeName];
	  };

	  function escapeForDumbFirefox36(value) {
	    // https://github.com/medialize/URI.js/issues/91
	    return escape(value);
	  }

	  // encoding / decoding according to RFC3986
	  function strictEncodeURIComponent(string) {
	    // see https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/encodeURIComponent
	    return encodeURIComponent(string)
	      .replace(/[!'()*]/g, escapeForDumbFirefox36)
	      .replace(/\*/g, '%2A');
	  }
	  URI.encode = strictEncodeURIComponent;
	  URI.decode = decodeURIComponent;
	  URI.iso8859 = function() {
	    URI.encode = escape;
	    URI.decode = unescape;
	  };
	  URI.unicode = function() {
	    URI.encode = strictEncodeURIComponent;
	    URI.decode = decodeURIComponent;
	  };
	  URI.characters = {
	    pathname: {
	      encode: {
	        // RFC3986 2.1: For consistency, URI producers and normalizers should
	        // use uppercase hexadecimal digits for all percent-encodings.
	        expression: /%(24|26|2B|2C|3B|3D|3A|40)/ig,
	        map: {
	          // -._~!'()*
	          '%24': '$',
	          '%26': '&',
	          '%2B': '+',
	          '%2C': ',',
	          '%3B': ';',
	          '%3D': '=',
	          '%3A': ':',
	          '%40': '@'
	        }
	      },
	      decode: {
	        expression: /[\/\?#]/g,
	        map: {
	          '/': '%2F',
	          '?': '%3F',
	          '#': '%23'
	        }
	      }
	    },
	    reserved: {
	      encode: {
	        // RFC3986 2.1: For consistency, URI producers and normalizers should
	        // use uppercase hexadecimal digits for all percent-encodings.
	        expression: /%(21|23|24|26|27|28|29|2A|2B|2C|2F|3A|3B|3D|3F|40|5B|5D)/ig,
	        map: {
	          // gen-delims
	          '%3A': ':',
	          '%2F': '/',
	          '%3F': '?',
	          '%23': '#',
	          '%5B': '[',
	          '%5D': ']',
	          '%40': '@',
	          // sub-delims
	          '%21': '!',
	          '%24': '$',
	          '%26': '&',
	          '%27': '\'',
	          '%28': '(',
	          '%29': ')',
	          '%2A': '*',
	          '%2B': '+',
	          '%2C': ',',
	          '%3B': ';',
	          '%3D': '='
	        }
	      }
	    },
	    urnpath: {
	      // The characters under `encode` are the characters called out by RFC 2141 as being acceptable
	      // for usage in a URN. RFC2141 also calls out "-", ".", and "_" as acceptable characters, but
	      // these aren't encoded by encodeURIComponent, so we don't have to call them out here. Also
	      // note that the colon character is not featured in the encoding map; this is because URI.js
	      // gives the colons in URNs semantic meaning as the delimiters of path segements, and so it
	      // should not appear unencoded in a segment itself.
	      // See also the note above about RFC3986 and capitalalized hex digits.
	      encode: {
	        expression: /%(21|24|27|28|29|2A|2B|2C|3B|3D|40)/ig,
	        map: {
	          '%21': '!',
	          '%24': '$',
	          '%27': '\'',
	          '%28': '(',
	          '%29': ')',
	          '%2A': '*',
	          '%2B': '+',
	          '%2C': ',',
	          '%3B': ';',
	          '%3D': '=',
	          '%40': '@'
	        }
	      },
	      // These characters are the characters called out by RFC2141 as "reserved" characters that
	      // should never appear in a URN, plus the colon character (see note above).
	      decode: {
	        expression: /[\/\?#:]/g,
	        map: {
	          '/': '%2F',
	          '?': '%3F',
	          '#': '%23',
	          ':': '%3A'
	        }
	      }
	    }
	  };
	  URI.encodeQuery = function(string, escapeQuerySpace) {
	    var escaped = URI.encode(string + '');
	    if (escapeQuerySpace === undefined) {
	      escapeQuerySpace = URI.escapeQuerySpace;
	    }

	    return escapeQuerySpace ? escaped.replace(/%20/g, '+') : escaped;
	  };
	  URI.decodeQuery = function(string, escapeQuerySpace) {
	    string += '';
	    if (escapeQuerySpace === undefined) {
	      escapeQuerySpace = URI.escapeQuerySpace;
	    }

	    try {
	      return URI.decode(escapeQuerySpace ? string.replace(/\+/g, '%20') : string);
	    } catch(e) {
	      // we're not going to mess with weird encodings,
	      // give up and return the undecoded original string
	      // see https://github.com/medialize/URI.js/issues/87
	      // see https://github.com/medialize/URI.js/issues/92
	      return string;
	    }
	  };
	  // generate encode/decode path functions
	  var _parts = {'encode':'encode', 'decode':'decode'};
	  var _part;
	  var generateAccessor = function(_group, _part) {
	    return function(string) {
	      try {
	        return URI[_part](string + '').replace(URI.characters[_group][_part].expression, function(c) {
	          return URI.characters[_group][_part].map[c];
	        });
	      } catch (e) {
	        // we're not going to mess with weird encodings,
	        // give up and return the undecoded original string
	        // see https://github.com/medialize/URI.js/issues/87
	        // see https://github.com/medialize/URI.js/issues/92
	        return string;
	      }
	    };
	  };

	  for (_part in _parts) {
	    URI[_part + 'PathSegment'] = generateAccessor('pathname', _parts[_part]);
	    URI[_part + 'UrnPathSegment'] = generateAccessor('urnpath', _parts[_part]);
	  }

	  var generateSegmentedPathFunction = function(_sep, _codingFuncName, _innerCodingFuncName) {
	    return function(string) {
	      // Why pass in names of functions, rather than the function objects themselves? The
	      // definitions of some functions (but in particular, URI.decode) will occasionally change due
	      // to URI.js having ISO8859 and Unicode modes. Passing in the name and getting it will ensure
	      // that the functions we use here are "fresh".
	      var actualCodingFunc;
	      if (!_innerCodingFuncName) {
	        actualCodingFunc = URI[_codingFuncName];
	      } else {
	        actualCodingFunc = function(string) {
	          return URI[_codingFuncName](URI[_innerCodingFuncName](string));
	        };
	      }

	      var segments = (string + '').split(_sep);

	      for (var i = 0, length = segments.length; i < length; i++) {
	        segments[i] = actualCodingFunc(segments[i]);
	      }

	      return segments.join(_sep);
	    };
	  };

	  // This takes place outside the above loop because we don't want, e.g., encodeUrnPath functions.
	  URI.decodePath = generateSegmentedPathFunction('/', 'decodePathSegment');
	  URI.decodeUrnPath = generateSegmentedPathFunction(':', 'decodeUrnPathSegment');
	  URI.recodePath = generateSegmentedPathFunction('/', 'encodePathSegment', 'decode');
	  URI.recodeUrnPath = generateSegmentedPathFunction(':', 'encodeUrnPathSegment', 'decode');

	  URI.encodeReserved = generateAccessor('reserved', 'encode');

	  URI.parse = function(string, parts) {
	    var pos;
	    if (!parts) {
	      parts = {};
	    }
	    // [protocol"://"[username[":"password]"@"]hostname[":"port]"/"?][path]["?"querystring]["#"fragment]

	    // extract fragment
	    pos = string.indexOf('#');
	    if (pos > -1) {
	      // escaping?
	      parts.fragment = string.substring(pos + 1) || null;
	      string = string.substring(0, pos);
	    }

	    // extract query
	    pos = string.indexOf('?');
	    if (pos > -1) {
	      // escaping?
	      parts.query = string.substring(pos + 1) || null;
	      string = string.substring(0, pos);
	    }

	    // extract protocol
	    if (string.substring(0, 2) === '//') {
	      // relative-scheme
	      parts.protocol = null;
	      string = string.substring(2);
	      // extract "user:pass@host:port"
	      string = URI.parseAuthority(string, parts);
	    } else {
	      pos = string.indexOf(':');
	      if (pos > -1) {
	        parts.protocol = string.substring(0, pos) || null;
	        if (parts.protocol && !parts.protocol.match(URI.protocol_expression)) {
	          // : may be within the path
	          parts.protocol = undefined;
	        } else if (string.substring(pos + 1, pos + 3) === '//') {
	          string = string.substring(pos + 3);

	          // extract "user:pass@host:port"
	          string = URI.parseAuthority(string, parts);
	        } else {
	          string = string.substring(pos + 1);
	          parts.urn = true;
	        }
	      }
	    }

	    // what's left must be the path
	    parts.path = string;

	    // and we're done
	    return parts;
	  };
	  URI.parseHost = function(string, parts) {
	    // Copy chrome, IE, opera backslash-handling behavior.
	    // Back slashes before the query string get converted to forward slashes
	    // See: https://github.com/joyent/node/blob/386fd24f49b0e9d1a8a076592a404168faeecc34/lib/url.js#L115-L124
	    // See: https://code.google.com/p/chromium/issues/detail?id=25916
	    // https://github.com/medialize/URI.js/pull/233
	    string = string.replace(/\\/g, '/');

	    // extract host:port
	    var pos = string.indexOf('/');
	    var bracketPos;
	    var t;

	    if (pos === -1) {
	      pos = string.length;
	    }

	    if (string.charAt(0) === '[') {
	      // IPv6 host - http://tools.ietf.org/html/draft-ietf-6man-text-addr-representation-04#section-6
	      // I claim most client software breaks on IPv6 anyways. To simplify things, URI only accepts
	      // IPv6+port in the format [2001:db8::1]:80 (for the time being)
	      bracketPos = string.indexOf(']');
	      parts.hostname = string.substring(1, bracketPos) || null;
	      parts.port = string.substring(bracketPos + 2, pos) || null;
	      if (parts.port === '/') {
	        parts.port = null;
	      }
	    } else {
	      var firstColon = string.indexOf(':');
	      var firstSlash = string.indexOf('/');
	      var nextColon = string.indexOf(':', firstColon + 1);
	      if (nextColon !== -1 && (firstSlash === -1 || nextColon < firstSlash)) {
	        // IPv6 host contains multiple colons - but no port
	        // this notation is actually not allowed by RFC 3986, but we're a liberal parser
	        parts.hostname = string.substring(0, pos) || null;
	        parts.port = null;
	      } else {
	        t = string.substring(0, pos).split(':');
	        parts.hostname = t[0] || null;
	        parts.port = t[1] || null;
	      }
	    }

	    if (parts.hostname && string.substring(pos).charAt(0) !== '/') {
	      pos++;
	      string = '/' + string;
	    }

	    return string.substring(pos) || '/';
	  };
	  URI.parseAuthority = function(string, parts) {
	    string = URI.parseUserinfo(string, parts);
	    return URI.parseHost(string, parts);
	  };
	  URI.parseUserinfo = function(string, parts) {
	    // extract username:password
	    var firstSlash = string.indexOf('/');
	    var pos = string.lastIndexOf('@', firstSlash > -1 ? firstSlash : string.length - 1);
	    var t;

	    // authority@ must come before /path
	    if (pos > -1 && (firstSlash === -1 || pos < firstSlash)) {
	      t = string.substring(0, pos).split(':');
	      parts.username = t[0] ? URI.decode(t[0]) : null;
	      t.shift();
	      parts.password = t[0] ? URI.decode(t.join(':')) : null;
	      string = string.substring(pos + 1);
	    } else {
	      parts.username = null;
	      parts.password = null;
	    }

	    return string;
	  };
	  URI.parseQuery = function(string, escapeQuerySpace) {
	    if (!string) {
	      return {};
	    }

	    // throw out the funky business - "?"[name"="value"&"]+
	    string = string.replace(/&+/g, '&').replace(/^\?*&*|&+$/g, '');

	    if (!string) {
	      return {};
	    }

	    var items = {};
	    var splits = string.split('&');
	    var length = splits.length;
	    var v, name, value;

	    for (var i = 0; i < length; i++) {
	      v = splits[i].split('=');
	      name = URI.decodeQuery(v.shift(), escapeQuerySpace);
	      // no "=" is null according to http://dvcs.w3.org/hg/url/raw-file/tip/Overview.html#collect-url-parameters
	      value = v.length ? URI.decodeQuery(v.join('='), escapeQuerySpace) : null;

	      if (hasOwn.call(items, name)) {
	        if (typeof items[name] === 'string' || items[name] === null) {
	          items[name] = [items[name]];
	        }

	        items[name].push(value);
	      } else {
	        items[name] = value;
	      }
	    }

	    return items;
	  };

	  URI.build = function(parts) {
	    var t = '';

	    if (parts.protocol) {
	      t += parts.protocol + ':';
	    }

	    if (!parts.urn && (t || parts.hostname)) {
	      t += '//';
	    }

	    t += (URI.buildAuthority(parts) || '');

	    if (typeof parts.path === 'string') {
	      if (parts.path.charAt(0) !== '/' && typeof parts.hostname === 'string') {
	        t += '/';
	      }

	      t += parts.path;
	    }

	    if (typeof parts.query === 'string' && parts.query) {
	      t += '?' + parts.query;
	    }

	    if (typeof parts.fragment === 'string' && parts.fragment) {
	      t += '#' + parts.fragment;
	    }
	    return t;
	  };
	  URI.buildHost = function(parts) {
	    var t = '';

	    if (!parts.hostname) {
	      return '';
	    } else if (URI.ip6_expression.test(parts.hostname)) {
	      t += '[' + parts.hostname + ']';
	    } else {
	      t += parts.hostname;
	    }

	    if (parts.port) {
	      t += ':' + parts.port;
	    }

	    return t;
	  };
	  URI.buildAuthority = function(parts) {
	    return URI.buildUserinfo(parts) + URI.buildHost(parts);
	  };
	  URI.buildUserinfo = function(parts) {
	    var t = '';

	    if (parts.username) {
	      t += URI.encode(parts.username);

	      if (parts.password) {
	        t += ':' + URI.encode(parts.password);
	      }

	      t += '@';
	    }

	    return t;
	  };
	  URI.buildQuery = function(data, duplicateQueryParameters, escapeQuerySpace) {
	    // according to http://tools.ietf.org/html/rfc3986 or http://labs.apache.org/webarch/uri/rfc/rfc3986.html
	    // being »-._~!$&'()*+,;=:@/?« %HEX and alnum are allowed
	    // the RFC explicitly states ?/foo being a valid use case, no mention of parameter syntax!
	    // URI.js treats the query string as being application/x-www-form-urlencoded
	    // see http://www.w3.org/TR/REC-html40/interact/forms.html#form-content-type

	    var t = '';
	    var unique, key, i, length;
	    for (key in data) {
	      if (hasOwn.call(data, key) && key) {
	        if (isArray(data[key])) {
	          unique = {};
	          for (i = 0, length = data[key].length; i < length; i++) {
	            if (data[key][i] !== undefined && unique[data[key][i] + ''] === undefined) {
	              t += '&' + URI.buildQueryParameter(key, data[key][i], escapeQuerySpace);
	              if (duplicateQueryParameters !== true) {
	                unique[data[key][i] + ''] = true;
	              }
	            }
	          }
	        } else if (data[key] !== undefined) {
	          t += '&' + URI.buildQueryParameter(key, data[key], escapeQuerySpace);
	        }
	      }
	    }

	    return t.substring(1);
	  };
	  URI.buildQueryParameter = function(name, value, escapeQuerySpace) {
	    // http://www.w3.org/TR/REC-html40/interact/forms.html#form-content-type -- application/x-www-form-urlencoded
	    // don't append "=" for null values, according to http://dvcs.w3.org/hg/url/raw-file/tip/Overview.html#url-parameter-serialization
	    return URI.encodeQuery(name, escapeQuerySpace) + (value !== null ? '=' + URI.encodeQuery(value, escapeQuerySpace) : '');
	  };

	  URI.addQuery = function(data, name, value) {
	    if (typeof name === 'object') {
	      for (var key in name) {
	        if (hasOwn.call(name, key)) {
	          URI.addQuery(data, key, name[key]);
	        }
	      }
	    } else if (typeof name === 'string') {
	      if (data[name] === undefined) {
	        data[name] = value;
	        return;
	      } else if (typeof data[name] === 'string') {
	        data[name] = [data[name]];
	      }

	      if (!isArray(value)) {
	        value = [value];
	      }

	      data[name] = (data[name] || []).concat(value);
	    } else {
	      throw new TypeError('URI.addQuery() accepts an object, string as the name parameter');
	    }
	  };
	  URI.removeQuery = function(data, name, value) {
	    var i, length, key;

	    if (isArray(name)) {
	      for (i = 0, length = name.length; i < length; i++) {
	        data[name[i]] = undefined;
	      }
	    } else if (getType(name) === 'RegExp') {
	      for (key in data) {
	        if (name.test(key)) {
	          data[key] = undefined;
	        }
	      }
	    } else if (typeof name === 'object') {
	      for (key in name) {
	        if (hasOwn.call(name, key)) {
	          URI.removeQuery(data, key, name[key]);
	        }
	      }
	    } else if (typeof name === 'string') {
	      if (value !== undefined) {
	        if (getType(value) === 'RegExp') {
	          if (!isArray(data[name]) && value.test(data[name])) {
	            data[name] = undefined;
	          } else {
	            data[name] = filterArrayValues(data[name], value);
	          }
	        } else if (data[name] === value) {
	          data[name] = undefined;
	        } else if (isArray(data[name])) {
	          data[name] = filterArrayValues(data[name], value);
	        }
	      } else {
	        data[name] = undefined;
	      }
	    } else {
	      throw new TypeError('URI.removeQuery() accepts an object, string, RegExp as the first parameter');
	    }
	  };
	  URI.hasQuery = function(data, name, value, withinArray) {
	    if (typeof name === 'object') {
	      for (var key in name) {
	        if (hasOwn.call(name, key)) {
	          if (!URI.hasQuery(data, key, name[key])) {
	            return false;
	          }
	        }
	      }

	      return true;
	    } else if (typeof name !== 'string') {
	      throw new TypeError('URI.hasQuery() accepts an object, string as the name parameter');
	    }

	    switch (getType(value)) {
	      case 'Undefined':
	        // true if exists (but may be empty)
	        return name in data; // data[name] !== undefined;

	      case 'Boolean':
	        // true if exists and non-empty
	        var _booly = Boolean(isArray(data[name]) ? data[name].length : data[name]);
	        return value === _booly;

	      case 'Function':
	        // allow complex comparison
	        return !!value(data[name], name, data);

	      case 'Array':
	        if (!isArray(data[name])) {
	          return false;
	        }

	        var op = withinArray ? arrayContains : arraysEqual;
	        return op(data[name], value);

	      case 'RegExp':
	        if (!isArray(data[name])) {
	          return Boolean(data[name] && data[name].match(value));
	        }

	        if (!withinArray) {
	          return false;
	        }

	        return arrayContains(data[name], value);

	      case 'Number':
	        value = String(value);
	        /* falls through */
	      case 'String':
	        if (!isArray(data[name])) {
	          return data[name] === value;
	        }

	        if (!withinArray) {
	          return false;
	        }

	        return arrayContains(data[name], value);

	      default:
	        throw new TypeError('URI.hasQuery() accepts undefined, boolean, string, number, RegExp, Function as the value parameter');
	    }
	  };


	  URI.commonPath = function(one, two) {
	    var length = Math.min(one.length, two.length);
	    var pos;

	    // find first non-matching character
	    for (pos = 0; pos < length; pos++) {
	      if (one.charAt(pos) !== two.charAt(pos)) {
	        pos--;
	        break;
	      }
	    }

	    if (pos < 1) {
	      return one.charAt(0) === two.charAt(0) && one.charAt(0) === '/' ? '/' : '';
	    }

	    // revert to last /
	    if (one.charAt(pos) !== '/' || two.charAt(pos) !== '/') {
	      pos = one.substring(0, pos).lastIndexOf('/');
	    }

	    return one.substring(0, pos + 1);
	  };

	  URI.withinString = function(string, callback, options) {
	    options || (options = {});
	    var _start = options.start || URI.findUri.start;
	    var _end = options.end || URI.findUri.end;
	    var _trim = options.trim || URI.findUri.trim;
	    var _attributeOpen = /[a-z0-9-]=["']?$/i;

	    _start.lastIndex = 0;
	    while (true) {
	      var match = _start.exec(string);
	      if (!match) {
	        break;
	      }

	      var start = match.index;
	      if (options.ignoreHtml) {
	        // attribut(e=["']?$)
	        var attributeOpen = string.slice(Math.max(start - 3, 0), start);
	        if (attributeOpen && _attributeOpen.test(attributeOpen)) {
	          continue;
	        }
	      }

	      var end = start + string.slice(start).search(_end);
	      var slice = string.slice(start, end).replace(_trim, '');
	      if (options.ignore && options.ignore.test(slice)) {
	        continue;
	      }

	      end = start + slice.length;
	      var result = callback(slice, start, end, string);
	      string = string.slice(0, start) + result + string.slice(end);
	      _start.lastIndex = start + result.length;
	    }

	    _start.lastIndex = 0;
	    return string;
	  };

	  URI.ensureValidHostname = function(v) {
	    // Theoretically URIs allow percent-encoding in Hostnames (according to RFC 3986)
	    // they are not part of DNS and therefore ignored by URI.js

	    if (v.match(URI.invalid_hostname_characters)) {
	      // test punycode
	      if (!punycode) {
	        throw new TypeError('Hostname "' + v + '" contains characters other than [A-Z0-9.-] and Punycode.js is not available');
	      }

	      if (punycode.toASCII(v).match(URI.invalid_hostname_characters)) {
	        throw new TypeError('Hostname "' + v + '" contains characters other than [A-Z0-9.-]');
	      }
	    }
	  };

	  // noConflict
	  URI.noConflict = function(removeAll) {
	    if (removeAll) {
	      var unconflicted = {
	        URI: this.noConflict()
	      };

	      if (root.URITemplate && typeof root.URITemplate.noConflict === 'function') {
	        unconflicted.URITemplate = root.URITemplate.noConflict();
	      }

	      if (root.IPv6 && typeof root.IPv6.noConflict === 'function') {
	        unconflicted.IPv6 = root.IPv6.noConflict();
	      }

	      if (root.SecondLevelDomains && typeof root.SecondLevelDomains.noConflict === 'function') {
	        unconflicted.SecondLevelDomains = root.SecondLevelDomains.noConflict();
	      }

	      return unconflicted;
	    } else if (root.URI === this) {
	      root.URI = _URI;
	    }

	    return this;
	  };

	  p.build = function(deferBuild) {
	    if (deferBuild === true) {
	      this._deferred_build = true;
	    } else if (deferBuild === undefined || this._deferred_build) {
	      this._string = URI.build(this._parts);
	      this._deferred_build = false;
	    }

	    return this;
	  };

	  p.clone = function() {
	    return new URI(this);
	  };

	  p.valueOf = p.toString = function() {
	    return this.build(false)._string;
	  };


	  function generateSimpleAccessor(_part){
	    return function(v, build) {
	      if (v === undefined) {
	        return this._parts[_part] || '';
	      } else {
	        this._parts[_part] = v || null;
	        this.build(!build);
	        return this;
	      }
	    };
	  }

	  function generatePrefixAccessor(_part, _key){
	    return function(v, build) {
	      if (v === undefined) {
	        return this._parts[_part] || '';
	      } else {
	        if (v !== null) {
	          v = v + '';
	          if (v.charAt(0) === _key) {
	            v = v.substring(1);
	          }
	        }

	        this._parts[_part] = v;
	        this.build(!build);
	        return this;
	      }
	    };
	  }

	  p.protocol = generateSimpleAccessor('protocol');
	  p.username = generateSimpleAccessor('username');
	  p.password = generateSimpleAccessor('password');
	  p.hostname = generateSimpleAccessor('hostname');
	  p.port = generateSimpleAccessor('port');
	  p.query = generatePrefixAccessor('query', '?');
	  p.fragment = generatePrefixAccessor('fragment', '#');

	  p.search = function(v, build) {
	    var t = this.query(v, build);
	    return typeof t === 'string' && t.length ? ('?' + t) : t;
	  };
	  p.hash = function(v, build) {
	    var t = this.fragment(v, build);
	    return typeof t === 'string' && t.length ? ('#' + t) : t;
	  };

	  p.pathname = function(v, build) {
	    if (v === undefined || v === true) {
	      var res = this._parts.path || (this._parts.hostname ? '/' : '');
	      return v ? (this._parts.urn ? URI.decodeUrnPath : URI.decodePath)(res) : res;
	    } else {
	      if (this._parts.urn) {
	        this._parts.path = v ? URI.recodeUrnPath(v) : '';
	      } else {
	        this._parts.path = v ? URI.recodePath(v) : '/';
	      }
	      this.build(!build);
	      return this;
	    }
	  };
	  p.path = p.pathname;
	  p.href = function(href, build) {
	    var key;

	    if (href === undefined) {
	      return this.toString();
	    }

	    this._string = '';
	    this._parts = URI._parts();

	    var _URI = href instanceof URI;
	    var _object = typeof href === 'object' && (href.hostname || href.path || href.pathname);
	    if (href.nodeName) {
	      var attribute = URI.getDomAttribute(href);
	      href = href[attribute] || '';
	      _object = false;
	    }

	    // window.location is reported to be an object, but it's not the sort
	    // of object we're looking for:
	    // * location.protocol ends with a colon
	    // * location.query != object.search
	    // * location.hash != object.fragment
	    // simply serializing the unknown object should do the trick
	    // (for location, not for everything...)
	    if (!_URI && _object && href.pathname !== undefined) {
	      href = href.toString();
	    }

	    if (typeof href === 'string' || href instanceof String) {
	      this._parts = URI.parse(String(href), this._parts);
	    } else if (_URI || _object) {
	      var src = _URI ? href._parts : href;
	      for (key in src) {
	        if (hasOwn.call(this._parts, key)) {
	          this._parts[key] = src[key];
	        }
	      }
	    } else {
	      throw new TypeError('invalid input');
	    }

	    this.build(!build);
	    return this;
	  };

	  // identification accessors
	  p.is = function(what) {
	    var ip = false;
	    var ip4 = false;
	    var ip6 = false;
	    var name = false;
	    var sld = false;
	    var idn = false;
	    var punycode = false;
	    var relative = !this._parts.urn;

	    if (this._parts.hostname) {
	      relative = false;
	      ip4 = URI.ip4_expression.test(this._parts.hostname);
	      ip6 = URI.ip6_expression.test(this._parts.hostname);
	      ip = ip4 || ip6;
	      name = !ip;
	      sld = name && SLD && SLD.has(this._parts.hostname);
	      idn = name && URI.idn_expression.test(this._parts.hostname);
	      punycode = name && URI.punycode_expression.test(this._parts.hostname);
	    }

	    switch (what.toLowerCase()) {
	      case 'relative':
	        return relative;

	      case 'absolute':
	        return !relative;

	      // hostname identification
	      case 'domain':
	      case 'name':
	        return name;

	      case 'sld':
	        return sld;

	      case 'ip':
	        return ip;

	      case 'ip4':
	      case 'ipv4':
	      case 'inet4':
	        return ip4;

	      case 'ip6':
	      case 'ipv6':
	      case 'inet6':
	        return ip6;

	      case 'idn':
	        return idn;

	      case 'url':
	        return !this._parts.urn;

	      case 'urn':
	        return !!this._parts.urn;

	      case 'punycode':
	        return punycode;
	    }

	    return null;
	  };

	  // component specific input validation
	  var _protocol = p.protocol;
	  var _port = p.port;
	  var _hostname = p.hostname;

	  p.protocol = function(v, build) {
	    if (v !== undefined) {
	      if (v) {
	        // accept trailing ://
	        v = v.replace(/:(\/\/)?$/, '');

	        if (!v.match(URI.protocol_expression)) {
	          throw new TypeError('Protocol "' + v + '" contains characters other than [A-Z0-9.+-] or doesn\'t start with [A-Z]');
	        }
	      }
	    }
	    return _protocol.call(this, v, build);
	  };
	  p.scheme = p.protocol;
	  p.port = function(v, build) {
	    if (this._parts.urn) {
	      return v === undefined ? '' : this;
	    }

	    if (v !== undefined) {
	      if (v === 0) {
	        v = null;
	      }

	      if (v) {
	        v += '';
	        if (v.charAt(0) === ':') {
	          v = v.substring(1);
	        }

	        if (v.match(/[^0-9]/)) {
	          throw new TypeError('Port "' + v + '" contains characters other than [0-9]');
	        }
	      }
	    }
	    return _port.call(this, v, build);
	  };
	  p.hostname = function(v, build) {
	    if (this._parts.urn) {
	      return v === undefined ? '' : this;
	    }

	    if (v !== undefined) {
	      var x = {};
	      var res = URI.parseHost(v, x);
	      if (res !== '/') {
	        throw new TypeError('Hostname "' + v + '" contains characters other than [A-Z0-9.-]');
	      }

	      v = x.hostname;
	    }
	    return _hostname.call(this, v, build);
	  };

	  // compound accessors
	  p.host = function(v, build) {
	    if (this._parts.urn) {
	      return v === undefined ? '' : this;
	    }

	    if (v === undefined) {
	      return this._parts.hostname ? URI.buildHost(this._parts) : '';
	    } else {
	      var res = URI.parseHost(v, this._parts);
	      if (res !== '/') {
	        throw new TypeError('Hostname "' + v + '" contains characters other than [A-Z0-9.-]');
	      }

	      this.build(!build);
	      return this;
	    }
	  };
	  p.authority = function(v, build) {
	    if (this._parts.urn) {
	      return v === undefined ? '' : this;
	    }

	    if (v === undefined) {
	      return this._parts.hostname ? URI.buildAuthority(this._parts) : '';
	    } else {
	      var res = URI.parseAuthority(v, this._parts);
	      if (res !== '/') {
	        throw new TypeError('Hostname "' + v + '" contains characters other than [A-Z0-9.-]');
	      }

	      this.build(!build);
	      return this;
	    }
	  };
	  p.userinfo = function(v, build) {
	    if (this._parts.urn) {
	      return v === undefined ? '' : this;
	    }

	    if (v === undefined) {
	      if (!this._parts.username) {
	        return '';
	      }

	      var t = URI.buildUserinfo(this._parts);
	      return t.substring(0, t.length -1);
	    } else {
	      if (v[v.length-1] !== '@') {
	        v += '@';
	      }

	      URI.parseUserinfo(v, this._parts);
	      this.build(!build);
	      return this;
	    }
	  };
	  p.resource = function(v, build) {
	    var parts;

	    if (v === undefined) {
	      return this.path() + this.search() + this.hash();
	    }

	    parts = URI.parse(v);
	    this._parts.path = parts.path;
	    this._parts.query = parts.query;
	    this._parts.fragment = parts.fragment;
	    this.build(!build);
	    return this;
	  };

	  // fraction accessors
	  p.subdomain = function(v, build) {
	    if (this._parts.urn) {
	      return v === undefined ? '' : this;
	    }

	    // convenience, return "www" from "www.example.org"
	    if (v === undefined) {
	      if (!this._parts.hostname || this.is('IP')) {
	        return '';
	      }

	      // grab domain and add another segment
	      var end = this._parts.hostname.length - this.domain().length - 1;
	      return this._parts.hostname.substring(0, end) || '';
	    } else {
	      var e = this._parts.hostname.length - this.domain().length;
	      var sub = this._parts.hostname.substring(0, e);
	      var replace = new RegExp('^' + escapeRegEx(sub));

	      if (v && v.charAt(v.length - 1) !== '.') {
	        v += '.';
	      }

	      if (v) {
	        URI.ensureValidHostname(v);
	      }

	      this._parts.hostname = this._parts.hostname.replace(replace, v);
	      this.build(!build);
	      return this;
	    }
	  };
	  p.domain = function(v, build) {
	    if (this._parts.urn) {
	      return v === undefined ? '' : this;
	    }

	    if (typeof v === 'boolean') {
	      build = v;
	      v = undefined;
	    }

	    // convenience, return "example.org" from "www.example.org"
	    if (v === undefined) {
	      if (!this._parts.hostname || this.is('IP')) {
	        return '';
	      }

	      // if hostname consists of 1 or 2 segments, it must be the domain
	      var t = this._parts.hostname.match(/\./g);
	      if (t && t.length < 2) {
	        return this._parts.hostname;
	      }

	      // grab tld and add another segment
	      var end = this._parts.hostname.length - this.tld(build).length - 1;
	      end = this._parts.hostname.lastIndexOf('.', end -1) + 1;
	      return this._parts.hostname.substring(end) || '';
	    } else {
	      if (!v) {
	        throw new TypeError('cannot set domain empty');
	      }

	      URI.ensureValidHostname(v);

	      if (!this._parts.hostname || this.is('IP')) {
	        this._parts.hostname = v;
	      } else {
	        var replace = new RegExp(escapeRegEx(this.domain()) + '$');
	        this._parts.hostname = this._parts.hostname.replace(replace, v);
	      }

	      this.build(!build);
	      return this;
	    }
	  };
	  p.tld = function(v, build) {
	    if (this._parts.urn) {
	      return v === undefined ? '' : this;
	    }

	    if (typeof v === 'boolean') {
	      build = v;
	      v = undefined;
	    }

	    // return "org" from "www.example.org"
	    if (v === undefined) {
	      if (!this._parts.hostname || this.is('IP')) {
	        return '';
	      }

	      var pos = this._parts.hostname.lastIndexOf('.');
	      var tld = this._parts.hostname.substring(pos + 1);

	      if (build !== true && SLD && SLD.list[tld.toLowerCase()]) {
	        return SLD.get(this._parts.hostname) || tld;
	      }

	      return tld;
	    } else {
	      var replace;

	      if (!v) {
	        throw new TypeError('cannot set TLD empty');
	      } else if (v.match(/[^a-zA-Z0-9-]/)) {
	        if (SLD && SLD.is(v)) {
	          replace = new RegExp(escapeRegEx(this.tld()) + '$');
	          this._parts.hostname = this._parts.hostname.replace(replace, v);
	        } else {
	          throw new TypeError('TLD "' + v + '" contains characters other than [A-Z0-9]');
	        }
	      } else if (!this._parts.hostname || this.is('IP')) {
	        throw new ReferenceError('cannot set TLD on non-domain host');
	      } else {
	        replace = new RegExp(escapeRegEx(this.tld()) + '$');
	        this._parts.hostname = this._parts.hostname.replace(replace, v);
	      }

	      this.build(!build);
	      return this;
	    }
	  };
	  p.directory = function(v, build) {
	    if (this._parts.urn) {
	      return v === undefined ? '' : this;
	    }

	    if (v === undefined || v === true) {
	      if (!this._parts.path && !this._parts.hostname) {
	        return '';
	      }

	      if (this._parts.path === '/') {
	        return '/';
	      }

	      var end = this._parts.path.length - this.filename().length - 1;
	      var res = this._parts.path.substring(0, end) || (this._parts.hostname ? '/' : '');

	      return v ? URI.decodePath(res) : res;

	    } else {
	      var e = this._parts.path.length - this.filename().length;
	      var directory = this._parts.path.substring(0, e);
	      var replace = new RegExp('^' + escapeRegEx(directory));

	      // fully qualifier directories begin with a slash
	      if (!this.is('relative')) {
	        if (!v) {
	          v = '/';
	        }

	        if (v.charAt(0) !== '/') {
	          v = '/' + v;
	        }
	      }

	      // directories always end with a slash
	      if (v && v.charAt(v.length - 1) !== '/') {
	        v += '/';
	      }

	      v = URI.recodePath(v);
	      this._parts.path = this._parts.path.replace(replace, v);
	      this.build(!build);
	      return this;
	    }
	  };
	  p.filename = function(v, build) {
	    if (this._parts.urn) {
	      return v === undefined ? '' : this;
	    }

	    if (v === undefined || v === true) {
	      if (!this._parts.path || this._parts.path === '/') {
	        return '';
	      }

	      var pos = this._parts.path.lastIndexOf('/');
	      var res = this._parts.path.substring(pos+1);

	      return v ? URI.decodePathSegment(res) : res;
	    } else {
	      var mutatedDirectory = false;

	      if (v.charAt(0) === '/') {
	        v = v.substring(1);
	      }

	      if (v.match(/\.?\//)) {
	        mutatedDirectory = true;
	      }

	      var replace = new RegExp(escapeRegEx(this.filename()) + '$');
	      v = URI.recodePath(v);
	      this._parts.path = this._parts.path.replace(replace, v);

	      if (mutatedDirectory) {
	        this.normalizePath(build);
	      } else {
	        this.build(!build);
	      }

	      return this;
	    }
	  };
	  p.suffix = function(v, build) {
	    if (this._parts.urn) {
	      return v === undefined ? '' : this;
	    }

	    if (v === undefined || v === true) {
	      if (!this._parts.path || this._parts.path === '/') {
	        return '';
	      }

	      var filename = this.filename();
	      var pos = filename.lastIndexOf('.');
	      var s, res;

	      if (pos === -1) {
	        return '';
	      }

	      // suffix may only contain alnum characters (yup, I made this up.)
	      s = filename.substring(pos+1);
	      res = (/^[a-z0-9%]+$/i).test(s) ? s : '';
	      return v ? URI.decodePathSegment(res) : res;
	    } else {
	      if (v.charAt(0) === '.') {
	        v = v.substring(1);
	      }

	      var suffix = this.suffix();
	      var replace;

	      if (!suffix) {
	        if (!v) {
	          return this;
	        }

	        this._parts.path += '.' + URI.recodePath(v);
	      } else if (!v) {
	        replace = new RegExp(escapeRegEx('.' + suffix) + '$');
	      } else {
	        replace = new RegExp(escapeRegEx(suffix) + '$');
	      }

	      if (replace) {
	        v = URI.recodePath(v);
	        this._parts.path = this._parts.path.replace(replace, v);
	      }

	      this.build(!build);
	      return this;
	    }
	  };
	  p.segment = function(segment, v, build) {
	    var separator = this._parts.urn ? ':' : '/';
	    var path = this.path();
	    var absolute = path.substring(0, 1) === '/';
	    var segments = path.split(separator);

	    if (segment !== undefined && typeof segment !== 'number') {
	      build = v;
	      v = segment;
	      segment = undefined;
	    }

	    if (segment !== undefined && typeof segment !== 'number') {
	      throw new Error('Bad segment "' + segment + '", must be 0-based integer');
	    }

	    if (absolute) {
	      segments.shift();
	    }

	    if (segment < 0) {
	      // allow negative indexes to address from the end
	      segment = Math.max(segments.length + segment, 0);
	    }

	    if (v === undefined) {
	      /*jshint laxbreak: true */
	      return segment === undefined
	        ? segments
	        : segments[segment];
	      /*jshint laxbreak: false */
	    } else if (segment === null || segments[segment] === undefined) {
	      if (isArray(v)) {
	        segments = [];
	        // collapse empty elements within array
	        for (var i=0, l=v.length; i < l; i++) {
	          if (!v[i].length && (!segments.length || !segments[segments.length -1].length)) {
	            continue;
	          }

	          if (segments.length && !segments[segments.length -1].length) {
	            segments.pop();
	          }

	          segments.push(v[i]);
	        }
	      } else if (v || typeof v === 'string') {
	        if (segments[segments.length -1] === '') {
	          // empty trailing elements have to be overwritten
	          // to prevent results such as /foo//bar
	          segments[segments.length -1] = v;
	        } else {
	          segments.push(v);
	        }
	      }
	    } else {
	      if (v) {
	        segments[segment] = v;
	      } else {
	        segments.splice(segment, 1);
	      }
	    }

	    if (absolute) {
	      segments.unshift('');
	    }

	    return this.path(segments.join(separator), build);
	  };
	  p.segmentCoded = function(segment, v, build) {
	    var segments, i, l;

	    if (typeof segment !== 'number') {
	      build = v;
	      v = segment;
	      segment = undefined;
	    }

	    if (v === undefined) {
	      segments = this.segment(segment, v, build);
	      if (!isArray(segments)) {
	        segments = segments !== undefined ? URI.decode(segments) : undefined;
	      } else {
	        for (i = 0, l = segments.length; i < l; i++) {
	          segments[i] = URI.decode(segments[i]);
	        }
	      }

	      return segments;
	    }

	    if (!isArray(v)) {
	      v = (typeof v === 'string' || v instanceof String) ? URI.encode(v) : v;
	    } else {
	      for (i = 0, l = v.length; i < l; i++) {
	        v[i] = URI.encode(v[i]);
	      }
	    }

	    return this.segment(segment, v, build);
	  };

	  // mutating query string
	  var q = p.query;
	  p.query = function(v, build) {
	    if (v === true) {
	      return URI.parseQuery(this._parts.query, this._parts.escapeQuerySpace);
	    } else if (typeof v === 'function') {
	      var data = URI.parseQuery(this._parts.query, this._parts.escapeQuerySpace);
	      var result = v.call(this, data);
	      this._parts.query = URI.buildQuery(result || data, this._parts.duplicateQueryParameters, this._parts.escapeQuerySpace);
	      this.build(!build);
	      return this;
	    } else if (v !== undefined && typeof v !== 'string') {
	      this._parts.query = URI.buildQuery(v, this._parts.duplicateQueryParameters, this._parts.escapeQuerySpace);
	      this.build(!build);
	      return this;
	    } else {
	      return q.call(this, v, build);
	    }
	  };
	  p.setQuery = function(name, value, build) {
	    var data = URI.parseQuery(this._parts.query, this._parts.escapeQuerySpace);

	    if (typeof name === 'string' || name instanceof String) {
	      data[name] = value !== undefined ? value : null;
	    } else if (typeof name === 'object') {
	      for (var key in name) {
	        if (hasOwn.call(name, key)) {
	          data[key] = name[key];
	        }
	      }
	    } else {
	      throw new TypeError('URI.addQuery() accepts an object, string as the name parameter');
	    }

	    this._parts.query = URI.buildQuery(data, this._parts.duplicateQueryParameters, this._parts.escapeQuerySpace);
	    if (typeof name !== 'string') {
	      build = value;
	    }

	    this.build(!build);
	    return this;
	  };
	  p.addQuery = function(name, value, build) {
	    var data = URI.parseQuery(this._parts.query, this._parts.escapeQuerySpace);
	    URI.addQuery(data, name, value === undefined ? null : value);
	    this._parts.query = URI.buildQuery(data, this._parts.duplicateQueryParameters, this._parts.escapeQuerySpace);
	    if (typeof name !== 'string') {
	      build = value;
	    }

	    this.build(!build);
	    return this;
	  };
	  p.removeQuery = function(name, value, build) {
	    var data = URI.parseQuery(this._parts.query, this._parts.escapeQuerySpace);
	    URI.removeQuery(data, name, value);
	    this._parts.query = URI.buildQuery(data, this._parts.duplicateQueryParameters, this._parts.escapeQuerySpace);
	    if (typeof name !== 'string') {
	      build = value;
	    }

	    this.build(!build);
	    return this;
	  };
	  p.hasQuery = function(name, value, withinArray) {
	    var data = URI.parseQuery(this._parts.query, this._parts.escapeQuerySpace);
	    return URI.hasQuery(data, name, value, withinArray);
	  };
	  p.setSearch = p.setQuery;
	  p.addSearch = p.addQuery;
	  p.removeSearch = p.removeQuery;
	  p.hasSearch = p.hasQuery;

	  // sanitizing URLs
	  p.normalize = function() {
	    if (this._parts.urn) {
	      return this
	        .normalizeProtocol(false)
	        .normalizePath(false)
	        .normalizeQuery(false)
	        .normalizeFragment(false)
	        .build();
	    }

	    return this
	      .normalizeProtocol(false)
	      .normalizeHostname(false)
	      .normalizePort(false)
	      .normalizePath(false)
	      .normalizeQuery(false)
	      .normalizeFragment(false)
	      .build();
	  };
	  p.normalizeProtocol = function(build) {
	    if (typeof this._parts.protocol === 'string') {
	      this._parts.protocol = this._parts.protocol.toLowerCase();
	      this.build(!build);
	    }

	    return this;
	  };
	  p.normalizeHostname = function(build) {
	    if (this._parts.hostname) {
	      if (this.is('IDN') && punycode) {
	        this._parts.hostname = punycode.toASCII(this._parts.hostname);
	      } else if (this.is('IPv6') && IPv6) {
	        this._parts.hostname = IPv6.best(this._parts.hostname);
	      }

	      this._parts.hostname = this._parts.hostname.toLowerCase();
	      this.build(!build);
	    }

	    return this;
	  };
	  p.normalizePort = function(build) {
	    // remove port of it's the protocol's default
	    if (typeof this._parts.protocol === 'string' && this._parts.port === URI.defaultPorts[this._parts.protocol]) {
	      this._parts.port = null;
	      this.build(!build);
	    }

	    return this;
	  };
	  p.normalizePath = function(build) {
	    var _path = this._parts.path;
	    if (!_path) {
	      return this;
	    }

	    if (this._parts.urn) {
	      this._parts.path = URI.recodeUrnPath(this._parts.path);
	      this.build(!build);
	      return this;
	    }

	    if (this._parts.path === '/') {
	      return this;
	    }

	    var _was_relative;
	    var _leadingParents = '';
	    var _parent, _pos;

	    // handle relative paths
	    if (_path.charAt(0) !== '/') {
	      _was_relative = true;
	      _path = '/' + _path;
	    }

	    // handle relative files (as opposed to directories)
	    if (_path.slice(-3) === '/..' || _path.slice(-2) === '/.') {
	      _path += '/';
	    }

	    // resolve simples
	    _path = _path
	      .replace(/(\/(\.\/)+)|(\/\.$)/g, '/')
	      .replace(/\/{2,}/g, '/');

	    // remember leading parents
	    if (_was_relative) {
	      _leadingParents = _path.substring(1).match(/^(\.\.\/)+/) || '';
	      if (_leadingParents) {
	        _leadingParents = _leadingParents[0];
	      }
	    }

	    // resolve parents
	    while (true) {
	      _parent = _path.indexOf('/..');
	      if (_parent === -1) {
	        // no more ../ to resolve
	        break;
	      } else if (_parent === 0) {
	        // top level cannot be relative, skip it
	        _path = _path.substring(3);
	        continue;
	      }

	      _pos = _path.substring(0, _parent).lastIndexOf('/');
	      if (_pos === -1) {
	        _pos = _parent;
	      }
	      _path = _path.substring(0, _pos) + _path.substring(_parent + 3);
	    }

	    // revert to relative
	    if (_was_relative && this.is('relative')) {
	      _path = _leadingParents + _path.substring(1);
	    }

	    _path = URI.recodePath(_path);
	    this._parts.path = _path;
	    this.build(!build);
	    return this;
	  };
	  p.normalizePathname = p.normalizePath;
	  p.normalizeQuery = function(build) {
	    if (typeof this._parts.query === 'string') {
	      if (!this._parts.query.length) {
	        this._parts.query = null;
	      } else {
	        this.query(URI.parseQuery(this._parts.query, this._parts.escapeQuerySpace));
	      }

	      this.build(!build);
	    }

	    return this;
	  };
	  p.normalizeFragment = function(build) {
	    if (!this._parts.fragment) {
	      this._parts.fragment = null;
	      this.build(!build);
	    }

	    return this;
	  };
	  p.normalizeSearch = p.normalizeQuery;
	  p.normalizeHash = p.normalizeFragment;

	  p.iso8859 = function() {
	    // expect unicode input, iso8859 output
	    var e = URI.encode;
	    var d = URI.decode;

	    URI.encode = escape;
	    URI.decode = decodeURIComponent;
	    try {
	      this.normalize();
	    } finally {
	      URI.encode = e;
	      URI.decode = d;
	    }
	    return this;
	  };

	  p.unicode = function() {
	    // expect iso8859 input, unicode output
	    var e = URI.encode;
	    var d = URI.decode;

	    URI.encode = strictEncodeURIComponent;
	    URI.decode = unescape;
	    try {
	      this.normalize();
	    } finally {
	      URI.encode = e;
	      URI.decode = d;
	    }
	    return this;
	  };

	  p.readable = function() {
	    var uri = this.clone();
	    // removing username, password, because they shouldn't be displayed according to RFC 3986
	    uri.username('').password('').normalize();
	    var t = '';
	    if (uri._parts.protocol) {
	      t += uri._parts.protocol + '://';
	    }

	    if (uri._parts.hostname) {
	      if (uri.is('punycode') && punycode) {
	        t += punycode.toUnicode(uri._parts.hostname);
	        if (uri._parts.port) {
	          t += ':' + uri._parts.port;
	        }
	      } else {
	        t += uri.host();
	      }
	    }

	    if (uri._parts.hostname && uri._parts.path && uri._parts.path.charAt(0) !== '/') {
	      t += '/';
	    }

	    t += uri.path(true);
	    if (uri._parts.query) {
	      var q = '';
	      for (var i = 0, qp = uri._parts.query.split('&'), l = qp.length; i < l; i++) {
	        var kv = (qp[i] || '').split('=');
	        q += '&' + URI.decodeQuery(kv[0], this._parts.escapeQuerySpace)
	          .replace(/&/g, '%26');

	        if (kv[1] !== undefined) {
	          q += '=' + URI.decodeQuery(kv[1], this._parts.escapeQuerySpace)
	            .replace(/&/g, '%26');
	        }
	      }
	      t += '?' + q.substring(1);
	    }

	    t += URI.decodeQuery(uri.hash(), true);
	    return t;
	  };

	  // resolving relative and absolute URLs
	  p.absoluteTo = function(base) {
	    var resolved = this.clone();
	    var properties = ['protocol', 'username', 'password', 'hostname', 'port'];
	    var basedir, i, p;

	    if (this._parts.urn) {
	      throw new Error('URNs do not have any generally defined hierarchical components');
	    }

	    if (!(base instanceof URI)) {
	      base = new URI(base);
	    }

	    if (!resolved._parts.protocol) {
	      resolved._parts.protocol = base._parts.protocol;
	    }

	    if (this._parts.hostname) {
	      return resolved;
	    }

	    for (i = 0; (p = properties[i]); i++) {
	      resolved._parts[p] = base._parts[p];
	    }

	    if (!resolved._parts.path) {
	      resolved._parts.path = base._parts.path;
	      if (!resolved._parts.query) {
	        resolved._parts.query = base._parts.query;
	      }
	    } else if (resolved._parts.path.substring(-2) === '..') {
	      resolved._parts.path += '/';
	    }

	    if (resolved.path().charAt(0) !== '/') {
	      basedir = base.directory();
	      basedir = basedir ? basedir : base.path().indexOf('/') === 0 ? '/' : '';
	      resolved._parts.path = (basedir ? (basedir + '/') : '') + resolved._parts.path;
	      resolved.normalizePath();
	    }

	    resolved.build();
	    return resolved;
	  };
	  p.relativeTo = function(base) {
	    var relative = this.clone().normalize();
	    var relativeParts, baseParts, common, relativePath, basePath;

	    if (relative._parts.urn) {
	      throw new Error('URNs do not have any generally defined hierarchical components');
	    }

	    base = new URI(base).normalize();
	    relativeParts = relative._parts;
	    baseParts = base._parts;
	    relativePath = relative.path();
	    basePath = base.path();

	    if (relativePath.charAt(0) !== '/') {
	      throw new Error('URI is already relative');
	    }

	    if (basePath.charAt(0) !== '/') {
	      throw new Error('Cannot calculate a URI relative to another relative URI');
	    }

	    if (relativeParts.protocol === baseParts.protocol) {
	      relativeParts.protocol = null;
	    }

	    if (relativeParts.username !== baseParts.username || relativeParts.password !== baseParts.password) {
	      return relative.build();
	    }

	    if (relativeParts.protocol !== null || relativeParts.username !== null || relativeParts.password !== null) {
	      return relative.build();
	    }

	    if (relativeParts.hostname === baseParts.hostname && relativeParts.port === baseParts.port) {
	      relativeParts.hostname = null;
	      relativeParts.port = null;
	    } else {
	      return relative.build();
	    }

	    if (relativePath === basePath) {
	      relativeParts.path = '';
	      return relative.build();
	    }

	    // determine common sub path
	    common = URI.commonPath(relativePath, basePath);

	    // If the paths have nothing in common, return a relative URL with the absolute path.
	    if (!common) {
	      return relative.build();
	    }

	    var parents = baseParts.path
	      .substring(common.length)
	      .replace(/[^\/]*$/, '')
	      .replace(/.*?\//g, '../');

	    relativeParts.path = (parents + relativeParts.path.substring(common.length)) || './';

	    return relative.build();
	  };

	  // comparing URIs
	  p.equals = function(uri) {
	    var one = this.clone();
	    var two = new URI(uri);
	    var one_map = {};
	    var two_map = {};
	    var checked = {};
	    var one_query, two_query, key;

	    one.normalize();
	    two.normalize();

	    // exact match
	    if (one.toString() === two.toString()) {
	      return true;
	    }

	    // extract query string
	    one_query = one.query();
	    two_query = two.query();
	    one.query('');
	    two.query('');

	    // definitely not equal if not even non-query parts match
	    if (one.toString() !== two.toString()) {
	      return false;
	    }

	    // query parameters have the same length, even if they're permuted
	    if (one_query.length !== two_query.length) {
	      return false;
	    }

	    one_map = URI.parseQuery(one_query, this._parts.escapeQuerySpace);
	    two_map = URI.parseQuery(two_query, this._parts.escapeQuerySpace);

	    for (key in one_map) {
	      if (hasOwn.call(one_map, key)) {
	        if (!isArray(one_map[key])) {
	          if (one_map[key] !== two_map[key]) {
	            return false;
	          }
	        } else if (!arraysEqual(one_map[key], two_map[key])) {
	          return false;
	        }

	        checked[key] = true;
	      }
	    }

	    for (key in two_map) {
	      if (hasOwn.call(two_map, key)) {
	        if (!checked[key]) {
	          // two contains a parameter not present in one
	          return false;
	        }
	      }
	    }

	    return true;
	  };

	  // state
	  p.duplicateQueryParameters = function(v) {
	    this._parts.duplicateQueryParameters = !!v;
	    return this;
	  };

	  p.escapeQuerySpace = function(v) {
	    this._parts.escapeQuerySpace = !!v;
	    return this;
	  };

	  return URI;
	}));


/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_RESULT__;/* WEBPACK VAR INJECTION */(function(module, global) {/*! http://mths.be/punycode v1.2.3 by @mathias */
	;(function(root) {

		/** Detect free variables */
		var freeExports = typeof exports == 'object' && exports;
		var freeModule = typeof module == 'object' && module &&
			module.exports == freeExports && module;
		var freeGlobal = typeof global == 'object' && global;
		if (freeGlobal.global === freeGlobal || freeGlobal.window === freeGlobal) {
			root = freeGlobal;
		}

		/**
		 * The `punycode` object.
		 * @name punycode
		 * @type Object
		 */
		var punycode,

		/** Highest positive signed 32-bit float value */
		maxInt = 2147483647, // aka. 0x7FFFFFFF or 2^31-1

		/** Bootstring parameters */
		base = 36,
		tMin = 1,
		tMax = 26,
		skew = 38,
		damp = 700,
		initialBias = 72,
		initialN = 128, // 0x80
		delimiter = '-', // '\x2D'

		/** Regular expressions */
		regexPunycode = /^xn--/,
		regexNonASCII = /[^ -~]/, // unprintable ASCII chars + non-ASCII chars
		regexSeparators = /\x2E|\u3002|\uFF0E|\uFF61/g, // RFC 3490 separators

		/** Error messages */
		errors = {
			'overflow': 'Overflow: input needs wider integers to process',
			'not-basic': 'Illegal input >= 0x80 (not a basic code point)',
			'invalid-input': 'Invalid input'
		},

		/** Convenience shortcuts */
		baseMinusTMin = base - tMin,
		floor = Math.floor,
		stringFromCharCode = String.fromCharCode,

		/** Temporary variable */
		key;

		/*--------------------------------------------------------------------------*/

		/**
		 * A generic error utility function.
		 * @private
		 * @param {String} type The error type.
		 * @returns {Error} Throws a `RangeError` with the applicable error message.
		 */
		function error(type) {
			throw RangeError(errors[type]);
		}

		/**
		 * A generic `Array#map` utility function.
		 * @private
		 * @param {Array} array The array to iterate over.
		 * @param {Function} callback The function that gets called for every array
		 * item.
		 * @returns {Array} A new array of values returned by the callback function.
		 */
		function map(array, fn) {
			var length = array.length;
			while (length--) {
				array[length] = fn(array[length]);
			}
			return array;
		}

		/**
		 * A simple `Array#map`-like wrapper to work with domain name strings.
		 * @private
		 * @param {String} domain The domain name.
		 * @param {Function} callback The function that gets called for every
		 * character.
		 * @returns {Array} A new string of characters returned by the callback
		 * function.
		 */
		function mapDomain(string, fn) {
			return map(string.split(regexSeparators), fn).join('.');
		}

		/**
		 * Creates an array containing the numeric code points of each Unicode
		 * character in the string. While JavaScript uses UCS-2 internally,
		 * this function will convert a pair of surrogate halves (each of which
		 * UCS-2 exposes as separate characters) into a single code point,
		 * matching UTF-16.
		 * @see `punycode.ucs2.encode`
		 * @see <http://mathiasbynens.be/notes/javascript-encoding>
		 * @memberOf punycode.ucs2
		 * @name decode
		 * @param {String} string The Unicode input string (UCS-2).
		 * @returns {Array} The new array of code points.
		 */
		function ucs2decode(string) {
			var output = [],
			    counter = 0,
			    length = string.length,
			    value,
			    extra;
			while (counter < length) {
				value = string.charCodeAt(counter++);
				if (value >= 0xD800 && value <= 0xDBFF && counter < length) {
					// high surrogate, and there is a next character
					extra = string.charCodeAt(counter++);
					if ((extra & 0xFC00) == 0xDC00) { // low surrogate
						output.push(((value & 0x3FF) << 10) + (extra & 0x3FF) + 0x10000);
					} else {
						// unmatched surrogate; only append this code unit, in case the next
						// code unit is the high surrogate of a surrogate pair
						output.push(value);
						counter--;
					}
				} else {
					output.push(value);
				}
			}
			return output;
		}

		/**
		 * Creates a string based on an array of numeric code points.
		 * @see `punycode.ucs2.decode`
		 * @memberOf punycode.ucs2
		 * @name encode
		 * @param {Array} codePoints The array of numeric code points.
		 * @returns {String} The new Unicode string (UCS-2).
		 */
		function ucs2encode(array) {
			return map(array, function(value) {
				var output = '';
				if (value > 0xFFFF) {
					value -= 0x10000;
					output += stringFromCharCode(value >>> 10 & 0x3FF | 0xD800);
					value = 0xDC00 | value & 0x3FF;
				}
				output += stringFromCharCode(value);
				return output;
			}).join('');
		}

		/**
		 * Converts a basic code point into a digit/integer.
		 * @see `digitToBasic()`
		 * @private
		 * @param {Number} codePoint The basic numeric code point value.
		 * @returns {Number} The numeric value of a basic code point (for use in
		 * representing integers) in the range `0` to `base - 1`, or `base` if
		 * the code point does not represent a value.
		 */
		function basicToDigit(codePoint) {
			if (codePoint - 48 < 10) {
				return codePoint - 22;
			}
			if (codePoint - 65 < 26) {
				return codePoint - 65;
			}
			if (codePoint - 97 < 26) {
				return codePoint - 97;
			}
			return base;
		}

		/**
		 * Converts a digit/integer into a basic code point.
		 * @see `basicToDigit()`
		 * @private
		 * @param {Number} digit The numeric value of a basic code point.
		 * @returns {Number} The basic code point whose value (when used for
		 * representing integers) is `digit`, which needs to be in the range
		 * `0` to `base - 1`. If `flag` is non-zero, the uppercase form is
		 * used; else, the lowercase form is used. The behavior is undefined
		 * if `flag` is non-zero and `digit` has no uppercase form.
		 */
		function digitToBasic(digit, flag) {
			//  0..25 map to ASCII a..z or A..Z
			// 26..35 map to ASCII 0..9
			return digit + 22 + 75 * (digit < 26) - ((flag != 0) << 5);
		}

		/**
		 * Bias adaptation function as per section 3.4 of RFC 3492.
		 * http://tools.ietf.org/html/rfc3492#section-3.4
		 * @private
		 */
		function adapt(delta, numPoints, firstTime) {
			var k = 0;
			delta = firstTime ? floor(delta / damp) : delta >> 1;
			delta += floor(delta / numPoints);
			for (/* no initialization */; delta > baseMinusTMin * tMax >> 1; k += base) {
				delta = floor(delta / baseMinusTMin);
			}
			return floor(k + (baseMinusTMin + 1) * delta / (delta + skew));
		}

		/**
		 * Converts a Punycode string of ASCII-only symbols to a string of Unicode
		 * symbols.
		 * @memberOf punycode
		 * @param {String} input The Punycode string of ASCII-only symbols.
		 * @returns {String} The resulting string of Unicode symbols.
		 */
		function decode(input) {
			// Don't use UCS-2
			var output = [],
			    inputLength = input.length,
			    out,
			    i = 0,
			    n = initialN,
			    bias = initialBias,
			    basic,
			    j,
			    index,
			    oldi,
			    w,
			    k,
			    digit,
			    t,
			    length,
			    /** Cached calculation results */
			    baseMinusT;

			// Handle the basic code points: let `basic` be the number of input code
			// points before the last delimiter, or `0` if there is none, then copy
			// the first basic code points to the output.

			basic = input.lastIndexOf(delimiter);
			if (basic < 0) {
				basic = 0;
			}

			for (j = 0; j < basic; ++j) {
				// if it's not a basic code point
				if (input.charCodeAt(j) >= 0x80) {
					error('not-basic');
				}
				output.push(input.charCodeAt(j));
			}

			// Main decoding loop: start just after the last delimiter if any basic code
			// points were copied; start at the beginning otherwise.

			for (index = basic > 0 ? basic + 1 : 0; index < inputLength; /* no final expression */) {

				// `index` is the index of the next character to be consumed.
				// Decode a generalized variable-length integer into `delta`,
				// which gets added to `i`. The overflow checking is easier
				// if we increase `i` as we go, then subtract off its starting
				// value at the end to obtain `delta`.
				for (oldi = i, w = 1, k = base; /* no condition */; k += base) {

					if (index >= inputLength) {
						error('invalid-input');
					}

					digit = basicToDigit(input.charCodeAt(index++));

					if (digit >= base || digit > floor((maxInt - i) / w)) {
						error('overflow');
					}

					i += digit * w;
					t = k <= bias ? tMin : (k >= bias + tMax ? tMax : k - bias);

					if (digit < t) {
						break;
					}

					baseMinusT = base - t;
					if (w > floor(maxInt / baseMinusT)) {
						error('overflow');
					}

					w *= baseMinusT;

				}

				out = output.length + 1;
				bias = adapt(i - oldi, out, oldi == 0);

				// `i` was supposed to wrap around from `out` to `0`,
				// incrementing `n` each time, so we'll fix that now:
				if (floor(i / out) > maxInt - n) {
					error('overflow');
				}

				n += floor(i / out);
				i %= out;

				// Insert `n` at position `i` of the output
				output.splice(i++, 0, n);

			}

			return ucs2encode(output);
		}

		/**
		 * Converts a string of Unicode symbols to a Punycode string of ASCII-only
		 * symbols.
		 * @memberOf punycode
		 * @param {String} input The string of Unicode symbols.
		 * @returns {String} The resulting Punycode string of ASCII-only symbols.
		 */
		function encode(input) {
			var n,
			    delta,
			    handledCPCount,
			    basicLength,
			    bias,
			    j,
			    m,
			    q,
			    k,
			    t,
			    currentValue,
			    output = [],
			    /** `inputLength` will hold the number of code points in `input`. */
			    inputLength,
			    /** Cached calculation results */
			    handledCPCountPlusOne,
			    baseMinusT,
			    qMinusT;

			// Convert the input in UCS-2 to Unicode
			input = ucs2decode(input);

			// Cache the length
			inputLength = input.length;

			// Initialize the state
			n = initialN;
			delta = 0;
			bias = initialBias;

			// Handle the basic code points
			for (j = 0; j < inputLength; ++j) {
				currentValue = input[j];
				if (currentValue < 0x80) {
					output.push(stringFromCharCode(currentValue));
				}
			}

			handledCPCount = basicLength = output.length;

			// `handledCPCount` is the number of code points that have been handled;
			// `basicLength` is the number of basic code points.

			// Finish the basic string - if it is not empty - with a delimiter
			if (basicLength) {
				output.push(delimiter);
			}

			// Main encoding loop:
			while (handledCPCount < inputLength) {

				// All non-basic code points < n have been handled already. Find the next
				// larger one:
				for (m = maxInt, j = 0; j < inputLength; ++j) {
					currentValue = input[j];
					if (currentValue >= n && currentValue < m) {
						m = currentValue;
					}
				}

				// Increase `delta` enough to advance the decoder's <n,i> state to <m,0>,
				// but guard against overflow
				handledCPCountPlusOne = handledCPCount + 1;
				if (m - n > floor((maxInt - delta) / handledCPCountPlusOne)) {
					error('overflow');
				}

				delta += (m - n) * handledCPCountPlusOne;
				n = m;

				for (j = 0; j < inputLength; ++j) {
					currentValue = input[j];

					if (currentValue < n && ++delta > maxInt) {
						error('overflow');
					}

					if (currentValue == n) {
						// Represent delta as a generalized variable-length integer
						for (q = delta, k = base; /* no condition */; k += base) {
							t = k <= bias ? tMin : (k >= bias + tMax ? tMax : k - bias);
							if (q < t) {
								break;
							}
							qMinusT = q - t;
							baseMinusT = base - t;
							output.push(
								stringFromCharCode(digitToBasic(t + qMinusT % baseMinusT, 0))
							);
							q = floor(qMinusT / baseMinusT);
						}

						output.push(stringFromCharCode(digitToBasic(q, 0)));
						bias = adapt(delta, handledCPCountPlusOne, handledCPCount == basicLength);
						delta = 0;
						++handledCPCount;
					}
				}

				++delta;
				++n;

			}
			return output.join('');
		}

		/**
		 * Converts a Punycode string representing a domain name to Unicode. Only the
		 * Punycoded parts of the domain name will be converted, i.e. it doesn't
		 * matter if you call it on a string that has already been converted to
		 * Unicode.
		 * @memberOf punycode
		 * @param {String} domain The Punycode domain name to convert to Unicode.
		 * @returns {String} The Unicode representation of the given Punycode
		 * string.
		 */
		function toUnicode(domain) {
			return mapDomain(domain, function(string) {
				return regexPunycode.test(string)
					? decode(string.slice(4).toLowerCase())
					: string;
			});
		}

		/**
		 * Converts a Unicode string representing a domain name to Punycode. Only the
		 * non-ASCII parts of the domain name will be converted, i.e. it doesn't
		 * matter if you call it with a domain that's already in ASCII.
		 * @memberOf punycode
		 * @param {String} domain The domain name to convert, as a Unicode string.
		 * @returns {String} The Punycode representation of the given domain name.
		 */
		function toASCII(domain) {
			return mapDomain(domain, function(string) {
				return regexNonASCII.test(string)
					? 'xn--' + encode(string)
					: string;
			});
		}

		/*--------------------------------------------------------------------------*/

		/** Define the public API */
		punycode = {
			/**
			 * A string representing the current Punycode.js version number.
			 * @memberOf punycode
			 * @type String
			 */
			'version': '1.2.3',
			/**
			 * An object of methods to convert from JavaScript's internal character
			 * representation (UCS-2) to Unicode code points, and back.
			 * @see <http://mathiasbynens.be/notes/javascript-encoding>
			 * @memberOf punycode
			 * @type Object
			 */
			'ucs2': {
				'decode': ucs2decode,
				'encode': ucs2encode
			},
			'decode': decode,
			'encode': encode,
			'toASCII': toASCII,
			'toUnicode': toUnicode
		};

		/** Expose `punycode` */
		// Some AMD build optimizers, like r.js, check for specific condition patterns
		// like the following:
		if (
			true
		) {
			!(__WEBPACK_AMD_DEFINE_RESULT__ = function() {
				return punycode;
			}.call(exports, __webpack_require__, exports, module), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
		}	else if (freeExports && !freeExports.nodeType) {
			if (freeModule) { // in Node.js or RingoJS v0.8.0+
				freeModule.exports = punycode;
			} else { // in Narwhal or RingoJS v0.7.0-
				for (key in punycode) {
					punycode.hasOwnProperty(key) && (freeExports[key] = punycode[key]);
				}
			}
		} else { // in Rhino or a web browser
			root.punycode = punycode;
		}

	}(this));

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(6)(module), (function() { return this; }())))

/***/ },
/* 6 */
/***/ function(module, exports) {

	module.exports = function(module) {
		if(!module.webpackPolyfill) {
			module.deprecate = function() {};
			module.paths = [];
			// module.parent = undefined by default
			module.children = [];
			module.webpackPolyfill = 1;
		}
		return module;
	}


/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	/*!
	 * URI.js - Mutating URLs
	 * IPv6 Support
	 *
	 * Version: 1.16.1
	 *
	 * Author: Rodney Rehm
	 * Web: http://medialize.github.io/URI.js/
	 *
	 * Licensed under
	 *   MIT License http://www.opensource.org/licenses/mit-license
	 *   GPL v3 http://opensource.org/licenses/GPL-3.0
	 *
	 */

	(function (root, factory) {
	  'use strict';
	  // https://github.com/umdjs/umd/blob/master/returnExports.js
	  if (true) {
	    // Node
	    module.exports = factory();
	  } else if (typeof define === 'function' && define.amd) {
	    // AMD. Register as an anonymous module.
	    define(factory);
	  } else {
	    // Browser globals (root is window)
	    root.IPv6 = factory(root);
	  }
	}(this, function (root) {
	  'use strict';

	  /*
	  var _in = "fe80:0000:0000:0000:0204:61ff:fe9d:f156";
	  var _out = IPv6.best(_in);
	  var _expected = "fe80::204:61ff:fe9d:f156";

	  console.log(_in, _out, _expected, _out === _expected);
	  */

	  // save current IPv6 variable, if any
	  var _IPv6 = root && root.IPv6;

	  function bestPresentation(address) {
	    // based on:
	    // Javascript to test an IPv6 address for proper format, and to
	    // present the "best text representation" according to IETF Draft RFC at
	    // http://tools.ietf.org/html/draft-ietf-6man-text-addr-representation-04
	    // 8 Feb 2010 Rich Brown, Dartware, LLC
	    // Please feel free to use this code as long as you provide a link to
	    // http://www.intermapper.com
	    // http://intermapper.com/support/tools/IPV6-Validator.aspx
	    // http://download.dartware.com/thirdparty/ipv6validator.js

	    var _address = address.toLowerCase();
	    var segments = _address.split(':');
	    var length = segments.length;
	    var total = 8;

	    // trim colons (:: or ::a:b:c… or …a:b:c::)
	    if (segments[0] === '' && segments[1] === '' && segments[2] === '') {
	      // must have been ::
	      // remove first two items
	      segments.shift();
	      segments.shift();
	    } else if (segments[0] === '' && segments[1] === '') {
	      // must have been ::xxxx
	      // remove the first item
	      segments.shift();
	    } else if (segments[length - 1] === '' && segments[length - 2] === '') {
	      // must have been xxxx::
	      segments.pop();
	    }

	    length = segments.length;

	    // adjust total segments for IPv4 trailer
	    if (segments[length - 1].indexOf('.') !== -1) {
	      // found a "." which means IPv4
	      total = 7;
	    }

	    // fill empty segments them with "0000"
	    var pos;
	    for (pos = 0; pos < length; pos++) {
	      if (segments[pos] === '') {
	        break;
	      }
	    }

	    if (pos < total) {
	      segments.splice(pos, 1, '0000');
	      while (segments.length < total) {
	        segments.splice(pos, 0, '0000');
	      }

	      length = segments.length;
	    }

	    // strip leading zeros
	    var _segments;
	    for (var i = 0; i < total; i++) {
	      _segments = segments[i].split('');
	      for (var j = 0; j < 3 ; j++) {
	        if (_segments[0] === '0' && _segments.length > 1) {
	          _segments.splice(0,1);
	        } else {
	          break;
	        }
	      }

	      segments[i] = _segments.join('');
	    }

	    // find longest sequence of zeroes and coalesce them into one segment
	    var best = -1;
	    var _best = 0;
	    var _current = 0;
	    var current = -1;
	    var inzeroes = false;
	    // i; already declared

	    for (i = 0; i < total; i++) {
	      if (inzeroes) {
	        if (segments[i] === '0') {
	          _current += 1;
	        } else {
	          inzeroes = false;
	          if (_current > _best) {
	            best = current;
	            _best = _current;
	          }
	        }
	      } else {
	        if (segments[i] === '0') {
	          inzeroes = true;
	          current = i;
	          _current = 1;
	        }
	      }
	    }

	    if (_current > _best) {
	      best = current;
	      _best = _current;
	    }

	    if (_best > 1) {
	      segments.splice(best, _best, '');
	    }

	    length = segments.length;

	    // assemble remaining segments
	    var result = '';
	    if (segments[0] === '')  {
	      result = ':';
	    }

	    for (i = 0; i < length; i++) {
	      result += segments[i];
	      if (i === length - 1) {
	        break;
	      }

	      result += ':';
	    }

	    if (segments[length - 1] === '') {
	      result += ':';
	    }

	    return result;
	  }

	  function noConflict() {
	    /*jshint validthis: true */
	    if (root.IPv6 === this) {
	      root.IPv6 = _IPv6;
	    }
	  
	    return this;
	  }

	  return {
	    best: bestPresentation,
	    noConflict: noConflict
	  };
	}));


/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	/*!
	 * URI.js - Mutating URLs
	 * Second Level Domain (SLD) Support
	 *
	 * Version: 1.16.1
	 *
	 * Author: Rodney Rehm
	 * Web: http://medialize.github.io/URI.js/
	 *
	 * Licensed under
	 *   MIT License http://www.opensource.org/licenses/mit-license
	 *   GPL v3 http://opensource.org/licenses/GPL-3.0
	 *
	 */

	(function (root, factory) {
	  'use strict';
	  // https://github.com/umdjs/umd/blob/master/returnExports.js
	  if (true) {
	    // Node
	    module.exports = factory();
	  } else if (typeof define === 'function' && define.amd) {
	    // AMD. Register as an anonymous module.
	    define(factory);
	  } else {
	    // Browser globals (root is window)
	    root.SecondLevelDomains = factory(root);
	  }
	}(this, function (root) {
	  'use strict';

	  // save current SecondLevelDomains variable, if any
	  var _SecondLevelDomains = root && root.SecondLevelDomains;

	  var SLD = {
	    // list of known Second Level Domains
	    // converted list of SLDs from https://github.com/gavingmiller/second-level-domains
	    // ----
	    // publicsuffix.org is more current and actually used by a couple of browsers internally.
	    // downside is it also contains domains like "dyndns.org" - which is fine for the security
	    // issues browser have to deal with (SOP for cookies, etc) - but is way overboard for URI.js
	    // ----
	    list: {
	      'ac':' com gov mil net org ',
	      'ae':' ac co gov mil name net org pro sch ',
	      'af':' com edu gov net org ',
	      'al':' com edu gov mil net org ',
	      'ao':' co ed gv it og pb ',
	      'ar':' com edu gob gov int mil net org tur ',
	      'at':' ac co gv or ',
	      'au':' asn com csiro edu gov id net org ',
	      'ba':' co com edu gov mil net org rs unbi unmo unsa untz unze ',
	      'bb':' biz co com edu gov info net org store tv ',
	      'bh':' biz cc com edu gov info net org ',
	      'bn':' com edu gov net org ',
	      'bo':' com edu gob gov int mil net org tv ',
	      'br':' adm adv agr am arq art ato b bio blog bmd cim cng cnt com coop ecn edu eng esp etc eti far flog fm fnd fot fst g12 ggf gov imb ind inf jor jus lel mat med mil mus net nom not ntr odo org ppg pro psc psi qsl rec slg srv tmp trd tur tv vet vlog wiki zlg ',
	      'bs':' com edu gov net org ',
	      'bz':' du et om ov rg ',
	      'ca':' ab bc mb nb nf nl ns nt nu on pe qc sk yk ',
	      'ck':' biz co edu gen gov info net org ',
	      'cn':' ac ah bj com cq edu fj gd gov gs gx gz ha hb he hi hl hn jl js jx ln mil net nm nx org qh sc sd sh sn sx tj tw xj xz yn zj ',
	      'co':' com edu gov mil net nom org ',
	      'cr':' ac c co ed fi go or sa ',
	      'cy':' ac biz com ekloges gov ltd name net org parliament press pro tm ',
	      'do':' art com edu gob gov mil net org sld web ',
	      'dz':' art asso com edu gov net org pol ',
	      'ec':' com edu fin gov info med mil net org pro ',
	      'eg':' com edu eun gov mil name net org sci ',
	      'er':' com edu gov ind mil net org rochest w ',
	      'es':' com edu gob nom org ',
	      'et':' biz com edu gov info name net org ',
	      'fj':' ac biz com info mil name net org pro ',
	      'fk':' ac co gov net nom org ',
	      'fr':' asso com f gouv nom prd presse tm ',
	      'gg':' co net org ',
	      'gh':' com edu gov mil org ',
	      'gn':' ac com gov net org ',
	      'gr':' com edu gov mil net org ',
	      'gt':' com edu gob ind mil net org ',
	      'gu':' com edu gov net org ',
	      'hk':' com edu gov idv net org ',
	      'hu':' 2000 agrar bolt casino city co erotica erotika film forum games hotel info ingatlan jogasz konyvelo lakas media news org priv reklam sex shop sport suli szex tm tozsde utazas video ',
	      'id':' ac co go mil net or sch web ',
	      'il':' ac co gov idf k12 muni net org ',
	      'in':' ac co edu ernet firm gen gov i ind mil net nic org res ',
	      'iq':' com edu gov i mil net org ',
	      'ir':' ac co dnssec gov i id net org sch ',
	      'it':' edu gov ',
	      'je':' co net org ',
	      'jo':' com edu gov mil name net org sch ',
	      'jp':' ac ad co ed go gr lg ne or ',
	      'ke':' ac co go info me mobi ne or sc ',
	      'kh':' com edu gov mil net org per ',
	      'ki':' biz com de edu gov info mob net org tel ',
	      'km':' asso com coop edu gouv k medecin mil nom notaires pharmaciens presse tm veterinaire ',
	      'kn':' edu gov net org ',
	      'kr':' ac busan chungbuk chungnam co daegu daejeon es gangwon go gwangju gyeongbuk gyeonggi gyeongnam hs incheon jeju jeonbuk jeonnam k kg mil ms ne or pe re sc seoul ulsan ',
	      'kw':' com edu gov net org ',
	      'ky':' com edu gov net org ',
	      'kz':' com edu gov mil net org ',
	      'lb':' com edu gov net org ',
	      'lk':' assn com edu gov grp hotel int ltd net ngo org sch soc web ',
	      'lr':' com edu gov net org ',
	      'lv':' asn com conf edu gov id mil net org ',
	      'ly':' com edu gov id med net org plc sch ',
	      'ma':' ac co gov m net org press ',
	      'mc':' asso tm ',
	      'me':' ac co edu gov its net org priv ',
	      'mg':' com edu gov mil nom org prd tm ',
	      'mk':' com edu gov inf name net org pro ',
	      'ml':' com edu gov net org presse ',
	      'mn':' edu gov org ',
	      'mo':' com edu gov net org ',
	      'mt':' com edu gov net org ',
	      'mv':' aero biz com coop edu gov info int mil museum name net org pro ',
	      'mw':' ac co com coop edu gov int museum net org ',
	      'mx':' com edu gob net org ',
	      'my':' com edu gov mil name net org sch ',
	      'nf':' arts com firm info net other per rec store web ',
	      'ng':' biz com edu gov mil mobi name net org sch ',
	      'ni':' ac co com edu gob mil net nom org ',
	      'np':' com edu gov mil net org ',
	      'nr':' biz com edu gov info net org ',
	      'om':' ac biz co com edu gov med mil museum net org pro sch ',
	      'pe':' com edu gob mil net nom org sld ',
	      'ph':' com edu gov i mil net ngo org ',
	      'pk':' biz com edu fam gob gok gon gop gos gov net org web ',
	      'pl':' art bialystok biz com edu gda gdansk gorzow gov info katowice krakow lodz lublin mil net ngo olsztyn org poznan pwr radom slupsk szczecin torun warszawa waw wroc wroclaw zgora ',
	      'pr':' ac biz com edu est gov info isla name net org pro prof ',
	      'ps':' com edu gov net org plo sec ',
	      'pw':' belau co ed go ne or ',
	      'ro':' arts com firm info nom nt org rec store tm www ',
	      'rs':' ac co edu gov in org ',
	      'sb':' com edu gov net org ',
	      'sc':' com edu gov net org ',
	      'sh':' co com edu gov net nom org ',
	      'sl':' com edu gov net org ',
	      'st':' co com consulado edu embaixada gov mil net org principe saotome store ',
	      'sv':' com edu gob org red ',
	      'sz':' ac co org ',
	      'tr':' av bbs bel biz com dr edu gen gov info k12 name net org pol tel tsk tv web ',
	      'tt':' aero biz cat co com coop edu gov info int jobs mil mobi museum name net org pro tel travel ',
	      'tw':' club com ebiz edu game gov idv mil net org ',
	      'mu':' ac co com gov net or org ',
	      'mz':' ac co edu gov org ',
	      'na':' co com ',
	      'nz':' ac co cri geek gen govt health iwi maori mil net org parliament school ',
	      'pa':' abo ac com edu gob ing med net nom org sld ',
	      'pt':' com edu gov int net nome org publ ',
	      'py':' com edu gov mil net org ',
	      'qa':' com edu gov mil net org ',
	      're':' asso com nom ',
	      'ru':' ac adygeya altai amur arkhangelsk astrakhan bashkiria belgorod bir bryansk buryatia cbg chel chelyabinsk chita chukotka chuvashia com dagestan e-burg edu gov grozny int irkutsk ivanovo izhevsk jar joshkar-ola kalmykia kaluga kamchatka karelia kazan kchr kemerovo khabarovsk khakassia khv kirov koenig komi kostroma kranoyarsk kuban kurgan kursk lipetsk magadan mari mari-el marine mil mordovia mosreg msk murmansk nalchik net nnov nov novosibirsk nsk omsk orenburg org oryol penza perm pp pskov ptz rnd ryazan sakhalin samara saratov simbirsk smolensk spb stavropol stv surgut tambov tatarstan tom tomsk tsaritsyn tsk tula tuva tver tyumen udm udmurtia ulan-ude vladikavkaz vladimir vladivostok volgograd vologda voronezh vrn vyatka yakutia yamal yekaterinburg yuzhno-sakhalinsk ',
	      'rw':' ac co com edu gouv gov int mil net ',
	      'sa':' com edu gov med net org pub sch ',
	      'sd':' com edu gov info med net org tv ',
	      'se':' a ac b bd c d e f g h i k l m n o org p parti pp press r s t tm u w x y z ',
	      'sg':' com edu gov idn net org per ',
	      'sn':' art com edu gouv org perso univ ',
	      'sy':' com edu gov mil net news org ',
	      'th':' ac co go in mi net or ',
	      'tj':' ac biz co com edu go gov info int mil name net nic org test web ',
	      'tn':' agrinet com defense edunet ens fin gov ind info intl mincom nat net org perso rnrt rns rnu tourism ',
	      'tz':' ac co go ne or ',
	      'ua':' biz cherkassy chernigov chernovtsy ck cn co com crimea cv dn dnepropetrovsk donetsk dp edu gov if in ivano-frankivsk kh kharkov kherson khmelnitskiy kiev kirovograd km kr ks kv lg lugansk lutsk lviv me mk net nikolaev od odessa org pl poltava pp rovno rv sebastopol sumy te ternopil uzhgorod vinnica vn zaporizhzhe zhitomir zp zt ',
	      'ug':' ac co go ne or org sc ',
	      'uk':' ac bl british-library co cym gov govt icnet jet lea ltd me mil mod national-library-scotland nel net nhs nic nls org orgn parliament plc police sch scot soc ',
	      'us':' dni fed isa kids nsn ',
	      'uy':' com edu gub mil net org ',
	      've':' co com edu gob info mil net org web ',
	      'vi':' co com k12 net org ',
	      'vn':' ac biz com edu gov health info int name net org pro ',
	      'ye':' co com gov ltd me net org plc ',
	      'yu':' ac co edu gov org ',
	      'za':' ac agric alt bourse city co cybernet db edu gov grondar iaccess imt inca landesign law mil net ngo nis nom olivetti org pix school tm web ',
	      'zm':' ac co com edu gov net org sch '
	    },
	    // gorhill 2013-10-25: Using indexOf() instead Regexp(). Significant boost
	    // in both performance and memory footprint. No initialization required.
	    // http://jsperf.com/uri-js-sld-regex-vs-binary-search/4
	    // Following methods use lastIndexOf() rather than array.split() in order
	    // to avoid any memory allocations.
	    has: function(domain) {
	      var tldOffset = domain.lastIndexOf('.');
	      if (tldOffset <= 0 || tldOffset >= (domain.length-1)) {
	        return false;
	      }
	      var sldOffset = domain.lastIndexOf('.', tldOffset-1);
	      if (sldOffset <= 0 || sldOffset >= (tldOffset-1)) {
	        return false;
	      }
	      var sldList = SLD.list[domain.slice(tldOffset+1)];
	      if (!sldList) {
	        return false;
	      }
	      return sldList.indexOf(' ' + domain.slice(sldOffset+1, tldOffset) + ' ') >= 0;
	    },
	    is: function(domain) {
	      var tldOffset = domain.lastIndexOf('.');
	      if (tldOffset <= 0 || tldOffset >= (domain.length-1)) {
	        return false;
	      }
	      var sldOffset = domain.lastIndexOf('.', tldOffset-1);
	      if (sldOffset >= 0) {
	        return false;
	      }
	      var sldList = SLD.list[domain.slice(tldOffset+1)];
	      if (!sldList) {
	        return false;
	      }
	      return sldList.indexOf(' ' + domain.slice(0, tldOffset) + ' ') >= 0;
	    },
	    get: function(domain) {
	      var tldOffset = domain.lastIndexOf('.');
	      if (tldOffset <= 0 || tldOffset >= (domain.length-1)) {
	        return null;
	      }
	      var sldOffset = domain.lastIndexOf('.', tldOffset-1);
	      if (sldOffset <= 0 || sldOffset >= (tldOffset-1)) {
	        return null;
	      }
	      var sldList = SLD.list[domain.slice(tldOffset+1)];
	      if (!sldList) {
	        return null;
	      }
	      if (sldList.indexOf(' ' + domain.slice(sldOffset+1, tldOffset) + ' ') < 0) {
	        return null;
	      }
	      return domain.slice(sldOffset+1);
	    },
	    noConflict: function(){
	      if (root.SecondLevelDomains === this) {
	        root.SecondLevelDomains = _SecondLevelDomains;
	      }
	      return this;
	    }
	  };

	  return SLD;
	}));


/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _ = __webpack_require__(2);
	var Resource = __webpack_require__(10);
	var UriTemplate = __webpack_require__(12);

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
	 * @arg {Object} [options] The options for the request.
	 * @arg {Object} [options.protocol] Options to pass to the underlying protocol,
	 * @arg {Boolean} [options.preferContextMediaType] Whether to prefer the media type
	 * that originated this WebLink in the Accept header of the request, e.g.
	 * `Accept: application/vnd.collection+json, application/vnd.siren+json;q=0.5`
	 * @arg {Object} [options.data] When following a link that is a URI Template,
	 * this object will used as variables when resolving the template into the
	 * final URI.
	 * @tutorial uri-templates
	 */
	WebLink.prototype.follow = function(options) {
	  options = this.$$context.withDefaults(options);
	  var opts = _.get(options, 'protocol', {});
	  opts.headers = (opts.headers || {});

	  if(!opts.headers.Accept) {
	    if (this.type) {
	      opts.headers.Accept = this.type;
	    } else {
	      opts.headers.Accept = this.$$context.acceptHeader();
	    }
	  }

	  var requestOptions = _.extend(opts, { url: this.resolvedUrl(_.get(options, 'data')) });
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


/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _ = __webpack_require__(2);
	var LinkCollection = __webpack_require__(11);

	/**
	 * A predicate to inspect a given {@link Resource} to decide to include or not.
	 * @callback Resource~linkPredicate
	 * @param {WebLink} link The candidate link
	 * @returns {boolean} Whether to include the link in the response(s) or not.
	 */

	/**
	 * A predicate to inspect a given {@link Resource} to decide to include or not.
	 * @callback Resource~resourcePredicate
	 * @param {Resource} resource The candidate resource
	 * @returns {boolean} Whether to include the resource in the response(s) or not.
	 */

	/**
	 * @constructor
	 *
	 * @classdesc
	 * {@link Resource} instances behave like AngularJS' `ngResource`, in that
	 * resources are returned directly from calls, and the values in the resource
	 * will be merged into the object once the background request(s) complete.
	 * Doing so allows a view layer to directly bind to the resource fields. Should
	 * you need to do something once the resource is loaded, the `$promise`
	 * property of the resource is available.
	 *
	 * {@link Resource} offers several functions you can use to interact with links,
	 * embedded resources, and forms included in the resource.
	 */
	var Resource = function() {
	  /**
	   * This property is a ES6 promise that can be used to perform work once the
	   * resource is resolved. For resources that were embedded, the promise may already
	   * resolved when the resource is initially created.
	   * @type {Promise}
	   */
	  this.$promise = null;

	  /**
	   * This property is a simple boolean `true/false` value indicating whether
	   * the specific resource has been resolved or not.
	   * @type {boolean}
	   */
	  this.$resolved = false;

	  /**
	   * For embedded/sub-resources, this will point to the immediate parent
	   * resource containing this one.
	   * @type {?Resource}
	   */
	  this.$parent = null;

	  /**
	   * This property will be populated by the HTTP response information when
	   * the resource is resolved. For embedded resources, the data portion will
	   * be the subsection of the response used to created the embedded resource.
	   * @type {?{data: Object, headers: Object.<String, String>, status: number}}
	   */
	  this.$response = null;

	  /**
	   * If there is a problem resolving the {@link Resource}, this will contain
	   * the error information.
	   */
	  this.$error = null;

	  /**
	   * Object containing any format specific properties that don't fall under
	   * the standard categories such as forms, fields, or links.
	   * @type {Object}
	     */
	  this.$formatSpecific = {};

	  this.$$links = {};
	  this.$$embedded = {};
	  this.$$forms = {};
	  this.$$curiePrefixes = {};

	  /**
	   * Get the single {@link WebLink} for the given relation.
	   *
	   * @arg {string} rel The link relation to look up.
	   * @arg {Object|Resource~linkPredicate} [filter] The filter object/predicate to filter links to desired one.
	   * @returns {WebLink} The link with the given link relation, or null if not found.
	   * @throws An error if multiple links are present for the link relation.
	   * @example
	   * res.$link('next')
	   * => WebLink { href: '/posts?page=2' }
	   */
	  this.$link = function(rel, filter) {
	    var ret = this.$links(rel, filter);
	    if (ret.length === 0) {
	      return null;
	    }
	    if (ret.length > 1) {
	      throw 'Multiple links present';
	    }

	    return ret[0];
	  };

	  /**
	   * Return a {@link LinkCollection} for the given link relation.
	   *
	   * @arg {string} [rel] The link relation to look up. If not provided, all
	   * links in the resource will be return.
	   * @arg {Object|Resource~linkPredicate} [filter] The filter object/predicate to filter matching links.
	   * @returns {LinkCollection} The links with the given link relation, or
	   * all the links in the resource if a rel is not provided.
	   * @example
	   * res.$links('posts')
	   * => LinkCollection [ WebLink { href: '/posts/123' }, WebLink { href: '/posts/345' } ]
	   */
	  this.$links = function(rel, filter) {
	    if (!rel) {
	      return LinkCollection.fromArray(_.flatten(_.values(this.$$links)));
	    }

	    var links = _.get(this.$$links, rel, []);

	    if (filter) {
	      links = _.filter(links, filter);
	    }

	    return links;
	  };

	  /**
	   * Get the single {@link Form} for the given relation. The returned form
	   * is a cloned copy of the {@link Form} in the resource. Each call to
	   * this function will return a new copy, so that multiple forms can be
	   * created, modified, and submitted without reloading the containing
	   * {@link Resource}.
	   *
	   * @arg {string} rel The link relation to look up.
	   * @returns {Form} The copy of form with the given link relation, or null if not found.
	   * @throws An error if multiple forms are present for the link relation.
	   * @example
	   * res.$form('create-form')
	   * => Form { href: '/posts?page=2', method: 'POST', ... }
	   */
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

	  /**
	   * Get the {@link Form} instances for the given relation. The returned forms
	   * are a cloned copy of the {@link Form} instances in the resource. Each call
	   * to this function will return new copies, so that multiple forms can be
	   * created, modified, and submitted without reloading the containing
	   * {@link Resource}.
	   *
	   * @arg {string} [rel] The link relation to look up. If omitted, returns all forms in the resource.
	   * @returns {Array} An array of cloned forms, or an empty array if not found.
	   * @example
	   * res.$forms('create-form')
	   * => [Form { href: '/posts?page=2', method: 'POST', ... }]
	   * @example
	   * res.$forms()
	   * => [Form { href: '/posts?page=2, 'method: 'POST", ... }]
	   */
	  this.$forms = function(rel) {
	    if (!rel) {
	      return _.invoke(_.flatten(_.values(this.$$forms)), 'clone');
	    }

	    return _.invoke(_.get(this.$$forms, rel, []), 'clone');
	  };

	  /**
	   * Follows a link relation, if present.  The link relation will be looked for
	   * in the embedded resources first, and fall back to checking for the
	   * presence of a link and loading those. Depending on whether an embedded
	   * version is found, or only a link, will determine whether the resource will
	   * already be resolved, or will be so in the future. The optional `options`
	   * parameter can be used to pass additional options to the underlying http
	   * request.
	   *
	   * @arg {string} rel The link relation to follow.
	   * @arg {Object} [options] Options for following the link. For details, see {@link WebLink#follow}.
	   * @arg {Object|Resource~linkPredicate} [options.linkFilter] A matching object or filter function when inspecting links.
	   * @arg {Object|Resource~resourcePredicate} [options.subFilter] A matching object or filter function when inspecting sub/embedded resources.
	   * @returns {Resource} The linked/embedded resource, or null if the link relation is not found.
	   * @throws Will throw an error if multiple instances of the relation are present.
	   * @example
	   * res.$followOne('next')
	   * => Resource { $resolved: false, $promise: $q promise object }
	   */
	  this.$followOne = function(rel, options) {
	    options = options || {};

	    if (this.$resolved) {
	      var res = this.$sub(rel, options.subFilter);
	      if (res !== null) {
	        return res;
	      }

	      var l = this.$link(rel, options.linkFilter);
	      if (l === null) {
	        return null; // TODO: Return a resource w/ an error?s
	      }

	      return l.follow(options);
	    }

	    var ret = new Resource();
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

	  /**
	   * Follow all links for the given relation and return an array of resources.
	   * If the link relation is not present, then an empty array will be returned.
	   * It will first attempt to locate the link relation in the embedded
	   * resources, and fall back to checking for the presence of a link and
	   * loading those. Depending on whether an embedded version is found, or only
	   * links, will determine whether the resources will already be resolved, or
	   * will be so in the future.
	   *
	   * @arg {string} rel The link relation to follow.
	   * @arg {Object} [options] Options for following the link. For details, see {@link WebLink#follow}.
	   * @arg {Object|Resource~linkPredicate} [options.linkFilter] Filter object/predicate for filtering candidate links to follow.
	   * @arg {Object|Resource~resourcePredicate} [options.subFilter] A matching object or filter function when inspecting sub/embedded resources.
	   * @returns {Array} The linked/embedded resources, or an empty array if the link relation is not found.
	   * @example
	   * res.$followAll('item')
	   * => [Resource { $resolved: false, $promise: $q promise object }, Resource { $resolved: false, $promise: $q promise object }]
	   */
	  this.$followAll = function(rel, options) {
	    options = options || {};
	    if (this.$resolved) {
	      var subs = this.$subs(rel, options.subFilter);
	      if (subs.length > 0) {
	        return subs;
	      }

	      return LinkCollection.fromArray(this.$links(rel, options.linkFilter)).follow(options);
	    }

	    var ret = [];
	    ret.$resolved = false;
	    ret.$error = null;
	    ret.$promise =
	      this.$promise.then(function(r) {
	        var resources = r.$followAll(rel, options);
	        Array.prototype.push.apply(ret, resources);
	        return resources.$promise.catch(function(err) {
	          ret.$resolved = true;
	          ret.$error = { message: 'One or more resources failed to load for $followAll(' + rel + ')', inner: err };
	          throw ret;
	        });
	      }, function(err) {
	        ret.$resolved = true;
	        ret.$error = { message: 'Parent resolution failed, unable to $followAll(' + rel + ')', inner: err };
	        throw ret;
	      }).then(function() {
	        ret.$resolved = true;
	        return ret;
	      });

	    return ret;
	  };
	};

	/**
	 * Expand a CURIE (compact URI) by looking up a prefix binding
	 * and processing it according to the media type specific CURIE
	 * processing rules.
	 * @param {String} curie The compact URI to expand.
	 * @returns {String} The CURIE expanded into a final URI.
	 * @throws {Error} Raises an error when trying to expand using
	 * an unknown CURIE prefix.
	 */
	Resource.prototype.$expandCurie = function(curie) {
	  var pieces = curie.split(':', 2);
	  return this.$curiePrefix(pieces[0]).expand(pieces[1]);
	};

	/**
	 * Locate a media-type specific registered CURIE (compact URI)
	 * prefix ({@link CuriePrefix}).
	 * @param {String} curiePrefix The CURIE prefix for look up.
	 * @returns {CuriePrefix} The media-type specific CURIE prefix.
	 * @throws {Error} Raises an error when looking for an unknown
	 * CURIE prefix.
	 */
	Resource.prototype.$curiePrefix = function(curiePrefix) {
	  var res = this;
	  var prefix = null;

	  while (!prefix && res) {
	    prefix = res.$$curiePrefixes[curiePrefix];
	    res = res.$parent;
	  }

	  if (!prefix) {
	    throw new Error('Unknown CURIE prefix');
	  }

	  return prefix;
	};

	/**
	 * Expand a CURIE (compact URI) by looking up a prefix binding
	 * and processing it according to the media type specific CURIE
	 * processing rules, and then follow the final URI.
	 * @param {String} curie The compact URI to follow
	 * @param {Object} options The options to pass when following
	 * the expanded URI.
	 * @returns {Resource} The resource from following the expanded URI.
	 * @throws {Error} Raises an error when looking for an unknown
	 * CURIE prefix.
	 */
	Resource.prototype.$followCurie = function(curie, options) {
	  var pieces = curie.split(':', 2);
	  return this.$curiePrefix(pieces[0]).follow(pieces[1], options);
	};

	/**
	 * Look up the embedded/sub resources for the given link relation.
	 *
	 * @arg {string} rel The link relation to follow.
	 * @arg {Object|Resource~resourcePredicate} [filter] A match object/predicate to limit returned sub-resources.
	 * @returns {Array} Array of embedded resources, or empty array if the link relation is not found.
	 * @example
	 * res.$subs('item')
	 * => [Resource { $resolved: true, $promise: resolved $q promise, ... various properties }]
	 */
	Resource.prototype.$subs = function(rel, filter) {
	  if (!this.$$embedded.hasOwnProperty(rel)) {
	    return [];
	  }

	  var subs = this.$$embedded[rel];
	  if (filter) {
	    subs = _.filter(subs, filter);
	  }

	  return subs;
	};


	/**
	 * Look up the embedded/sub resource for the given link relation.
	 *
	 * @arg {string} rel The link relation to follow.
	 * @arg {Object|Resource~resourcePredicate} [filter} The matching object/predicate to filter sub-resources.
	 * @returns {Resource} The embedded resource, or null if the link relation is not found.
	 * @throws Will throw an error if multiple instances of the relation are present.
	 * @example
	 * res.$sub('item')
	 * => Resource { $resolved: true, $promise: resolved $q promise, ... various properties }
	 */
	Resource.prototype.$sub = function(rel, filter) {
	  var ret = this.$subs(rel, filter);
	  if (ret.length === 0) {
	    return null;
	  }
	  if (ret.length > 1) {
	    throw 'Multiple sub-resources present';
	  }

	  return ret[0];
	};

	/**
	 * Alias for {@link Resource#$sub}.
	 * @function
	 */
	Resource.prototype.$embedded = Resource.prototype.$sub;

	/**
	 * Alias for {@link Resource#$subs}.
	 * @function
	 */
	Resource.prototype.$embeddeds = Resource.prototype.$subs;


	/**
	 * Check for existence of a linked or embedded resource for the given link
	 * relation. The function does _not_ take into account whether the resource is
	 * resolved or not, so the return value may be different once the resource is
	 * resolved.
	 * @arg {string} rel The link relation to check for.
	 * @arg {Object} [filter] The link/sub-resource filter
	 * @arg {Object|Resource~linkPredicate} [filter.linkFilter] A matching object or filter function when inspecting links.
	 * @arg {Object|Resource~resourcePredicate} [filter.subFilter] A matching object or filter function when inspecting sub/embedded resources.
	 * @return {boolean} True if the link relation is found in links or embedded, otherwise false.
	 */
	Resource.prototype.$has = function(rel, filter) {
	  var links = this.$links(rel);
	  if (filter && filter.linkFilter) {
	    links = _.filter(links, filter.linkFilter);
	  }
	  return links.length > 0 || this.$subs(rel).length > 0;
	};

	/**
	 * Send an HTTP DELETE request to the resource's 'self' link.
	 * @return {Resource} A resources with the response of the DELETE request.
	 */
	Resource.prototype.$delete = function() {
	  return this.$followOne('self', { protocol: {method: 'DELETE'} });
	};

	var defaultParser = _.constant({});

	Resource.prototype.$$resolve = function(response, context) {
	  var data = response.data, headers = response.headers;
	  this.$response = response;

	  _.forEach(context.extensions, function(e) {
	    if (!e.applies(data, headers, context)) {
	      return;
	    }

	    var fields = (e.dataParser || _.constant([])).apply(e, [data, headers, context]);

	    _.assign(this, _.reduce(fields, function(result, val) {
	      result[val.name] = val.value;
	      return result;
	    }, {}));

	    _.assign(this.$$links, (e.linkParser || defaultParser).apply(e, [data, headers, context]));
	    _.assign(this.$$forms, (e.formParser || defaultParser).apply(e, [data, headers, context]));
	    _.assign(this.$$embedded, (e.embeddedParser || defaultParser).apply(e, [data, headers, context, this]));
	    _.assign(this.$$curiePrefixes, (e.curiePrefixParser || defaultParser).apply(e, [data, headers, context]));
	    _.assign(this.$formatSpecific, (e.formatSpecificParser || defaultParser).apply(e, [data, headers, context]));
	  }, this);

	  this.$resolved = true;
	};

	Resource.prototype.$$reject = function(error, response, context) {
	  this.$error = error;
	  this.$$resolve(response, context);
	};

	Resource.embedded = function(raw, headers, context, parent) {
	  var ret = new Resource();
	  ret.$$resolve({ data: raw, headers: headers }, context);
	  ret.$parent = parent;
	  ret.$promise = Promise.resolve(ret);
	  return ret;
	};

	Resource.embeddedCollection = function(items, headers, context, parent) {
	  var embeds = items.map(function(e) { return Resource.embedded(e, headers, context, parent); }, this);

	  embeds.$promise = Promise.resolve(embeds);
	  embeds.$resolved = true;

	  return embeds;
	};

	Resource.fromRequest = function(request, context) {
	  var res = new Resource();
	  res.$promise =
	    request.then(function(response) {
	      context = context.baseline();
	      if (response.config && response.config.url) {
	        context = context.forResource({
	          url: response.config.url,
	          headers: response.headers
	        });
	      }
	      res.$$resolve(response, context);
	      return res;
	    }, function(response) {
	      res.$$reject({message: 'HTTP request to load resource failed', inner: response }, response, context);
	      throw res;
	    });

	  return res;
	};

	module.exports = Resource;


/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _ = __webpack_require__(2);

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
	  res.$promise.then(function() {
	    res.$resolved = true;
	  }, function(err) {
	    res.$resolved = true;
	    res.$error = err;
	  });

	  return res;
	};

	module.exports = LinkCollection;


/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	/*!
	 * URI.js - Mutating URLs
	 * URI Template Support - http://tools.ietf.org/html/rfc6570
	 *
	 * Version: 1.16.1
	 *
	 * Author: Rodney Rehm
	 * Web: http://medialize.github.io/URI.js/
	 *
	 * Licensed under
	 *   MIT License http://www.opensource.org/licenses/mit-license
	 *   GPL v3 http://opensource.org/licenses/GPL-3.0
	 *
	 */
	(function (root, factory) {
	  'use strict';
	  // https://github.com/umdjs/umd/blob/master/returnExports.js
	  if (true) {
	    // Node
	    module.exports = factory(__webpack_require__(4));
	  } else if (typeof define === 'function' && define.amd) {
	    // AMD. Register as an anonymous module.
	    define(['./URI'], factory);
	  } else {
	    // Browser globals (root is window)
	    root.URITemplate = factory(root.URI, root);
	  }
	}(this, function (URI, root) {
	  'use strict';
	  // FIXME: v2.0.0 renamce non-camelCase properties to uppercase
	  /*jshint camelcase: false */

	  // save current URITemplate variable, if any
	  var _URITemplate = root && root.URITemplate;

	  var hasOwn = Object.prototype.hasOwnProperty;
	  function URITemplate(expression) {
	    // serve from cache where possible
	    if (URITemplate._cache[expression]) {
	      return URITemplate._cache[expression];
	    }

	    // Allow instantiation without the 'new' keyword
	    if (!(this instanceof URITemplate)) {
	      return new URITemplate(expression);
	    }

	    this.expression = expression;
	    URITemplate._cache[expression] = this;
	    return this;
	  }

	  function Data(data) {
	    this.data = data;
	    this.cache = {};
	  }

	  var p = URITemplate.prototype;
	  // list of operators and their defined options
	  var operators = {
	    // Simple string expansion
	    '' : {
	      prefix: '',
	      separator: ',',
	      named: false,
	      empty_name_separator: false,
	      encode : 'encode'
	    },
	    // Reserved character strings
	    '+' : {
	      prefix: '',
	      separator: ',',
	      named: false,
	      empty_name_separator: false,
	      encode : 'encodeReserved'
	    },
	    // Fragment identifiers prefixed by '#'
	    '#' : {
	      prefix: '#',
	      separator: ',',
	      named: false,
	      empty_name_separator: false,
	      encode : 'encodeReserved'
	    },
	    // Name labels or extensions prefixed by '.'
	    '.' : {
	      prefix: '.',
	      separator: '.',
	      named: false,
	      empty_name_separator: false,
	      encode : 'encode'
	    },
	    // Path segments prefixed by '/'
	    '/' : {
	      prefix: '/',
	      separator: '/',
	      named: false,
	      empty_name_separator: false,
	      encode : 'encode'
	    },
	    // Path parameter name or name=value pairs prefixed by ';'
	    ';' : {
	      prefix: ';',
	      separator: ';',
	      named: true,
	      empty_name_separator: false,
	      encode : 'encode'
	    },
	    // Query component beginning with '?' and consisting
	    // of name=value pairs separated by '&'; an
	    '?' : {
	      prefix: '?',
	      separator: '&',
	      named: true,
	      empty_name_separator: true,
	      encode : 'encode'
	    },
	    // Continuation of query-style &name=value pairs
	    // within a literal query component.
	    '&' : {
	      prefix: '&',
	      separator: '&',
	      named: true,
	      empty_name_separator: true,
	      encode : 'encode'
	    }

	    // The operator characters equals ("="), comma (","), exclamation ("!"),
	    // at sign ("@"), and pipe ("|") are reserved for future extensions.
	  };

	  // storage for already parsed templates
	  URITemplate._cache = {};
	  // pattern to identify expressions [operator, variable-list] in template
	  URITemplate.EXPRESSION_PATTERN = /\{([^a-zA-Z0-9%_]?)([^\}]+)(\}|$)/g;
	  // pattern to identify variables [name, explode, maxlength] in variable-list
	  URITemplate.VARIABLE_PATTERN = /^([^*:]+)((\*)|:(\d+))?$/;
	  // pattern to verify variable name integrity
	  URITemplate.VARIABLE_NAME_PATTERN = /[^a-zA-Z0-9%_]/;

	  // expand parsed expression (expression, not template!)
	  URITemplate.expand = function(expression, data) {
	    // container for defined options for the given operator
	    var options = operators[expression.operator];
	    // expansion type (include keys or not)
	    var type = options.named ? 'Named' : 'Unnamed';
	    // list of variables within the expression
	    var variables = expression.variables;
	    // result buffer for evaluating the expression
	    var buffer = [];
	    var d, variable, i;

	    for (i = 0; (variable = variables[i]); i++) {
	      // fetch simplified data source
	      d = data.get(variable.name);
	      if (!d.val.length) {
	        if (d.type) {
	          // empty variables (empty string)
	          // still lead to a separator being appended!
	          buffer.push('');
	        }
	        // no data, no action
	        continue;
	      }

	      // expand the given variable
	      buffer.push(URITemplate['expand' + type](
	        d,
	        options,
	        variable.explode,
	        variable.explode && options.separator || ',',
	        variable.maxlength,
	        variable.name
	      ));
	    }

	    if (buffer.length) {
	      return options.prefix + buffer.join(options.separator);
	    } else {
	      // prefix is not prepended for empty expressions
	      return '';
	    }
	  };
	  // expand a named variable
	  URITemplate.expandNamed = function(d, options, explode, separator, length, name) {
	    // variable result buffer
	    var result = '';
	    // peformance crap
	    var encode = options.encode;
	    var empty_name_separator = options.empty_name_separator;
	    // flag noting if values are already encoded
	    var _encode = !d[encode].length;
	    // key for named expansion
	    var _name = d.type === 2 ? '': URI[encode](name);
	    var _value, i, l;

	    // for each found value
	    for (i = 0, l = d.val.length; i < l; i++) {
	      if (length) {
	        // maxlength must be determined before encoding can happen
	        _value = URI[encode](d.val[i][1].substring(0, length));
	        if (d.type === 2) {
	          // apply maxlength to keys of objects as well
	          _name = URI[encode](d.val[i][0].substring(0, length));
	        }
	      } else if (_encode) {
	        // encode value
	        _value = URI[encode](d.val[i][1]);
	        if (d.type === 2) {
	          // encode name and cache encoded value
	          _name = URI[encode](d.val[i][0]);
	          d[encode].push([_name, _value]);
	        } else {
	          // cache encoded value
	          d[encode].push([undefined, _value]);
	        }
	      } else {
	        // values are already encoded and can be pulled from cache
	        _value = d[encode][i][1];
	        if (d.type === 2) {
	          _name = d[encode][i][0];
	        }
	      }

	      if (result) {
	        // unless we're the first value, prepend the separator
	        result += separator;
	      }

	      if (!explode) {
	        if (!i) {
	          // first element, so prepend variable name
	          result += URI[encode](name) + (empty_name_separator || _value ? '=' : '');
	        }

	        if (d.type === 2) {
	          // without explode-modifier, keys of objects are returned comma-separated
	          result += _name + ',';
	        }

	        result += _value;
	      } else {
	        // only add the = if it is either default (?&) or there actually is a value (;)
	        result += _name + (empty_name_separator || _value ? '=' : '') + _value;
	      }
	    }

	    return result;
	  };
	  // expand an unnamed variable
	  URITemplate.expandUnnamed = function(d, options, explode, separator, length) {
	    // variable result buffer
	    var result = '';
	    // performance crap
	    var encode = options.encode;
	    var empty_name_separator = options.empty_name_separator;
	    // flag noting if values are already encoded
	    var _encode = !d[encode].length;
	    var _name, _value, i, l;

	    // for each found value
	    for (i = 0, l = d.val.length; i < l; i++) {
	      if (length) {
	        // maxlength must be determined before encoding can happen
	        _value = URI[encode](d.val[i][1].substring(0, length));
	      } else if (_encode) {
	        // encode and cache value
	        _value = URI[encode](d.val[i][1]);
	        d[encode].push([
	          d.type === 2 ? URI[encode](d.val[i][0]) : undefined,
	          _value
	        ]);
	      } else {
	        // value already encoded, pull from cache
	        _value = d[encode][i][1];
	      }

	      if (result) {
	        // unless we're the first value, prepend the separator
	        result += separator;
	      }

	      if (d.type === 2) {
	        if (length) {
	          // maxlength also applies to keys of objects
	          _name = URI[encode](d.val[i][0].substring(0, length));
	        } else {
	          // at this point the name must already be encoded
	          _name = d[encode][i][0];
	        }

	        result += _name;
	        if (explode) {
	          // explode-modifier separates name and value by "="
	          result += (empty_name_separator || _value ? '=' : '');
	        } else {
	          // no explode-modifier separates name and value by ","
	          result += ',';
	        }
	      }

	      result += _value;
	    }

	    return result;
	  };

	  URITemplate.noConflict = function() {
	    if (root.URITemplate === URITemplate) {
	      root.URITemplate = _URITemplate;
	    }

	    return URITemplate;
	  };

	  // expand template through given data map
	  p.expand = function(data) {
	    var result = '';

	    if (!this.parts || !this.parts.length) {
	      // lazilyy parse the template
	      this.parse();
	    }

	    if (!(data instanceof Data)) {
	      // make given data available through the
	      // optimized data handling thingie
	      data = new Data(data);
	    }

	    for (var i = 0, l = this.parts.length; i < l; i++) {
	      /*jshint laxbreak: true */
	      result += typeof this.parts[i] === 'string'
	        // literal string
	        ? this.parts[i]
	        // expression
	        : URITemplate.expand(this.parts[i], data);
	      /*jshint laxbreak: false */
	    }

	    return result;
	  };
	  // parse template into action tokens
	  p.parse = function() {
	    // performance crap
	    var expression = this.expression;
	    var ePattern = URITemplate.EXPRESSION_PATTERN;
	    var vPattern = URITemplate.VARIABLE_PATTERN;
	    var nPattern = URITemplate.VARIABLE_NAME_PATTERN;
	    // token result buffer
	    var parts = [];
	      // position within source template
	    var pos = 0;
	    var variables, eMatch, vMatch;

	    // RegExp is shared accross all templates,
	    // which requires a manual reset
	    ePattern.lastIndex = 0;
	    // I don't like while(foo = bar()) loops,
	    // to make things simpler I go while(true) and break when required
	    while (true) {
	      eMatch = ePattern.exec(expression);
	      if (eMatch === null) {
	        // push trailing literal
	        parts.push(expression.substring(pos));
	        break;
	      } else {
	        // push leading literal
	        parts.push(expression.substring(pos, eMatch.index));
	        pos = eMatch.index + eMatch[0].length;
	      }

	      if (!operators[eMatch[1]]) {
	        throw new Error('Unknown Operator "' + eMatch[1]  + '" in "' + eMatch[0] + '"');
	      } else if (!eMatch[3]) {
	        throw new Error('Unclosed Expression "' + eMatch[0]  + '"');
	      }

	      // parse variable-list
	      variables = eMatch[2].split(',');
	      for (var i = 0, l = variables.length; i < l; i++) {
	        vMatch = variables[i].match(vPattern);
	        if (vMatch === null) {
	          throw new Error('Invalid Variable "' + variables[i] + '" in "' + eMatch[0] + '"');
	        } else if (vMatch[1].match(nPattern)) {
	          throw new Error('Invalid Variable Name "' + vMatch[1] + '" in "' + eMatch[0] + '"');
	        }

	        variables[i] = {
	          name: vMatch[1],
	          explode: !!vMatch[3],
	          maxlength: vMatch[4] && parseInt(vMatch[4], 10)
	        };
	      }

	      if (!variables.length) {
	        throw new Error('Expression Missing Variable(s) "' + eMatch[0] + '"');
	      }

	      parts.push({
	        expression: eMatch[0],
	        operator: eMatch[1],
	        variables: variables
	      });
	    }

	    if (!parts.length) {
	      // template doesn't contain any expressions
	      // so it is a simple literal string
	      // this probably should fire a warning or something?
	      parts.push(expression);
	    }

	    this.parts = parts;
	    return this;
	  };

	  // simplify data structures
	  Data.prototype.get = function(key) {
	    // performance crap
	    var data = this.data;
	    // cache for processed data-point
	    var d = {
	      // type of data 0: undefined/null, 1: string, 2: object, 3: array
	      type: 0,
	      // original values (except undefined/null)
	      val: [],
	      // cache for encoded values (only for non-maxlength expansion)
	      encode: [],
	      encodeReserved: []
	    };
	    var i, l, value;

	    if (this.cache[key] !== undefined) {
	      // we've already processed this key
	      return this.cache[key];
	    }

	    this.cache[key] = d;

	    if (String(Object.prototype.toString.call(data)) === '[object Function]') {
	      // data itself is a callback (global callback)
	      value = data(key);
	    } else if (String(Object.prototype.toString.call(data[key])) === '[object Function]') {
	      // data is a map of callbacks (local callback)
	      value = data[key](key);
	    } else {
	      // data is a map of data
	      value = data[key];
	    }

	    // generalize input into [ [name1, value1], [name2, value2], … ]
	    // so expansion has to deal with a single data structure only
	    if (value === undefined || value === null) {
	      // undefined and null values are to be ignored completely
	      return d;
	    } else if (String(Object.prototype.toString.call(value)) === '[object Array]') {
	      for (i = 0, l = value.length; i < l; i++) {
	        if (value[i] !== undefined && value[i] !== null) {
	          // arrays don't have names
	          d.val.push([undefined, String(value[i])]);
	        }
	      }

	      if (d.val.length) {
	        // only treat non-empty arrays as arrays
	        d.type = 3; // array
	      }
	    } else if (String(Object.prototype.toString.call(value)) === '[object Object]') {
	      for (i in value) {
	        if (hasOwn.call(value, i) && value[i] !== undefined && value[i] !== null) {
	          // objects have keys, remember them for named expansion
	          d.val.push([i, String(value[i])]);
	        }
	      }

	      if (d.val.length) {
	        // only treat non-empty objects as objects
	        d.type = 2; // object
	      }
	    } else {
	      d.type = 1; // primitive string (could've been string, number, boolean and objects with a toString())
	      // arrays don't have names
	      d.val.push([undefined, String(value)]);
	    }

	    return d;
	  };

	  // hook into URI for fluid access
	  URI.expand = function(expression, data) {
	    var template = new URITemplate(expression);
	    var expansion = template.expand(data);

	    return new URI(expansion);
	  };

	  return URITemplate;
	}));


/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _ = __webpack_require__(2);
	var FormUrlEncoded = __webpack_require__(14);
	var Resource = __webpack_require__(10);

	/**
	 * Forms should not be created on their own, they are normally
	 * accessed from a containing {@link Resource}.
	 * @constructor
	 * @arg {Object} data The form data, including field information
	 * @arg {Context} context The context of the form.
	 *
	 * @classdesc
	 * The {@link Form} class encapsulates a hypermedia form that can be
	 * updated with values at runtime and then submitted.
	 * TODO: More details on field values, etc.
	 */
	var Form = function(data, context) {
	  // Cloning is required to keep cloned Form
	  // instances separate.
	  _.merge(this, _.cloneDeep(data));

	  this.$$data = data;
	  this.$$context = context;
	};

	/**
	 * Lookup the field by the given name.
	 * @arg {string} name The name of the field to look up.
	 * @returns {Object} Object containing the field values.
	 */
	Form.prototype.field = function(name) {
	  return _.find(this.fields, 'name', name);
	};

	var ContentTypeDataTransformers = {
	  'application/json': function(data) {
	    return JSON.stringify(data);
	  },
	  'application/x-www-form-urlencoded': function(data) {
	    return data ? FormUrlEncoded.encode(data) : undefined;
	  },
	  'multipart/form-data': function(data) {
	    var fd = new FormData();
	    _.forEach(data, function(val, key) { fd.append(key, val); });

	    return fd;
	  }
	};

	/**
	 * Get the name/value data for all the fields of the form.
	 *
	 * @returns {?Object.<string, *>} The name/value data for the fields of the form.
	 */
	Form.prototype.getRequestData = function() {
	  if (!this.fields) {
	    return null;
	  }

	  return _(this.fields)
	    .indexBy('name')
	    .mapValues(_.property('value'))
	    .value();
	};

	/**
	 * Perform an HTTP request to submit the form. The request itself
	 * is created based on the URL, method, type, and field values.
	 * @arg {Object} [options] The options for the request.
	 * @arg {Object} [options.protocol] Options to pass to the underlying protocol,
	 * e.g. http/https.
	 * @returns {Resource} A resource that will eventually be resolved with response details.
	 */
	Form.prototype.submit = function(options) {
	  options = this.$$context.withDefaults(options);
	  var config = _.get(options, 'protocol', {});

	  config = _.merge({}, config, {
	    url: this.$$context.resolveUrl(this.href),
	    method: this.method,
	    transformRequest: [function(d, h) {
	      // Handle 'header getter' style headers, instead of bare object.
	      if (h instanceof Function) {
	        h = h();
	      }

	      var ct = (h['content-type'] || h['Content-Type']);

	      var extEncoders = _(this.$$context.extensions).pluck('encoders').compact();
	      var encoders = _(ContentTypeDataTransformers).concat(extEncoders.flatten().value()).reduce(_.merge);

	      var trans = encoders[ct];
	      return trans ? trans(d) : d;
	    }.bind(this)],
	    headers: { 'Content-Type': this.type || 'application/x-www-form-urlencoded' }
	  });

	  if (!config.headers.Accept) {
	    config.headers.Accept = this.$$context.acceptHeader();
	  }

	  if (this.fields) {
	    var prop = this.method === 'GET' ? 'params' : 'data';
	    config[prop] = this.getRequestData();
	  }

	  var ctx = this.$$context;
	  var resp = ctx.http(config).then(function(r) {
	    if (r.status !== 201 || !r.headers.location) {
	      return r;
	    }

	    var loc = r.headers.location;
	    ctx = ctx.forResource({url: config.url});
	    return ctx.http({method: 'GET', url: ctx.resolveUrl(loc), headers: config.headers });
	  });
	  return Resource.fromRequest(resp, ctx);
	};

	/**
	 * Clone the current {@link Form} so that fields can be updated
	 * and not impact/change the original form field values.
	 * @returns {Form} the cloned form.
	 */
	Form.prototype.clone = function() {
	  return new Form(this.$$data,
	                  this.$$context);
	};

	module.exports = Form;


/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(15);

/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(module) {// Filename: formurlencoded.js
	// Timestamp: 2014.04.18-10:14:24 (last modified)  
	// Author(s): Bumblehead (www.bumblehead.com), JBlashill (james@blashill.com)


	var formurlencoded = (( true) ? module : {}).exports = {
	  
	  // input: {one:1,two:2} return: '[one]=1&[two]-2'

	  encode : function (data, options) {
	    function getNestValsArrAsStr(arr) {
	      return arr.filter(function (e) {
	        return typeof e === 'string' && e.length;
	      }).join('&');
	    }

	    function getKeys(obj) {
	      var keys = Object.keys(obj);

	      return options && options.sorted ? keys.sort() : keys;
	    }

	    function getObjNestVals (name, obj) {
	      var objKeyStr = ':name[:prop]';

	      return getNestValsArrAsStr(getKeys(obj).map(function (key) {
	        return getNestVals(
	          objKeyStr.replace(/:name/, name).replace(/:prop/, key), obj[key]
	        );
	      }));
	    }

	    function getArrNestVals (name, arr) {
	      var arrKeyStr = ':name[]';

	      return getNestValsArrAsStr(arr.map(function (elem) {
	        return getNestVals(
	          arrKeyStr.replace(/:name/, name), elem
	        );
	      }));
	    }

	    function getNestVals (name, value) {
	      var whitespaceRe = /%20/g,
	          type = typeof value, 
	          f = null;

	      if (type === 'string') {
	        f = encodeURIComponent(name) + '=' +
	          formEncodeString(value);
	      } else if (type === 'number') {
	        f = encodeURIComponent(name) + '=' +
	            encodeURIComponent(value).replace(whitespaceRe, '+');
	      } else if (type === 'boolean') {
	        f = encodeURIComponent(name) + '=' + value;
	      } else if (Array.isArray(value)) {
	        f = getArrNestVals(name, value);
	      } else if (type === 'object') {
	        f = getObjNestVals(name, value);
	      }

	      return f;
	    }

	    // 5.1, http://www.w3.org/TR/html5/forms.html#url-encoded-form-data
	    function manuallyEncodeChar (ch) {
	      return '%' + ('0' + ch.charCodeAt(0).toString(16)).slice(-2).toUpperCase();
	    };

	    function formEncodeString (value) {
	      return value
	        .replace(/[^ !'()~\*]*/g, encodeURIComponent)
	        .replace(/ /g, '+')
	        .replace(/[!'()~\*]/g, manuallyEncodeChar);
	    };

	    return getNestValsArrAsStr(getKeys(data).map(function (key) {
	      return getNestVals(key, data[key]);
	    }));
	  }
	};



	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(6)(module)))

/***/ },
/* 16 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _ = __webpack_require__(2);

	module.exports.extractFields = function(data) {
	  return _.transform(data, function(res, val, key) {
	    res.unshift({ name: key, value: val });
	  }, []);
	};


/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _ = __webpack_require__(2);
	var FieldUtils = __webpack_require__(16);
	var WebLink = __webpack_require__(9);
	var HalCuriePrefix = __webpack_require__(18);
	var LinkCollection = __webpack_require__(11);
	var Resource = __webpack_require__(10);

	/**
	 * Create the HAL extension
	 *
	 * @constructor
	 * @implements {Extension}
	 * @arg {Array} mediaTypes Media types in addition to `application/hal+json`
	 * that should be handled by this extensions. This allows for custom media
	 * types based on HAL to be handled properly.
	 *
	 * @classdesc
	 * Extension for processing
	 * [HAL](http://tools.ietf.org/html/draft-kelly-json-hal-06) responses.
	 * By default, the extension will only process links and embedded
	 * resources in responses if the HTTP response `Content-Type` header
	 * equals `application/hal+json`. If you have a custom media type that
	 * extends HAL, you can register it by passing it in the `mediaTypes`
	 * parameter.
	 */
	var HalExtension = function(mediaTypes) {
	  var mediaTypeSet = {
	    'application/hal+json': true,
	    'application/vnd.hal+json': true
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
	    var   type = h.split(';')[0];
	    return mediaTypeSet[type] !==  undefined;
	  };

	  this.dataParser = function(data) {
	    return FieldUtils.extractFields(_.omit(data, function(val, key) {
	      return key === '_links' || key === '_embedded';
	    }));
	  };

	  this.linkParser = function(data, headers, context) {
	    if (!_.isObject(data._links)) {
	      return {};
	    }

	    var ret = {};
	    _.forEach(data._links, function(val, key) {
	      if (!_.isArray(val)) {
	        val = [val];
	      }

	      var linkArray = [];
	      _.forEach(val, function(l) {
	        // Because HAL uses link relations as object keys, we populate
	        // the rel field on the link manually so the link is self
	        // contained from this point onward.
	        l.rel = key;
	        linkArray.push(new WebLink(l, context));
	      }, this);

	      ret[key] = LinkCollection.fromArray(linkArray);
	    }, this);
	    return ret;
	  };

	  this.curiePrefixParser = function(data, headers, context) {
	    var curies = this.linkParser(data, headers, context).curies;

	    if (!curies) {
	      return {};
	    }


	    return _(curies).map(function(c) {
	      return new HalCuriePrefix(c);
	    }).indexBy('prefix').value();
	  };

	  this.embeddedParser = function(data, headers, context, parent) {
	    var ret = {};
	    _.forEach(data._embedded || {}, function(val, key) {
	      if (!_.isArray(val)) {
	        val = [val];
	      }

	      ret[key] = Resource.embeddedCollection(val, headers, context, parent);
	    });

	    return ret;
	  };
	};

	module.exports = HalExtension;



/***/ },
/* 18 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _ = __webpack_require__(2);

	/**
	 *
	 * @constructor
	 * @implements {CuriePrefix}
	 * @arg {WebLink} link The web link including the name/prefix and URI Template
	 *
	 * @classdesc
	 * A CURIE prefix binding that encompasses the
	 * [HAL](https://tools.ietf.org/html/draft-kelly-json-hal-07)
	 * processing rules for using a [URI Template](http://tools.ietf.org/html/rfc6570)
	 * to create the final URIs.
	 */
	var HalCuriePrefix = function(link) {
	  this.$$link = link;
	  this.prefix = link.name;
	};

	HalCuriePrefix.prototype.expand = function(reference) {
	  return this.$$link.resolvedUrl({rel: reference});
	};

	HalCuriePrefix.prototype.follow = function(reference, options) {
	  return this.$$link.follow(_.merge(options || {}, { data: { rel: reference }}));
	};

	module.exports = HalCuriePrefix;


/***/ },
/* 19 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var fieldUtils = __webpack_require__(16);

	/**
	 * Create a new JSON extension.
	 *
	 * @constructor
	 * @implements {Extension}
	 *
	 * @classdesc
	 * Extension for parsing basic field data from `application/json` responses.
	 *
	 */
	var JsonExtension = function() {
	  this.mediaTypes = ['application/json'];

	  this.applies = function(data, headers) {
	    var h = headers['content-type'];
	    if (!h) {
	      return false;
	    }

	    // Handle parameters, e.g. application/json; charset=UTF-8
	    var type = h.split(';')[0];
	    return type === 'application/json';
	  };

	  this.dataParser = fieldUtils.extractFields;
	};

	module.exports = JsonExtension;


/***/ },
/* 20 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _ = __webpack_require__(2);

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


/***/ },
/* 21 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var httpLink = __webpack_require__(22);

	var _ = __webpack_require__(2);
	var WebLink = __webpack_require__(9);

	/**
	 * Create a new link header extension.
	 *
	 * @constructor
	 * @implements {Extension}
	 *
	 * @classdesc
	 * Extension for parsing [HTTP Link Headers](http://tools.ietf.org/html/rfc5988#section-5)
	 * in responses
	 *
	 */
	var LinkHeaderExtension = function() {
	  this.applies = function(data, headers) {
	    return _.isString(headers.link);
	  };

	  this.linkParser = function(data, headers, context) {
	    var links = httpLink.parse(headers.link);

	    var ret = {};
	    for(var i = 0; i < links.length; i++) {
	      var l = links[i];
	      var wl = new WebLink(l, context);
	      if (!_.isUndefined(ret[l.rel])) {
	        ret[l.rel].push(wl);
	      } else {
	        ret[l.rel] = [wl];
	      }

	      delete l.rel;
	    }
	    return ret;
	  };
	};

	module.exports = LinkHeaderExtension;


/***/ },
/* 22 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;(function() {

	const HT = '\t';
	const SP = ' ';
	const CR = '\r';
	const NF = '\n';

	const SPACES = [SP, HT, CR, NF];

	const SEPARATORS = [
	    '(', ')', '<', '>', '@', 
	    ',', ';', ':', '\\', '"',
	    '/', '[', ']', '?', '=',
	    '{', '}', SP, HT
	];

	function skipSpaces(value, pos) {
	    while (pos < value.length && SPACES.indexOf(value.charAt(pos)) >= 0) pos++;

	    return pos;
	}

	function readToken(value, pos) {
	    var start = pos;
	    while (pos < value.length && SEPARATORS.indexOf(value.charAt(pos)) == -1) {
	        pos++;
	    }
	    
	    return value.substring(start, pos);
	}

	function readQuotedString(value, pos) {
	    var ch;
	    var start = pos;
	    
	    pos++;
	    while (pos < value.length) {
	        ch = value.charAt(pos);
	        if (ch === '"') break;
	        if (ch === '\\') pos++;
	        pos++;
	    }
	    
	    return value.substring(start, pos + 1);
	}

	function decodeQuotedString(value) { 
	    value = value.substr(1, value.length - 2);
	    var start = 0, p;
	    var result = '';
	    
	    while((p = value.indexOf('\\', start)) != -1) {
	        result += value.substring(start, p);
	        start = p + 2;
	    }
	    
	    result += value.substring(start);
	    
	    return result;
	}

	function readLinkParam(value, pos, link) {
	    var pname = readToken(value, pos);
	    pos = skipSpaces(value, pos + pname.length);
	    if (value.charAt(pos) !== '=')
	        throw new Error('Unexpected token: ' + pos);

	    pos++;
	    
	    var isQuotedString = value.charAt(pos) === '"';
	    var pvalue;
	    if (isQuotedString) {
	        pvalue = readQuotedString(value, pos);
	        pos += pvalue.length;
	        pvalue = decodeQuotedString(pvalue);
	        
	    } else {
	        pvalue = readToken(value, pos);
	        pos += pvalue.length;
	        
	        if (pname == 'type') {
	            if (value.charAt(pos) !== '/')
	                throw new Error('Unexpected token: ' + pos);
	            pos++;
	            var subtype = readToken(value, pos);
	            pos += subtype.length;
	            pvalue += '/' + subtype;
	        }
	    }
	    link[pname] = pvalue;
	    
	    return pos;
	}

	function readLink(value, pos, link) {
	    if (value.charAt(pos) !== '<')
	        throw new Error('Unexpected token: ' + pos);
	    
	    var p = value.indexOf('>', pos);
	    if (p === -1) throw new Error('Unexpected token: ' + pos);

	    link.href = value.substring(pos + 1, p);
	    pos = skipSpaces(value, p + 1);
	    
	    while(pos < value.length && value.charAt(pos) === ';') {
	        pos = skipSpaces(value, pos + 1);
	        pos = readLinkParam(value, pos, link);
	        pos = skipSpaces(value, pos);
	    }
	    
	    return pos;
	}

	var httpLink = {};

	/**
	 * Parse the given string.
	 * @param {String} value string as defined in http://www.w3.org/wiki/LinkHeader
	 * @return {Array} array of link objects
	 * @example '<http://example.com/TheBook/chapter2>; rel="previous"' -> [{href: 'http://example.com/TheBook/chapter2', rel: 'previous'}]
	 */
	httpLink.parse = function(value) {
	    var pos = 0;
	    
	    var links = [];
	    var link;
	    
	    while (pos < value.length && (pos === 0 || value.charAt(pos) === ',' && pos++)) {
	        link = {};
	        pos = skipSpaces(value, pos);
	        pos = readLink(value, pos, link);
	        links.push(link);
	        pos = skipSpaces(value, pos);
	    }
	    
	    if (pos < value.length)
	        throw new Error('Unexpected token: ' + pos);
	    
	    return links;
	};

	httpLink.stringify = function(array) {
	    return array.map(function(obj) {
	        var href = obj.href;
	        var attr = Object.keys(obj).filter(function(key) {
	            return key !== 'href';
	        }).map(function(key) {
	            return key + '=' + JSON.stringify(obj[key]);
	        });

	        return ['<' + obj.href + '>'].concat(attr).join('; ');
	    }).join(', ');
	}

	if (true) { // RequireJS AMD
	    !(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_RESULT__ = function () {
	        return httpLink;
	    }.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	    
	} else if (typeof module === 'object' && module.exports) { // NodeJS, CommonJS
	    module.exports = httpLink;

	} else { // browser <script>
	    this.httpLink = httpLink;
	}

	})();


/***/ },
/* 23 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _ = __webpack_require__(2);
	var Form = __webpack_require__(13);
	var Resource = __webpack_require__(10);
	var WebLink = __webpack_require__(9);
	var LinkCollection = __webpack_require__(11);

	/**
	 * Create the Siren extension
	 *
	 * @constructor
	 * @implements {Extension}
	 * @arg {Array} mediaTypes Media types in addition to `application/vnd.siren+json`
	 * that should be handled by this extensions. This allows for custom media
	 * types based on Siren to be handled properly.
	 *
	 * @classdesc
	 * Extension for processing
	 * [Siren](https://github.com/kevinswiber/siren) responses.  By default,
	 * the extension will only process links and embedded resources in
	 * responses if the HTTP response `Content-Type` header equals
	 * `application/vnd.siren+json`. If you have a custom media type that
	 * extends SIren, you can register it by passing it in the `mediaTypes`
	 * parameter.
	 *
	 * At this point, the Siren extension includes both the Siren `links` and
	 * the sub-entity embedded links in the set queried by the {@link
	 * Resource#$link}/{@link Resource#$links} functions.
	 *
	 * Siren's [actions](https://github.com/kevinswiber/siren#actions-1) are
	 * exposed through {@link Resource#$form} and {@link Resource#$forms}.
	 */
	var SirenExtension = function(mediaTypes) {
	  var formDefaults = {
	    method: 'GET',
	    type: 'application/x-www-form-urlencoded'
	  };

	  var mediaTypeSet = { 'application/vnd.siren+json': true };

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

	  this.dataParser = function (data) {
	    return _.transform(data.properties, function (res, val, key) {
	      res.unshift({ name: key, value: val });
	    }, []);
	  };

	  this.linkParser = function(data, headers, context) {
	    var ret = {};

	    if (_.isObject(data.links)) {
	      _.forEach(data.links, function (val) {
	        var link = new WebLink(val, context);
	        for (var li = 0; li < val.rel.length; li++) {
	          var r = val.rel[li];
	          if (ret.hasOwnProperty(r)) {
	            ret[r].push(link);
	          } else {
	            ret[r] = [link];
	          }
	        }
	      });
	    }

	    if (_.isObject(data.entities)) {
	      _.forEach(data.entities, function(val) {
	        if (!val.href) {
	          return;
	        }

	        var link = new WebLink(val, context);
	        for (var li = 0; li < val.rel.length; li++) {
	          var r = val.rel[li];
	          if (ret.hasOwnProperty(r)) {
	            ret[r].push(link);
	          } else {
	            ret[r] = [link];
	          }
	        }
	      });
	    }

	    return _.mapValues(ret, LinkCollection.fromArray);
	  };

	  this.embeddedParser = function(data, headers, context, parent) {
	    var ret = {};
	    if (!_.isArray(data.entities)) {
	      return ret;
	    }

	    _.forEach(data.entities, function(val) {
	      if (val.href) {
	        return;
	      }

	      for (var li = 0; li < val.rel.length; li++) {
	        var r = val.rel[li];
	        if (!ret.hasOwnProperty(r)) {
	          ret[r] = [];
	        }
	        ret[r].unshift(val);
	      }
	    });
	    return _.mapValues(ret, _.partialRight(Resource.embeddedCollection, headers, context, parent));
	  };


	  this.formParser = function(data, headers, context) {
	    var formFactory = function(f) {
	      return new Form(_.defaults(f, formDefaults), context);
	    };

	    return _.groupBy(_.map(data.actions, formFactory), 'name');
	  };

	  this.formatSpecificParser = function(data) {
	    var traitKeysMap = {'title':'title', 'class':'class'};
	    var sirenTraits  = Object.keys(traitKeysMap);

	    var ret = _.transform(data.properties, function (res, val, key) {
	      res.unshift({ name: key, value: val });
	    }, []);

	    // bring SIREN specific attributes to resources object
	    sirenTraits.forEach(function addTraitIfExisting(key){
	      var exportName;
	      var exportValue = data[key];

	      if (typeof exportValue !== 'undefined') {
	        exportName = traitKeysMap[key];
	        exportValue = JSON.parse(JSON.stringify(exportValue));
	        ret.unshift({name: exportName, value: exportValue});
	      }
	    });

	    return ret;
	  };

	};

	module.exports = SirenExtension;


/***/ },
/* 24 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _ = __webpack_require__(2);
	var FieldUtils = __webpack_require__(16);
	var Form = __webpack_require__(13);
	var WebLink = __webpack_require__(9);
	var Resource = __webpack_require__(10);
	var LinkCollection = __webpack_require__(11);

	var cjObjectLinkParser = function(obj, headers, context) {

	  var links = (obj.links || []).concat([{ rel: 'self', href: obj.href }]);

	  return _(links)
	    .map(function(l) { return new WebLink(l, context); })
	    .groupBy('rel')
	    .mapValues(function(links) { return LinkCollection.fromArray(links); })
	    .value();
	};

	var CollectionJsonItemExtension = function(parentCollection) {
	  this.applies = _.constant(true);

	  this.linkParser = cjObjectLinkParser;

	  this.dataParser = function(data) {
	    return data.data || [];
	  };

	  this.formParser = function(data, headers, context) {
	    var templateData = _.get(parentCollection, 'collection.template.data') || [];
	    // Depend on indexBy using the *last* item to generate a key as the value to
	    // have the item's data, if present, override the template's data.
	    var fields = _(templateData.concat(data.data || [])).indexBy('name').values().value();

	    return {
	      'edit-form': [
	        new Form({
	          href: data.href,
	          method: 'PUT',
	          type: 'application/vnd.collection+json',
	          fields: fields
	        }, context)
	      ]
	    };
	  };
	};

	/**
	 * Create the Collection+JSON extension
	 *
	 * @constructor
	 * @implements {Extension}
	 * @arg {Array} [mediaTypes] Media types in addition to
	 * `application/vnd.collection+json` that should be handled by this extensions.
	 * This allows for custom media types based on Collection+JSON to be handled
	 * properly.
	 *
	 * @classdesc
	 * Extension for processing
	 * [Collection+JSON](http://amundsen.com/media-types/collection/format/).
	 * By default, the extension will only process links and embedded
	 * resources in responses if the HTTP response `Content-Type` header
	 * equals `application/vnd.collection+json`. If you have a custom media type that
	 * extends C+J, you can register it by passing it in the `mediaTypes`
	 * parameter.
	 *
	 * C+J queries are exposed as forms, and can be accessed using {@link Resource#$form}
	 * or {@link Resource#$forms}. For adding items, a form is accessible using the
	 * `create-form` IANA standard link relation.
	 *
	 * Collection items can be extracted using the `item` standard link relation using
	 * {@link Resource#$sub} or {@link Resource#$subs}.
	 *
	 * A given embedded item can be edited by using the form with the `edit-form` standard
	 * link relation.
	 *
	 * @example <caption>Example editing an existing item</caption>
	 * new Root('http://localhost/posts', axios, [new CollectionJsonExtension()]).follow().then(function(coll) {
	 *   var firstItem = coll.$subs('item')[0];
	 *   var editForm = firstItem.$form('edit-form');
	 *   editForm.field('title').value = 'Edited Title';
	 *   var newFirstItem = editForm.submit().$followOne('item');
	 * });
	 *
	 */
	var CollectionJsonExtension = function(mediaTypes) {
	  var mediaTypeSet = { 'application/vnd.collection+json': true };

	  mediaTypes = mediaTypes || [];
	  for (var i = 0; i < mediaTypes.length; i++) {
	    mediaTypeSet[mediaTypes[i]] = true;
	  }

	  this.encoders = {
	    'application/vnd.collection+json': function(data) {
	      return JSON.stringify({
	        template: {
	          data: FieldUtils.extractFields(data)
	        }
	      });
	    }
	  };

	  this.mediaTypes = _.keys(mediaTypeSet);

	  this.applies = function(data, headers) {
	    var h = headers['content-type'];
	    if (!h) {
	      return false;
	    }

	    // Handle parameters, e.g. application/vnd.collection+json; charset=UTF-8
	    var type = h.split(';')[0];
	    return mediaTypeSet[type] !==  undefined;
	  };

	  this.dataParser = function(data) {
	    // The data parser really only applies when parsing
	    // an included item for use as an embedded resource,
	    // so here we don't expect to be nested under "collection".
	    return data.data || [];
	  };

	  this.linkParser = function(data, headers, context) {
	    return cjObjectLinkParser(data.collection, headers, context);
	  };

	  var queryFormDefaults = {
	    method: 'GET',
	    type: 'application/x-www-form-urlencoded'
	  };

	  this.formParser = function(data, headers, context) {
	    var coll = data.collection;

	    var formFactory = function(q) {
	      var q2 = _.clone(q);
	      q2.fields = q2.data;
	      delete q2.data;
	      return new Form(_.defaults(q2, queryFormDefaults), context);
	    };

	    var forms = _.groupBy(_.map((coll.queries || []), formFactory), 'rel');

	    if (coll.template) {
	      forms['create-form'] = [
	        new Form({
	          href: coll.href,
	          method: 'POST',
	          type: 'application/vnd.collection+json',
	          fields: coll.template.data
	        }, context)
	      ];
	    }
	    return forms;
	  };

	  this.embeddedParser = function(data, headers, context, parent) {
	    return {
	      item: Resource.embeddedCollection(
	        _.cloneDeep(data.collection.items),
	        headers,
	        context.withExtensions([new CollectionJsonItemExtension(data)]),
	        parent
	      )
	    };
	  };
	};

	module.exports = CollectionJsonExtension;


/***/ }
/******/ ]);