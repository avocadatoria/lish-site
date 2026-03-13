import { notFound } from 'next/navigation';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import { getSectionBySlug, getPageBySlug, getPageWithPeople, getProvidersPageServices, getServiceBySlug } from '../../../lib/server-api.js';
import { stripSpans } from '../../../lib/sanitize-html.js';
import { BoardMemberCard, ExecLeaderCard } from '../../../components/common/PersonCard.js';

const PEOPLE_PAGES = new Set([`executive-leadership`, `board-of-directors`]);

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

export default async function SectionSubPage({ params }) {
  const { sectionSlug, pageSlug } = await params;

  const isServicePage = sectionSlug === `services`;
  const isProviders = pageSlug === `our-providers`;
  const hasPeople = PEOPLE_PAGES.has(pageSlug);

  // ── Service detail page (/services/allergy, etc.) ──
  if (isServicePage) {
    const service = await getServiceBySlug(pageSlug);
    if (!service || !service.CreatePage) notFound();

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
        {service.ServicePageContent && (
          <div className={`cms-content`} dangerouslySetInnerHTML={{ __html: stripSpans(service.ServicePageContent) }} />
        )}
      </>
    );
  }

  // ── Regular section subpages ──
  const [section, page, services] = await Promise.all([
    getSectionBySlug(sectionSlug),
    hasPeople ? getPageWithPeople(pageSlug) : getPageBySlug(pageSlug),
    isProviders ? getProvidersPageServices() : null,
  ]);

  if (!section || !page) notFound();

  const people = page.People || [];
  const isBoard = pageSlug === `board-of-directors`;
  const providerServices = services || [];

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
      {page.Content && (
        <div className={`cms-content`} dangerouslySetInnerHTML={{ __html: stripSpans(page.Content) }} />
      )}

      {/* Executive Leadership / Board of Directors */}
      {hasPeople && people.length > 0 && (
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
    </>
  );
}
