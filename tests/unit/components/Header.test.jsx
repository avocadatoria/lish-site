import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Navbar from '../../../components/common/Navbar.js';

// Mock next/navigation
vi.mock(`next/navigation`, () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

describe(`Navbar`, () => {
  it(`renders the logo link`, () => {
    render(<Navbar />);
    expect(screen.getByLabelText(`Home`)).toBeInTheDocument();
  });

  it(`shows public nav sections`, () => {
    render(<Navbar />);
    expect(screen.getByText(`Company`)).toBeInTheDocument();
  });
});
