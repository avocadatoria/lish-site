/**
 * JSON-LD structured data helpers for SEO.
 * Returns plain objects — serialize with JSON.stringify in <script type={`application/ld+json`}>.
 */

export function organizationJsonLd({ name, url, logo, description }) {
  return {
    [`@context`]: `https://schema.org`,
    [`@type`]: `Organization`,
    name,
    url,
    ...(logo && { logo }),
    ...(description && { description }),
  };
}

export function webPageJsonLd({ name, description, url }) {
  return {
    [`@context`]: `https://schema.org`,
    [`@type`]: `WebPage`,
    name,
    ...(description && { description }),
    ...(url && { url }),
  };
}

export function articleJsonLd({ headline, description, author, datePublished, url, image }) {
  return {
    [`@context`]: `https://schema.org`,
    [`@type`]: `Article`,
    headline,
    ...(description && { description }),
    ...(author && { author: { [`@type`]: `Person`, name: author } }),
    ...(datePublished && { datePublished }),
    ...(url && { url }),
    ...(image && { image }),
  };
}

export function productJsonLd({ name, description, image, price, currency = `USD`, url }) {
  return {
    [`@context`]: `https://schema.org`,
    [`@type`]: `Product`,
    name,
    ...(description && { description }),
    ...(image && { image }),
    ...(url && { url }),
    ...(price && {
      offers: {
        [`@type`]: `Offer`,
        price,
        priceCurrency: currency,
        availability: `https://schema.org/InStock`,
      },
    }),
  };
}

export function breadcrumbJsonLd(items) {
  return {
    [`@context`]: `https://schema.org`,
    [`@type`]: `BreadcrumbList`,
    itemListElement: items.map((item, i) => ({
      [`@type`]: `ListItem`,
      position: i + 1,
      name: item.name,
      ...(item.url && { item: item.url }),
    })),
  };
}
