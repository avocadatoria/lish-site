import Link from 'next/link';

export default function Logo() {
  return (
    <Link href={`/`} aria-label={`Home`} style={{ display: `flex`, alignItems: `center` }}>
      <img src={`/images/header.png`} alt={`Prendox`} style={{ height: `32px`, width: `auto` }} />
    </Link>
  );
}
