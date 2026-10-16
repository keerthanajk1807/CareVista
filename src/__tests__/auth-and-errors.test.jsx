import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import App from '../App';
import store from '../store/store';
import ErrorBoundary from '../Components/ErrorBoundary';
import api from '../api/api';
jest.mock('../api/api', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn()
  }
}));
beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  store.dispatch({
    type: 'session/clear'
  });
  jest.clearAllMocks();
  api.get.mockImplementation(async url => ({
    data: url === '/doctors' ? [] : {
      appointments: []
    }
  }));
  api.post.mockImplementation(async url => ({
    data: url === '/auth/login' ? {
      token: 'test-token',
      user: {
        id: 'test-patient',
        name: 'Patient',
        email: 'patient@example.com'
      },
      expiresAt: Date.now() + 3600000
    } : {}
  }));
});
afterEach(() => {
  cleanup();
  window.history.replaceState({}, '', '/');
});
test('protected route redirects and login returns to requested page', async () => {
  window.history.pushState({}, '', '/patient/profile');
  const user = userEvent.setup();
  render(<Provider store={store}><App /></Provider>);
  await screen.findByRole('heading', {
    name: 'Welcome Back!'
  });
  expect(window.location.pathname).toBe('/login');
  await user.type(screen.getByLabelText('Email Address'), 'patient@example.com');
  await user.type(screen.getByLabelText('Password'), 'test123');
  await user.click(screen.getByRole('button', {
    name: 'Login to Account'
  }));
  await screen.findByRole('heading', {
    name: 'Patient Profile'
  });
  expect(window.location.pathname).toBe('/patient/profile');
  await user.click(screen.getByRole('button', {
    name: 'Logout'
  }));
  await screen.findByRole('heading', {
    name: 'Welcome Back!'
  });
  expect(localStorage.getItem('medislotToken')).toBeNull();
});
test('login rejects short password before sending request', async () => {
  window.history.replaceState({}, '', '/login');
  const user = userEvent.setup();
  render(<Provider store={store}><App /></Provider>);
  await user.type(screen.getByLabelText('Email Address'), 'patient@example.com');
  await user.type(screen.getByLabelText('Password'), '123');
  await user.click(screen.getByRole('button', {
    name: 'Login to Account'
  }));
  expect(await screen.findByText('Password must contain at least 6 characters.')).toBeInTheDocument();
  expect(api.post).not.toHaveBeenCalled();
});
test('ErrorBoundary catches rendering failure', () => {
  const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
  function Broken() {
    throw Error('Simulated render failure');
  }
  try {
    render(<ErrorBoundary><Broken /></ErrorBoundary>);
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  } finally {
    spy.mockRestore();
  }
});
test('invalid Patient ID is rejected before calling API', async () => {
  window.history.replaceState({}, '', '/login');
  const user = userEvent.setup();
  render(<Provider store={store}><App /></Provider>);
  await user.type(screen.getByLabelText('Patient ID (optional)'), 'PAT-invalid');
  await user.type(screen.getByLabelText('Password'), 'test123');
  await user.click(screen.getByRole('button', {
    name: 'Login to Account'
  }));
  expect(await screen.findByText(/Enter a valid Patient ID/)).toBeInTheDocument();
  expect(api.post).not.toHaveBeenCalled();
});
