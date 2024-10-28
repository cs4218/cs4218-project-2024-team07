import { test, expect } from '@playwright/test';

const baseURL = 'http://localhost:3000'; 

test('search when no product is found', async ({ page }) => {
  await page.goto(baseURL, {waitUntil: "domcontentloaded"});
  await expect(page.getByPlaceholder('Search')).toBeEmpty();
  await expect(page.getByRole('img', { name: 'bannerimage' })).toBeVisible();
  await page.getByPlaceholder('Search').click();
  await page.getByPlaceholder('Search').fill('nothing here');
  await page.getByRole('button', { name: 'Search' }).click();
  await expect(page.getByRole('heading', { name: 'Search Resuts' })).toBeVisible();
  await page.getByRole('heading', { name: 'No Products Found' }).click();
});

test('search when product is found', async ({ page }) => {

  await page.goto(baseURL, {waitUntil: "domcontentloaded"});
  await page.getByPlaceholder('Search').click();
  await page.getByPlaceholder('Search').fill('Testing');
  await page.getByRole('button', { name: 'Search' }).click();

  await expect(page.getByRole('heading', { name: 'Testing', exact: true })).toBeVisible();
  await expect(page.getByText('Testing1...')).toBeVisible();
  await expect(page.getByText('$').first()).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Search Resuts' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Found' })).toBeVisible();
  
});


test.fail('available product to check product details', async ({ page }) => {

    await page.goto(baseURL, {waitUntil: "domcontentloaded"});
    await page.getByPlaceholder('Search').click();
    await page.getByPlaceholder('Search').fill('Testing');
    await page.getByRole('button', { name: 'Search' }).click();
  
    await expect(page.getByRole('heading', { name: 'Testing', exact: true })).toBeVisible();
    await expect(page.getByText('Testing1...')).toBeVisible();
    await expect(page.getByText('$').first()).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Search Resuts' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Found' })).toBeVisible();
  
    // This line doesn't work
    await page.getByRole('button', { name: 'More Details' }).first().click();
    const productDetailsHeader = page.locator('h1.text-center');
    await expect(productDetailsHeader).toHaveText('Product Details');

    // Verify that the product name is displayed
    const productName = page.locator('h6', { hasText: /^Name :/ });
    await expect(productName).toBeVisible();

    // Verify that the product description is displayed
    const productDescription = page.locator('h6', { hasText: /^Description :/ });
    await expect(productDescription).toBeVisible();

    // Verify that the product price is displayed
    const productPrice = page.locator('h6', { hasText: /^Price :/ });
    await expect(productPrice).toBeVisible();

    // Verify that the product category is displayed
    const productCategory = page.locator('h6', { hasText: /^Category :/ });
    await expect(productCategory).toBeVisible();

    // Verify that the "Add to Cart" button is present and visible
    const addToCartButton = page.locator('button', { hasText: 'ADD TO CART' });
    await expect(addToCartButton).toBeVisible();
    
  });


test.fail('available product to check ADD TO CART', async ({ page }) => {

    await page.goto(baseURL, {waitUntil: "domcontentloaded"});
    await page.getByPlaceholder('Search').click();
    await page.getByPlaceholder('Search').fill('Testing');
    await page.getByRole('button', { name: 'Search' }).click();
  
    await expect(page.getByRole('heading', { name: 'Testing', exact: true })).toBeVisible();
    await expect(page.getByText('Testing1...')).toBeVisible();
    await expect(page.getByText('$').first()).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Search Resuts' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Found' })).toBeVisible();

    // This line doesn't work
    await page.getByRole('button', { name: 'ADD TO CART' }).click();
    await page.locator('div:nth-child(6) > .card-body > div:nth-child(3) > button:nth-child(2)').click();
    await page.getByRole('link', { name: 'Cart' }).click();
    await expect(page.getByText('Testing 1')).toBeVisible();
    await expect(page.getByText('Testing', { exact: true })).toBeVisible();
    await expect(page.getByText('Price :')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Hello Guest You Have 1 items' })).toBeVisible();
    await expect(page.getByText('You Have 1 items in your cart')).toBeVisible();
});