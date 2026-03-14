import { notFound } from 'next/navigation';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import { getSectionBySlug, getPageBySlug, getPeopleListByKey, getProvidersPageServices, getServiceBySlug, getTestimonialsPageConfig } from '../../../lib/server-api.js';
import { verifyPreviewToken } from '../../../lib/preview.js';

import { BoardMemberCard, ExecLeaderCard } from '../../../components/common/PersonCard.js';

const PEOPLE_LIST_KEYS = {
  'executive-leadership': `ExecutiveTeam`,
  'board-of-directors': `BoardOfDirectors`,
};

export async function generateMetadata({ params }) {
  const { sectionSlug, pageSlug } = await params;
  const isServicePage = sectionSlug === `services`;

  if (isServicePage) {
    const service = await getServiceBySlug(pageSlug);
    if (!service || !service.CreatePage) return {};
    const title = service.DefaultLabel;
    const canonical = `${process.env.APP_URL}/${sectionSlug}/${pageSlug}`;
    return {
      title,
      ...(service.ServicePageTagline && { description: service.ServicePageTagline }),
      alternates: { canonical },
    };
  }

  const page = await getPageBySlug(pageSlug);
  if (!page) return {};

  const title = page.SEOTitleOverride || page.title;
  const description = page.SEODescription || undefined;
  const canonical = `${process.env.APP_URL}/${sectionSlug}/${pageSlug}`;

  return {
    title,
    ...(description && { description }),
    alternates: { canonical },
  };
}

export default async function SectionSubPage({ params, searchParams }) {
  const { sectionSlug, pageSlug } = await params;
  const query = await searchParams;
  const pathname = `/${sectionSlug}/${pageSlug}`;
  const draft = query.status === `draft` && verifyPreviewToken(pathname, query.preview_token);
  const fetchOpts = draft ? { draft: true } : {};

  const isServicePage = sectionSlug === `services`;
  const isProviders = pageSlug === `our-providers`;
  const isTestimonials = pageSlug === `testimonials`;
  const peopleListKey = PEOPLE_LIST_KEYS[pageSlug] || null;

  // ── Service detail page (/services/allergy, etc.) ──
  if (isServicePage) {
    const service = await getServiceBySlug(pageSlug, fetchOpts);
    if (!service || !service.CreatePage) notFound();

    const serviceContentHtml = service.ServicePageContent || null;

    return (
      <>
        <Typography component={`h1`} variant={`h3`} gutterBottom>
          {service.DefaultLabel}
        </Typography>
        {service.ServicePageTagline && (
          <Typography variant={`subtitle1`} color={`text.secondary`} sx={{ mb: 4 }}>
            {service.ServicePageTagline}
          </Typography>
        )}
        {serviceContentHtml && (
          <div className={`cms-content`} dangerouslySetInnerHTML={{ __html: serviceContentHtml }} />
        )}
      </>
    );
  }

  // ── Regular section subpages ──
  const [section, page, services, testimonialsConfig, peopleList] = await Promise.all([
    getSectionBySlug(sectionSlug, fetchOpts),
    getPageBySlug(pageSlug, fetchOpts),
    isProviders ? getProvidersPageServices(fetchOpts) : null,
    isTestimonials ? getTestimonialsPageConfig(fetchOpts) : null,
    peopleListKey ? getPeopleListByKey(peopleListKey, fetchOpts) : null,
  ]);

  if (!section || !page) notFound();

  const people = peopleList?.People || [];
  const isBoard = pageSlug === `board-of-directors`;
  const providerServices = services || [];
  const testimonials = testimonialsConfig?.testimonials || [];

  const pageContentHtml = page.Content || null;
  const testimonialHtmls = isTestimonials
    ? testimonials.map((t) => t.Content)
    : [];

  return (
    <>
      <Typography component={`h1`} variant={`h3`} gutterBottom>
        {page.title}
      </Typography>
      {page.Tagline && (
        <Typography variant={`subtitle1`} color={`text.secondary`} sx={{ mb: 4 }}>
          {page.Tagline}
        </Typography>
      )}
      {pageContentHtml && (
        <div className={`cms-content`} dangerouslySetInnerHTML={{ __html: pageContentHtml }} />
      )}

      {/* Executive Leadership / Board of Directors */}
      {peopleListKey && people.length > 0 && (
        <Grid container spacing={3} sx={{ mt: 2 }}>
          {people.map((person) => (
            <Grid key={person.documentId} size={{ xs: 12, sm: 6, md: 4 }}>
              {isBoard
                ? <BoardMemberCard person={person} />
                : <ExecLeaderCard person={person} />
              }
            </Grid>
          ))}
        </Grid>
      )}

      {/* Our Providers — grouped by Service */}
      {isProviders && providerServices.map((service) => (
        <section key={service.documentId}>
          <Typography component={`h2`} variant={`h5`} sx={{ mt: 5, mb: 2 }}>
            {service.ProvidersPageLabel || service.DefaultLabel}
          </Typography>
          <Grid container spacing={3}>
            {service.People.map((person) => (
              <Grid key={person.documentId} size={{ xs: 12, sm: 6, md: 4 }}>
                <ExecLeaderCard person={person} />
              </Grid>
            ))}
          </Grid>
        </section>
      ))}

      {/* Testimonials */}
      {isTestimonials && testimonials.length > 0 && (
        <div style={{ marginTop: `2rem` }}>
          {testimonials.map((testimonial, i) => (
            <div key={testimonial.documentId} style={{ marginBottom: `2.5rem` }}>
              <div className={`cms-content`} dangerouslySetInnerHTML={{ __html: testimonialHtmls[i] }} />
              <Typography variant={`subtitle2`} color={`text.secondary`} sx={{ mt: 1 }}>
                — {testimonial.Author}
              </Typography>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
