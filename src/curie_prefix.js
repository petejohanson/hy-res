'use strict';

/**
 * Interface for a CURIE prefix binding.
 *
 * @interface CuriePrefix
 */

/**
 * Expand a CURIE reference to a full URI.
 *
 * @function CuriePrefix#expand
 * @arg {String} reference The reference to expand
 * @returns {String} The full URI after expansion.
 */

/**
 * Follow a CURIE reference once expanded to a full URI.
 *
 * @function CuriePrefix#follow
 * @arg {String} reference The reference to expand
 * @arg {Object} options The options to pass to {@link WebLink#follow}
 * @returns {Resource} The resource resulting from following the final URI.
 */
