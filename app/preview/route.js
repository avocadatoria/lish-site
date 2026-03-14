import { createHmac } from 'node:crypto';
import { redirect } from 'next/navigation';

function generatePreviewToken(url) {
  return createHmac(`sha256`, process.env.PREVIEW_SECRET).update(url).digest(`hex`);
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get(`secret`);
  const url = searchParams.get(`url`);
  const status = searchParams.get(`status`);

  if (secret !== process.env.PREVIEW_SECRET) {
    return new Response(`Invalid token`, { status: 401 });
  }

  if (!url) {
    return new Response(`Missing url parameter`, { status: 400 });
  }

  if (status === `draft`) {
    const token = generatePreviewToken(url);
    redirect(`${url}?status=draft&preview_token=${token}`);
  } else {
    redirect(url);
  }
}
