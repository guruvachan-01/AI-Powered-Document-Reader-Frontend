import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import UploadZone from './UploadZone';
import { documentAPI } from '../../services/api';
import toast from 'react-hot-toast';

jest.mock('../../services/api');
jest.mock('react-hot-toast', () => ({ success: jest.fn(), error: jest.fn() }));

describe('UploadZone', () => {
  test('renders drop area', () => {
    render(<UploadZone />);
    expect(screen.getByText(/Drag & drop/i)).toBeInTheDocument();
  });

  test('shows file info after file is selected', async () => {
    render(<UploadZone />);
    const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });
    const input = document.querySelector('input[type="file"]');
    fireEvent.change(input, { target: { files: [file] } });
    await waitFor(() => expect(screen.getByText('test.pdf')).toBeInTheDocument());
  });

  test('shows upload and remove buttons after file selected', async () => {
    render(<UploadZone />);
    const file = new File(['content'], 'doc.pdf', { type: 'application/pdf' });
    const input = document.querySelector('input[type="file"]');
    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText(/Upload File/i)).toBeInTheDocument();
      expect(screen.getByText(/Remove/i)).toBeInTheDocument();
    });
  });

  test('clears file when Remove is clicked', async () => {
    render(<UploadZone />);
    const file = new File(['content'], 'doc.pdf', { type: 'application/pdf' });
    const input = document.querySelector('input[type="file"]');
    fireEvent.change(input, { target: { files: [file] } });
    await waitFor(() => screen.getByText(/Remove/i));
    fireEvent.click(screen.getByText(/Remove/i));
    await waitFor(() => expect(screen.getByText(/Drag & drop/i)).toBeInTheDocument());
  });

  test('calls onUploaded callback after successful upload', async () => {
    const onUploaded = jest.fn();
    documentAPI.upload.mockResolvedValue({ data: { id: 1, originalFilename: 'doc.pdf' } });

    render(<UploadZone onUploaded={onUploaded} />);
    const file = new File(['content'], 'doc.pdf', { type: 'application/pdf' });
    const input = document.querySelector('input[type="file"]');
    fireEvent.change(input, { target: { files: [file] } });
    await waitFor(() => screen.getByText(/Upload File/i));
    fireEvent.click(screen.getByText(/Upload File/i));

    await waitFor(() => expect(onUploaded).toHaveBeenCalledWith({ id: 1, originalFilename: 'doc.pdf' }));
  });
});
