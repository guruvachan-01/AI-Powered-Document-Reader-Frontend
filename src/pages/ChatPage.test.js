import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { chatAPI, documentAPI } from '../../services/api';
import ChatPage from './ChatPage';

// Mock APIs
jest.mock('../../services/api');
jest.mock('react-hot-toast', () => ({ error: jest.fn(), success: jest.fn() }));
jest.mock('../../context/AuthContext', () => ({
  useAuth: () => ({ user: { username: 'testuser' } }),
}));

const mockDocument = {
  id: 1,
  originalFilename: 'test.pdf',
  fileType: 'PDF',
  filename: 'uuid_test.pdf',
  summary: 'A test document.',
};

const renderChat = () =>
  render(
    <MemoryRouter initialEntries={['/chat/1']}>
      <Routes>
        <Route path="/chat/:documentId" element={<ChatPage />} />
      </Routes>
    </MemoryRouter>
  );

describe('ChatPage', () => {
  beforeEach(() => {
    documentAPI.getById.mockResolvedValue({ data: mockDocument });
    chatAPI.getHistory.mockResolvedValue({ data: [] });
    documentAPI.getFileUrl.mockReturnValue('http://localhost/files/uuid_test.pdf');
  });

  test('renders chat interface after loading', async () => {
    renderChat();
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/ask a question/i)).toBeInTheDocument();
    });
  });

  test('shows document filename in header', async () => {
    renderChat();
    await waitFor(() => {
      expect(screen.getByText('test.pdf')).toBeInTheDocument();
    });
  });

  test('sends message and shows AI response', async () => {
    chatAPI.sendMessage.mockResolvedValue({
      data: { answer: 'This is the AI answer.', messageId: 1 },
    });

    renderChat();
    await waitFor(() => screen.getByPlaceholderText(/ask a question/i));

    const input = screen.getByPlaceholderText(/ask a question/i);
    fireEvent.change(input, { target: { value: 'What is this about?' } });
    fireEvent.submit(input.closest('form'));

    await waitFor(() => {
      expect(screen.getByText('This is the AI answer.')).toBeInTheDocument();
    });
  });

  test('shows suggestion chips when no messages', async () => {
    renderChat();
    await waitFor(() => {
      expect(screen.getByText(/Summarize the main points/i)).toBeInTheDocument();
    });
  });

  test('clicking suggestion fills input', async () => {
    renderChat();
    await waitFor(() => screen.getByText(/Summarize the main points/i));

    fireEvent.click(screen.getByText(/Summarize the main points/i));
    expect(screen.getByPlaceholderText(/ask a question/i).value)
      .toBe('Summarize the main points');
  });
});
