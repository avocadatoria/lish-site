'use client';

import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import WrappedMUIAccordion from '../ui/WrappedMUIAccordion';


function getNameParts(person) {
  const parts = [];
  if (person.NamePrefix) parts.push(person.NamePrefix);
  if (person.FirstAndMiddleName) parts.push(person.FirstAndMiddleName);
  if (person.LastName) parts.push(person.LastName);
  const nameLine = parts.join(` `);

  return {
    nameLine,
    suffix: person.NameSuffix || null,
    title: person.Title || null,
  };
}

/**
 * Board of Directors card.
 * Photo, then single line:
 *   NamePrefix FirstMiddle Last, Suffix, Title (italic)
 */
export function BoardMemberCard({ person }) {
  const { nameLine, suffix, title } = getNameParts(person);
  const photoUrl = person.Photo?.url;
  const altText = person.Photo?.alternativeText || nameLine;

  const displayParts = [nameLine];
  if (suffix) displayParts.push(suffix);

  return (
    <Card sx={{ height: `100%` }}>
      {photoUrl && (
        <CardMedia
          component={`img`}
          src={photoUrl}
          alt={altText}
          sx={{ objectFit: `cover`, aspectRatio: `3/4` }}
        />
      )}
      <CardContent>
        <Typography variant={`body1`} sx={{ fontWeight: 600 }}>
          {displayParts.join(`, `)}
          {title && (
            <>
              {displayParts.length > 0 && `, `}
              <em>{title}</em>
            </>
          )}
        </Typography>
      </CardContent>
    </Card>
  );
}

/**
 * Executive Leadership card.
 * Photo, then:
 *   Line 1: NamePrefix FirstMiddle Last, Suffix
 *   Line 2: Title (not italic)
 *   "Learn More" accordion with Bio (or "Bio coming soon")
 */
export function ExecLeaderCard({ person }) {
  const { nameLine, suffix, title } = getNameParts(person);
  const photoUrl = person.Photo?.url;
  const altText = person.Photo?.alternativeText || nameLine;

  const nameDisplay = suffix ? `${nameLine}, ${suffix}` : nameLine;

  const bioHtml = person.Bio || `<p>Bio coming soon.</p>`;

  return (
    <Card sx={{ height: `100%` }}>
      {photoUrl && (
        <CardMedia
          component={`img`}
          src={photoUrl}
          alt={altText}
          sx={{ objectFit: `cover`, aspectRatio: `3/4` }}
        />
      )}
      <CardContent>
        <Typography variant={`body1`} sx={{ fontWeight: 600 }}>
          {nameDisplay}
        </Typography>
        {title && (
          <Typography variant={`body2`} color={`text.secondary`}>
            {title}
          </Typography>
        )}
        <WrappedMUIAccordion
          items={[{
            title: `Learn More`,
            content: <div className={`cms-content`} style={{ fontSize: `0.85rem` }} dangerouslySetInnerHTML={{ __html: bioHtml }} />,
          }]}
        />
      </CardContent>
    </Card>
  );
}
