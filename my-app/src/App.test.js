import { render, screen } from '@testing-library/react';
import App from './App';

test('renders DevSpace workspace', () => {
  render(<App />);
  expect(screen.getByText(/DevSpace/i)).toBeInTheDocument();
});
