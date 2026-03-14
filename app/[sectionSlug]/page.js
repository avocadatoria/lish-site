import { notFound } from 'next/navigation';
import Link from 'next/link';
import Typography from '@mui/material/Typography';
import { getSectionBySlug, getServicesListByKey } from '../../lib/server-api.js';
import { verifyPreviewToken } from '../../lib/preview.js';

export async function generateMetadata({ params }) {
  const { sectionSlug } = await params;
  const section = await getSectionBySlug(sectionSlug);
  if (!section) return {};

  const rootPage = (section.Pages || []).find((p) => p.IsSectionRoot);
  const title = rootPage?.SEOTitleOverride || section.HeaderLabel;
  const description = rootPage?.SEODescription || undefined;
  const canonical = `${process.env.APP_URL}/${sectionSlug}`;

  return {
    title,
    ...(description && { description }),
    alternates: { canonical },
  };
}

export default async function SectionHomePage({ params, searchParams }) {
  const { sectionSlug } = await params;
  const query = await searchParams;
  const pathname = `/${sectionSlug}`;
  const draft = query.status === `draft` && verifyPreviewToken(pathname, query.preview_token);
  const fetchOpts = draft ? { draft: true } : {};

  const isServices = sectionSlug === `services`;
  const isContact = sectionSlug === `contact-us`;

  const [section, navServices] = await Promise.all([
    getSectionBySlug(sectionSlug, fetchOpts),
    isServices ? getServicesListByKey(`ServicesNavMenu`, fetchOpts) : null,
  ]);

  if (!section) notFound();

  const rootPage = (section.Pages || []).find((p) => p.IsSectionRoot);
  if (!rootPage) notFound();

  const contentHtml = rootPage.Content || null;

  const childLinks = isContact
    ? []
    : isServices
      ? (navServices || []).map((s) => ({
          key: s.documentId,
          label: s.NavLabel || s.DefaultLabel,
          href: `/${sectionSlug}/${s.URLSlug}`,
        }))
      : (section.Pages || [])
          .filter((p) => !p.IsSectionRoot && !p.HideInNav)
          .map((p) => ({
            key: p.documentId,
            label: p.NavbarLabel || p.title,
            href: `/${sectionSlug}/${p.Slug}`,
          }));

  return (
    <>
      <Typography component={`h1`} variant={`h3`} gutterBottom>
        {section.HeaderLabel}
      </Typography>
      {rootPage.Tagline && (
        <Typography variant={`subtitle1`} color={`text.secondary`} sx={{ mb: 4 }}>
          {rootPage.Tagline}
        </Typography>
      )}
      {contentHtml && (
        <div className={`cms-content`} dangerouslySetInnerHTML={{ __html: contentHtml }} />
      )}
      {childLinks.length > 0 && (
        <ul style={{ marginTop: `2rem` }}>
          {childLinks.map((link) => (
            <li key={link.key}>
              <Link href={link.href}>{link.label}</Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
