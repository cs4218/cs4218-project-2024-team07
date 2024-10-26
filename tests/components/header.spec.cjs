// tests/header.spec.js
const { test, expect } = require('@playwright/test');

test.describe('Header Component Tests', () => {
  test.beforeEach(async ({ page }) => {

    await page.goto('http://localhost:3000/', {waitUntil: "commit"});


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

    await page.click('a.nav-link.dropdown-toggle');
  

    const categoriesDropdown = page.locator('ul.dropdown-menu.show');
    await categoriesDropdown.waitFor({ state: 'visible', timeout: 10000 }); 
  

    await expect(categoriesDropdown.locator('a.dropdown-item').first()).toHaveText('All Categories');
  
    await expect(categoriesDropdown.locator('a.dropdown-item').first()).toHaveAttribute('href', '/categories');
  });
  
  
  test('should navigate to the Cart page when Cart link is clicked', async ({ page }) => {

    await page.click('nav >> text="Cart"');


    await expect(page).toHaveURL(/\/cart$/);


  });

  test('should show Login and Register when user is not authenticated', async ({ page }) => {

    await page.evaluate(() => localStorage.clear());


    await page.reload({ waitUntil: 'commit' });


    await expect(page.locator('nav >> text="Login"')).toBeVisible();
    await expect(page.locator('nav >> text="Register"')).toBeVisible();
  });

  test('should display user dropdown when authenticated', async ({ page }) => {

    // To simulate user authentication
    await page.evaluate(() => {
      localStorage.setItem(
        'auth',
        JSON.stringify({
          user: { name: 'Test User', role: 0 },
          token: 'fake-jwt-token',
        })
      );
    });


    await page.reload({ waitUntil: 'commit' });


    await expect(page.locator('nav >> text="Test User"')).toBeVisible();


    await page.click('nav >> text="Test User"');


    const userDropdown = page.locator('.nav-item.dropdown', { hasText: 'Test User' }).locator('.dropdown-menu');
    await userDropdown.waitFor({ state: 'visible' });


    await expect(userDropdown.locator('text="Dashboard"')).toBeVisible();
    await expect(userDropdown.locator('text="Logout"')).toBeVisible();
  });

  test('should logout the user when Logout is clicked', async ({ page }) => {

    await page.evaluate(() => {
      localStorage.setItem(
        'auth',
        JSON.stringify({
          user: { name: 'Test User', role: 0 },
          token: 'fake-jwt-token',
        })
      );
    });
    await page.reload({ waitUntil: 'commit' });

    await page.click('nav >> text="Test User"');
    await page.click('.dropdown-menu >> text="Logout"');

    await expect(page).toHaveURL(/\/login$/);

    await expect(page.locator('nav >> text="Login"')).toBeVisible();
    await expect(page.locator('nav >> text="Register"')).toBeVisible();
  });
});
