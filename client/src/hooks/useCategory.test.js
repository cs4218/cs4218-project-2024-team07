import { render, screen, waitFor } from '@testing-library/react';
import axios from 'axios';
import React from 'react';
import useCategory from './useCategory'; 
import slugify from 'slugify';

jest.mock('axios');

const TestComponent = () => {
  const categories = useCategory();

  return (
    <div>
      {categories.length > 0 ? (
        categories.map((category) => (
          <div key={category.slug}>{category.name}</div>
        ))
      ) : (
        <div>No categories</div>
      )}
    </div>
  );
};

beforeEach(() => {
    jest.clearAllMocks();
});

describe('useCategory test', () => {
    it('should fetch and set categories on mount', async () => {
        const mockCategories = [
            { name: 'Electronics', slug: slugify('Electronics') }, 
            { name: 'Books', slug: slugify('Books') }
        ];
        axios.get.mockResolvedValue({ data: { category: mockCategories } });
        render(<TestComponent />);

        expect(axios.get).toHaveBeenCalledWith('/api/v1/category/get-category');
        await waitFor(() => {
            expect(screen.getByText('Electronics')).toBeInTheDocument();
        });
        
        await waitFor(() => {
            expect(screen.getByText('Books')).toBeInTheDocument();
        });
        
    });

    it('should handle errors gracefully', async () => {
        axios.get.mockRejectedValue(new Error('Failed to fetch categories'));
        render(<TestComponent />);

        expect(axios.get).toHaveBeenCalledWith('/api/v1/category/get-category');
        expect(screen.getByText('No categories')).toBeInTheDocument();
    });
});

