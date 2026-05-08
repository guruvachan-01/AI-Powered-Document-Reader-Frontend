import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Dashboard from './Dashboard';
import { documentAPI } from '../services/api';

jest.mock('../services/api');
jest.mock('react-hot-toast', () => ({ success: jest.fn(), error: jest.fn() }));
jest.mock('../context/AuthContext', () => ({
  useAuth: () => ({ user: { username: 'testuser', role: 'USER' }, logout: jest.fn() }),
}));

const mockDocs = [
  { id: 1, originalFilename: 'report.pdf', fileType: 'PDF', fileSize: 102400,
    summary: 'A financial report.', uploadedAt: new Date().toISOString(), messageCount: 3 },
  { id: 2, originalFilename: 'podcast.mp3', fileType: 'AUDIO', fileSize: 5000000,
    summary: null, uploadedAt: new Date().toISOString(), messageCount: 0 },
];

describe('Dashboard', () => {
  beforeEach(() => {
    documentAPI.getAll.mockResolvedValue({ data: mockDocs });
  });

  test('shows document cards after loading', async () => {
    render(<MemoryRouter><Dashboard /></MemoryRouter>);
    await waitFor(() => {
      expect(screen.getByText('report.pdf')).toBeInTheDocument();
      expect(screen.getByText('podcast.mp3')).toBeInTheDocument();
    });
  });

  test('shows stats counters', async () => {
    render(<MemoryRouter><Dashboard /></MemoryRouter>);
    await waitFor(() => {
      expect(screen.getByText('2')).toBeInTheDocument(); // total
    });
  });

  test('shows upload zone when Upload button clicked', async () => {
    render(<MemoryRouter><Dashboard /></MemoryRouter>);
    await waitFor(() => screen.getByText(/Upload File/i));
    fireEvent.click(screen.getByText(/Upload File/i));
    expect(screen.getByText(/Drag & drop/i)).toBeInTheDocument();
  });

  test('shows processing indicator for docs without summary', async () => {
    render(<MemoryRouter><Dashboard /></MemoryRouter>);
    await waitFor(() => {
      expect(screen.getByText(/Processing/i)).toBeInTheDocument();
    });
  });

  test('shows empty state when no documents', async () => {
    documentAPI.getAll.mockResolvedValue({ data: [] });
    render(<MemoryRouter><Dashboard /></MemoryRouter>);
    await waitFor(() => {
      expect(screen.getByText(/No documents yet/i)).toBeInTheDocument();
    });
  });
});
