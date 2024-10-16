// tests/header.spec.js
const { test, expect } = require('@playwright/test');

test.describe('Header Component Tests', () => {
  test.beforeEach(async ({ page }) => {

    await page.goto('http://localhost:3000/');


    await page.evaluate(() => localStorage.clear());
  });

  test('should display the logo and navigation links', async ({ page }) => {

    await expect(page.locator('text=🛒 Virtual Vault')).toBeVisible();


    const navLinks = ['Home', 'Categories', 'Cart'];
    for (const linkText of navLinks) {
      await expect(page.locator(`nav >> text="${linkText}"`)).toBeVisible();
    }
  });

  test('should display categories in the dropdown', async ({ page }) => {
    // Click on the 'Categories' dropdown toggle
    await page.click('a.nav-link.dropdown-toggle');
  
    // Ensure the dropdown menu is open (with the 'show' class)
    const categoriesDropdown = page.locator('ul.dropdown-menu.show');
    await categoriesDropdown.waitFor({ state: 'visible', timeout: 10000 }); 
  
    // Verify that the 'All Categories' item is visible
    await expect(categoriesDropdown.locator('a.dropdown-item')).toHaveText('All Categories');
  
    // Optionally: you can also check that the link for the 'All Categories' is correct
    await expect(categoriesDropdown.locator('a.dropdown-item')).toHaveAttribute('href', '/categories');
  });
  
  
  
  
  test('should navigate to the Cart page when Cart link is clicked', async ({ page }) => {
    // Click on the 'Cart' link
    await page.click('nav >> text="Cart"');

    // Verify the URL has changed to the Cart page
    await expect(page).toHaveURL(/\/cart$/);

    // Optionally, verify content on the Cart page
    // await expect(page.locator('h1')).toContainText('Your Cart');
  });

  test('should show Login and Register when user is not authenticated', async ({ page }) => {
    // Ensure user is logged out
    await page.evaluate(() => localStorage.clear());

    // Refresh the page to apply changes
    await page.reload();

    // Verify 'Login' and 'Register' links are visible
    await expect(page.locator('nav >> text="Login"')).toBeVisible();
    await expect(page.locator('nav >> text="Register"')).toBeVisible();
  });

  test('should display user dropdown when authenticated', async ({ page }) => {
    // Simulate user authentication
    await page.evaluate(() => {
      localStorage.setItem(
        'auth',
        JSON.stringify({
          user: { name: 'Test User', role: 0 },
          token: 'fake-jwt-token',
        })
      );
    });

    // Refresh the page to apply authentication state
    await page.reload();

    // Verify user's name is displayed
    await expect(page.locator('nav >> text="Test User"')).toBeVisible();

    // Click on the user dropdown
    await page.click('nav >> text="Test User"');

    // Wait for the user dropdown menu to appear
    const userDropdown = page.locator('.nav-item.dropdown', { hasText: 'Test User' }).locator('.dropdown-menu');
    await userDropdown.waitFor({ state: 'visible' });

    // Verify 'Dashboard' and 'Logout' options are present
    await expect(userDropdown.locator('text="Dashboard"')).toBeVisible();
    await expect(userDropdown.locator('text="Logout"')).toBeVisible();
  });

  test('should logout the user when Logout is clicked', async ({ page }) => {
    // Ensure the user is authenticated first
    await page.evaluate(() => {
      localStorage.setItem(
        'auth',
        JSON.stringify({
          user: { name: 'Test User', role: 0 },
          token: 'fake-jwt-token',
        })
      );
    });
    await page.reload();

    // Click on the user dropdown and then 'Logout'
    await page.click('nav >> text="Test User"');
    await page.click('.dropdown-menu >> text="Logout"');

    // Verify user is redirected to the login page
    await expect(page).toHaveURL(/\/login$/);

    // Verify 'Login' and 'Register' links are visible again
    await expect(page.locator('nav >> text="Login"')).toBeVisible();
    await expect(page.locator('nav >> text="Register"')).toBeVisible();
  });
});
