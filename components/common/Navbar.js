'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import MenuIcon from '@mui/icons-material/Menu';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import Typography from '@mui/material/Typography';
import WrappedMUIButton from '../ui/WrappedMUIButton';
import WrappedMUIMenu from '../ui/WrappedMUIMenu';
import NotificationBell from '../features/NotificationBell';
import Logo from './Logo';
import MobileDrawer from './MobileDrawer';
import { useAuth } from '../../hooks/useAuth.js';
import { PUBLIC_SECTIONS, AUTH_SECTIONS } from './nav-data.js';

function NavSection({ section }) {
  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  // Direct link — no dropdown
  if (section.href) {
    return (
      <WrappedMUIButton
        color={`inherit`}
        onClick={() => router.push(section.href)}
        sx={{ fontWeight: 500 }}
      >
        {section.label}
      </WrappedMUIButton>
    );
  }

  // Dropdown section
  const menuItems = section.items.map((item) => ({
    label: item.label,
    onClick: () => router.push(item.href),
  }));

  return (
    <>
      <WrappedMUIButton
        color={`inherit`}
        onClick={(e) => setAnchorEl(e.currentTarget)}
        endIcon={<KeyboardArrowDownIcon />}
        sx={{ fontWeight: 500 }}
      >
        {section.label}
      </WrappedMUIButton>
      <WrappedMUIMenu
        anchorEl={anchorEl}
        open={open}
        onClose={() => setAnchorEl(null)}
        items={menuItems}
      />
    </>
  );
}

export default function Navbar() {
  const { user, loading, login, logout } = useAuth();
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [avatarAnchorEl, setAvatarAnchorEl] = useState(null);
  const avatarMenuOpen = Boolean(avatarAnchorEl);

  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(` `);
  const avatarMenuItems = [
    { header: (
      <>
        {fullName && <Typography variant="body2" fontWeight={600}>{fullName}</Typography>}
        <Typography variant="body2" color="text.secondary">{user?.email}</Typography>
      </>
    ) },
    { divider: true },
    { label: `Settings`, onClick: () => router.push(`/settings`) },
    { label: `Billing`, onClick: () => router.push(`/billing`) },
    { divider: true },
    ...(user?.isAdmin
      ? [{ label: `Admin`, onClick: () => router.push(`/admin`) }, { divider: true }]
      : []),
    { label: `Logout`, onClick: logout },
  ];

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

          {/* Desktop nav — public sections */}
          <Box sx={{ display: { xs: `none`, md: `flex` }, alignItems: `center`, ml: 2, gap: 0.5 }}>
            {PUBLIC_SECTIONS.map((section) => (
              <NavSection key={section.label} section={section} />
            ))}
          </Box>

          {/* Spacer */}
          <Box sx={{ flex: 1 }} />

          {/* Desktop nav — auth sections */}
          {user && (
            <Box sx={{ display: { xs: `none`, md: `flex` }, alignItems: `center`, gap: 0.5 }}>
              {AUTH_SECTIONS.map((section) => (
                <NavSection key={section.label} section={section} />
              ))}
            </Box>
          )}

          {/* Right side — always visible */}
          {!loading && (
            <Box sx={{ display: `flex`, alignItems: `center`, gap: 1, ml: 1 }}>
              {user ? (
                <>
                  <NotificationBell />
                  <IconButton
                    onClick={(e) => setAvatarAnchorEl(e.currentTarget)}
                    aria-label={`Account menu`}
                    sx={{ p: 0.5 }}
                  >
                    <Avatar
                      src={user.profileImage || undefined}
                      alt={user.firstName || `User`}
                      sx={{ width: 32, height: 32, bgcolor: `primary.main`, fontSize: `0.875rem` }}
                    >
                      {user.firstName?.[0]?.toUpperCase()}
                    </Avatar>
                  </IconButton>
                  <WrappedMUIMenu
                    anchorEl={avatarAnchorEl}
                    open={avatarMenuOpen}
                    onClose={() => setAvatarAnchorEl(null)}
                    items={avatarMenuItems}
                  />
                </>
              ) : (
                <WrappedMUIButton variant={`outlined`} color={`primary`} onClick={() => router.push(`/login`)}>
                  Sign in
                </WrappedMUIButton>
              )}
            </Box>
          )}
        </Toolbar>
      </AppBar>

      {/* Mobile drawer */}
      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} user={user} />
    </>
  );
}
