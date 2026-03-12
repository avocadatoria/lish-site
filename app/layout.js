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

export default function RootLayout({ children }) {
  return (
    <html lang={`en`} className={`${instrumentSerif.variable} ${inter.variable}`}>
      <body>
        <TermlyCMP websiteUUID={`3ee1798b-9718-4632-b70f-973c9cf1d0e2`} autoBlock />
        <Providers>
          <Navbar />
          <main style={{margin: `20px 10%`}}>{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
