'use strict';

function buildDisplayName(data) {
  const last = data.LastName || '';
  const first = data.FirstAndMiddleName || '';
  if (last && first) return `${last}, ${first}`;
  return last || first;
}

function slugify(str) {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function buildSlug(data) {
  const first = data.FirstAndMiddleName || '';
  const last = data.LastName || '';
  const suffix = data.NameSuffix || '';
  return slugify(`${first} ${last} ${suffix}`.trim());
}

module.exports = {
  beforeCreate(event) {
    event.params.data.GeneratedDisplayName = buildDisplayName(event.params.data);
    if (!event.params.data.Slug) {
      event.params.data.Slug = buildSlug(event.params.data);
    }
  },
  beforeUpdate(event) {
    if (event.params.data.FirstAndMiddleName !== undefined || event.params.data.LastName !== undefined) {
      event.params.data.GeneratedDisplayName = buildDisplayName(event.params.data);
    }
  },
};
