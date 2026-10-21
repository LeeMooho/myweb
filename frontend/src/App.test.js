import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App, { persiststore } from './App';

jest.mock('axios', () => ({}));
jest.mock('./i18n', () => ({ t: key => key }));
jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: key => key, i18n: { language: 'en', changeLanguage: jest.fn() } })
}));

test('renders the home route with navigation after restoring state', async () => {
  render(<MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}><App /></MemoryRouter>);
  expect(await screen.findByRole('heading', { name: 'home.mainWelcom' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'header.board' })).toBeInTheDocument();
  persiststore.pause();
});
