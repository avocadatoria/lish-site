import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Navbar from '../../../components/common/Navbar.js';

// Mock next/navigation
vi.mock(`next/navigation`, () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

// Mock useAuth to return a fake user
vi.mock(`../../../hooks/useAuth.js`, () => ({
  useAuth: () => ({
    user: {
      id: `00000000-0000-0000-0000-000000000001`,
      email: `test@example.com`,
      firstName: `Test`,
      lastName: `User`,
      isAdmin: false,
      profileImage: null,
    },
    loading: false,
    login: vi.fn(),
    logout: vi.fn(),
  }),
}));

// Mock useNotifications for NotificationBell
vi.mock(`../../../hooks/useNotifications.js`, () => ({
  useNotifications: () => ({
    notifications: [],
    unreadCount: 0,
    loading: false,
    markAsRead: vi.fn(),
    markAllRead: vi.fn(),
    refresh: vi.fn(),
  }),
}));

describe(`Navbar`, () => {
  it(`renders the logo link`, () => {
    render(<Navbar />);
    expect(screen.getByLabelText(`Home`)).toBeInTheDocument();
  });

  it(`shows nav section buttons for authenticated users`, () => {
    render(<Navbar />);
    expect(screen.getByText(`Dashboard`)).toBeInTheDocument();
    expect(screen.getByText(`Workspace`)).toBeInTheDocument();
    expect(screen.getByText(`Tools`)).toBeInTheDocument();
  });

  it(`shows the user avatar`, () => {
    render(<Navbar />);
    expect(screen.getByLabelText(`Account menu`)).toBeInTheDocument();
  });
});
