import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import MyComponent from './MyComponent';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import axios from 'axios';

// Mock the API and Redux store
jest.mock('axios');
const mockStore = configureStore([]);

describe('MyComponent Tests', () => {
  let store;

  beforeEach(() => {
    store = mockStore({
      data: { items: [] },
      loading: false,
      error: null,
    });
  });

  // 1. Basic render tests
  test('renders a title', () => {
    render(
      <Provider store={store}>
        <MyComponent />
      </Provider>
    );
    expect(screen.getByText(/Hello World/i)).toBeInTheDocument();
  });

  test('renders a button', () => {
    render(
      <Provider store={store}>
        <MyComponent />
      </Provider>
    );
    expect(screen.getByRole('button', { name: /Fetch Data/i })).toBeInTheDocument();
  });

  // 2. API call tests
  test('calls API and displays data (async/await)', async () => {
    axios.get.mockResolvedValue({ data: { message: 'Hello from API' } });

    render(
      <Provider store={store}>
        <MyComponent />
      </Provider>
    );

    fireEvent.click(screen.getByRole('button', { name: /Fetch Data/i }));

    // Wait for API call to finish
    await waitFor(() => expect(screen.getByText(/Hello from API/i)).toBeInTheDocument());
  });

  test('calls API and handles failure (Promises)', async () => {
    axios.get.mockRejectedValue(new Error('API Error'));

    render(
      <Provider store={store}>
        <MyComponent />
      </Provider>
    );

    fireEvent.click(screen.getByRole('button', { name: /Fetch Data/i }));

    await waitFor(() =>
      expect(screen.getByText(/Failed to fetch data/i)).toBeInTheDocument()
    );
  });

  // 3. Redux functionality tests
  test('dispatches an action to fetch data', () => {
    store.dispatch = jest.fn();

    render(
      <Provider store={store}>
        <MyComponent />
      </Provider>
    );

    fireEvent.click(screen.getByRole('button', { name: /Fetch Data/i }));

    expect(store.dispatch).toHaveBeenCalledWith({
      type: 'FETCH_DATA_REQUEST',
    });
  });

  test('updates the UI based on Redux state', () => {
    store = mockStore({
      data: { items: [{ id: 1, name: 'Item 1' }] },
      loading: false,
      error: null,
    });

    render(
      <Provider store={store}>
        <MyComponent />
      </Provider>
    );

    expect(screen.getByText(/Item 1/i)).toBeInTheDocument();
  });

  test('shows loading state while fetching data', () => {
    store = mockStore({
      data: { items: [] },
      loading: true,
      error: null,
    });

    render(
      <Provider store={store}>
        <MyComponent />
      </Provider>
    );

    expect(screen.getByText(/Loading.../i)).toBeInTheDocument();
  });

  test('displays error state from Redux', () => {
    store = mockStore({
      data: { items: [] },
      loading: false,
      error: 'Failed to load data',
    });

    render(
      <Provider store={store}>
        <MyComponent />
      </Provider>
    );

    expect(screen.getByText(/Failed to load data/i)).toBeInTheDocument();
  });


});
