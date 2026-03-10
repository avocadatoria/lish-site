'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
import { PUBLIC_SECTIONS, AUTH_SECTIONS } from './nav-data.js';

export default function MobileDrawer({ open, onClose, user }) {
  const router = useRouter();
  const [expanded, setExpanded] = useState({});

  function toggleSection(label) {
    setExpanded((prev) => ({ ...prev, [label]: !prev[label] }));
  }

  function navigate(href) {
    router.push(href);
    onClose();
  }

  function renderSections(sections) {
    return sections.map((section) => {
      // Direct link (no sub-items)
      if (section.href) {
        return (
          <ListItemButton key={section.label} onClick={() => navigate(section.href)}>
            <ListItemText primary={section.label} />
          </ListItemButton>
        );
      }

      // Collapsible section
      const isOpen = expanded[section.label] || false;
      return (
        <div key={section.label}>
          <ListItemButton onClick={() => toggleSection(section.label)}>
            <ListItemText primary={section.label} primaryTypographyProps={{ fontWeight: 600 }} />
            {isOpen ? <ExpandLess /> : <ExpandMore />}
          </ListItemButton>
          <Collapse in={isOpen} timeout={0} unmountOnExit>
            <List disablePadding>
              {section.items.map((item) => (
                <ListItemButton key={item.href} sx={{ pl: 4 }} onClick={() => navigate(item.href)}>
                  <ListItemText primary={item.label} />
                </ListItemButton>
              ))}
            </List>
          </Collapse>
        </div>
      );
    });
  }

  return (
    <WrappedMUIDrawer open={open} onClose={onClose} anchor={`left`} width={280}>
      <Box sx={{ p: 2 }}>
        <Logo />
      </Box>
      <Divider />
      <List>
        {renderSections(PUBLIC_SECTIONS)}
      </List>
      {user && (
        <>
          <Divider />
          <List>
            {renderSections(AUTH_SECTIONS)}
          </List>
        </>
      )}
    </WrappedMUIDrawer>
  );
}
