import { notFound } from 'next/navigation';
import Typography from '@mui/material/Typography';
import { getSectionBySlug } from '../../lib/server-api.js';


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

export default async function SectionHomePage({ params }) {
  const { sectionSlug } = await params;
  const section = await getSectionBySlug(sectionSlug);
  if (!section) notFound();

  const rootPage = (section.Pages || []).find((p) => p.IsSectionRoot);
  if (!rootPage) notFound();

  const contentHtml = rootPage.Content || null;

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
    </>
  );
}
