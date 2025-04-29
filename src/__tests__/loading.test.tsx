import react from 'react';
import { render } from '@testing-library/react';
import Loading from '../app/products/loading';



describe('Loading component', () => {
  it('renders null', () => {
    const { container } = render(<Loading />);
    expect(container.firstChild).toBeNull();
  });
});
