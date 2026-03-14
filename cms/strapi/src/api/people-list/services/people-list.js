'use strict';

/**
 * people-list service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::people-list.people-list');
