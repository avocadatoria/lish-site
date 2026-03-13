'use client';

import { useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import Logo from './Logo';
import MobileDrawer from './MobileDrawer';
import styles from './Navbar.module.scss';

function NavSection({ section, services }) {
  const [hovered, setHovered] = useState(false);
  const [suppressed, setSuppressed] = useState(false);
  const suppressTimer = useRef(null);
  const isServices = section.URLSlug === `services`;

  const items = isServices
    ? services.map((s) => ({
        key: s.documentId,
        label: s.NavLabel || s.DefaultLabel,
        href: `/${section.URLSlug}/${s.URLSlug}`,
      }))
    : (section.Pages || []).filter((p) => !p.HideInNav).map((p) => ({
        key: p.documentId,
        label: p.NavbarLabel || p.title,
        href: `/${section.URLSlug}/${p.Slug}`,
      }));

  const showDropdown = hovered && !suppressed && items.length > 0;

  function handleClick() {
    setSuppressed(true);
    clearTimeout(suppressTimer.current);
  }

  const handleMouseEnter = useCallback(() => {
    setHovered(true);
    setSuppressed(false);
    clearTimeout(suppressTimer.current);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setHovered(false);
    setSuppressed(false);
    clearTimeout(suppressTimer.current);
  }, []);

  return (
    <div className={styles.section} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      <Link href={`/${section.URLSlug}`} className={styles.sectionLink} onClick={handleClick}>
        {section.NavbarLabel}
        {items.length > 0 && <span className={styles.arrow}>&#9662;</span>}
      </Link>
      {showDropdown && (
        <div className={styles.dropdown}>
          {items.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className={styles.dropdownItem}
              onClick={handleClick}
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Navbar({ sections = [], services = [] }) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      <AppBar
        position={`sticky`}
        elevation={0}
        sx={{
          bgcolor: `background.paper`,
          color: `text.primary`,
          borderBottom: `1px solid`,
          borderColor: `divider`,
        }}
      >
        <Toolbar sx={{ gap: 1 }}>
          {/* Mobile hamburger */}
          <IconButton
            aria-label={`Open navigation menu`}
            onClick={() => setDrawerOpen(true)}
            sx={{ display: { xs: `flex`, md: `none` }, mr: 1 }}
          >
            <MenuIcon />
          </IconButton>

          {/* Logo */}
          <Logo />

          {/* Desktop nav */}
          <nav className={styles.desktopNav}>
            {sections.map((section) => (
              <NavSection key={section.documentId} section={section} services={services} />
            ))}
          </nav>

          {/* Spacer */}
          <Box sx={{ flex: 1 }} />
        </Toolbar>
      </AppBar>

      {/* Mobile drawer */}
      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} sections={sections} services={services} />
    </>
  );
}
