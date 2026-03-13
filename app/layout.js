import { instrumentSerif, inter } from './fonts';
import './globals.scss';
import { Providers } from './providers';
import TermlyCMP from '../components/common/TermlyCMP';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';

export const metadata = {
  title: `LISH`,
  description: `LISH webapp`,
  icons: { icon: `/favicon.ico` },
};

async function getNavSections() {
  try {
    const res = await fetch(`${process.env.API_URL}/api/strapi/single/main-navigation?populate%5BSections%5D%5Bpopulate%5D=Pages`, {
      next: { revalidate: Number(process.env.SSR_REVALIDATE_SECS) },
    });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data?.Sections || [];
  } catch {
    return [];
  }
}

async function getNavServices() {
  try {
    const res = await fetch(`${process.env.API_URL}/api/strapi/single/main-navigation?populate=Services`, {
      next: { revalidate: Number(process.env.SSR_REVALIDATE_SECS) },
    });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data?.Services || [];
  } catch {
    return [];
  }
}

export default async function RootLayout({ children }) {
  const [sections, services] = await Promise.all([getNavSections(), getNavServices()]);

  return (
    <html lang={`en`} className={`${instrumentSerif.variable} ${inter.variable}`}>
      <body>
        <TermlyCMP websiteUUID={`3ee1798b-9718-4632-b70f-973c9cf1d0e2`} autoBlock />
        <Providers>
          <Navbar sections={sections} services={services} />
          <main style={{margin: `20px 10%`}}>{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
