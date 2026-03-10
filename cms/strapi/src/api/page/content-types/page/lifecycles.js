'use strict';

function slugify(str) {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

module.exports = {
  beforeCreate(event) {
    if (!event.params.data.Slug && event.params.data.title) {
      event.params.data.Slug = slugify(event.params.data.title);
    }
  },
};
