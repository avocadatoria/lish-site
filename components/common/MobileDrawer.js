'use client';

import { useState } from 'react';
import Link from 'next/link';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Collapse from '@mui/material/Collapse';
import Divider from '@mui/material/Divider';
import Box from '@mui/material/Box';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import WrappedMUIDrawer from '../ui/WrappedMUIDrawer';
import Logo from './Logo';

export default function MobileDrawer({ open, onClose, sections = [], services = [] }) {
  const [expanded, setExpanded] = useState({});

  function toggleSection(label) {
    setExpanded((prev) => ({ ...prev, [label]: !prev[label] }));
  }

  function getItems(section) {
    if (section.URLSlug === `services`) {
      return services.map((s) => ({
        key: s.documentId,
        label: s.NavLabel || s.DefaultLabel,
        href: `/${section.URLSlug}/${s.URLSlug}`,
      }));
    }
    return (section.Pages || []).filter((p) => !p.HideInNav).map((p) => ({
      key: p.documentId,
      label: p.NavbarLabel || p.title,
      href: `/${section.URLSlug}/${p.Slug}`,
    }));
  }

  return (
    <WrappedMUIDrawer open={open} onClose={onClose} anchor={`left`} width={280}>
      <Box sx={{ p: 2 }}>
        <Logo />
      </Box>
      <Divider />
      <List>
        {sections.map((section) => {
          const items = getItems(section);
          const isOpen = expanded[section.NavbarLabel] || false;
          return (
            <div key={section.documentId}>
              <ListItemButton onClick={() => toggleSection(section.NavbarLabel)}>
                <ListItemText primary={section.NavbarLabel} primaryTypographyProps={{ fontWeight: 600 }} />
                {items.length > 0 && (isOpen ? <ExpandLess /> : <ExpandMore />)}
              </ListItemButton>
              {items.length > 0 && (
                <Collapse in={isOpen} timeout={0} unmountOnExit>
                  <List disablePadding>
                    {items.map((item) => (
                      <ListItemButton
                        key={item.key}
                        component={Link}
                        href={item.href}
                        onClick={onClose}
                        sx={{ pl: 4 }}
                      >
                        <ListItemText primary={item.label} />
                      </ListItemButton>
                    ))}
                  </List>
                </Collapse>
              )}
            </div>
          );
        })}
      </List>
    </WrappedMUIDrawer>
  );
}
