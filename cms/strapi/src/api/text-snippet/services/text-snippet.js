'use strict';

/**
 * text-snippet service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::text-snippet.text-snippet');
