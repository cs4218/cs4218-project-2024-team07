import { render, screen } from '@testing-library/react';
import React from 'react';
import { CartProvider, useCart } from './cart'; 

const MockComponent = () => {
    const [cart, setCart] = useCart(); 
    return (
        <>
            {cart.length > 0 ? (
                cart.map((item) => <div key={item._id}>{item.name}</div>)
            ) : (
                <div>No items in cart</div>
            )}
        </>
    );
};

describe('Testing setCart with useCart', () => {
    afterEach(() => {
        jest.clearAllMocks(); 
    });

    it('should render updated cart when localStorage contains cart data', () => {
        const cartValues = [{
            "name": "ItemOne",
            "slug": "ItemOne",
            "description": "Item for useCart Testing",
            "price": 1,
            "category": "66dec444d4604ff6d3365886",
            "quantity": 1,
        }];
        
        Storage.prototype.getItem = jest.fn(() => JSON.stringify(cartValues));

        render(
            <CartProvider>
                <MockComponent />
            </CartProvider>
        );
        expect(screen.getByText('ItemOne')).toBeInTheDocument();
    });

    it('should render empty cart when localStorage is empty', () => {
        Storage.prototype.getItem = jest.fn(() => null);

        render(
            <CartProvider>
                <MockComponent />
            </CartProvider>
        );

        expect(screen.getByText('No items in cart')).toBeInTheDocument();
    });
});




