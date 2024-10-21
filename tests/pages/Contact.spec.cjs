const { test, expect } = require('@playwright/test');

// URL where your React app is hosted. Adjust as necessary.
const baseURL = 'http://localhost:3000'; 

test.describe('Contact Page', () => {
  
  test.beforeEach(async ({ page }) => {
    // Navigate to the contact page before each test.
    // await page.goto(`${baseURL}/contact`);
    
    await page.goto(`${baseURL}`);
    // Click on the 'Contact' link to navigate to the contact page.
    await page.getByRole('link', { name: 'Contact' }).click();
    // await page.click('a[href="/contact"]');
  });

  test('should display the contact image', async ({ page }) => {
    // Check if the image is visible.
    const contactImage = page.locator('img[alt="contactus"]');
    await expect(contactImage).toBeVisible();
    await expect(contactImage).toHaveAttribute('src', '/images/contactus.jpeg');
  });

  test('should display the contact information correctly', async ({ page }) => {
    // Check if the title is correctly displayed.
    const title = page.locator('h1.bg-dark.text-center');
    await expect(title).toHaveText('CONTACT US');

    // Verify the text about availability.
    const description = page.locator('p.text-justify');
    await expect(description).toContainText('For any query or info about product, feel free to call anytime. We are available 24X7.');

    // Verify email information.
    const emailInfo = page.locator('p', { hasText: 'www.help@ecommerceapp.com' });
    await expect(emailInfo).toBeVisible();

    // Verify phone number.
    const phoneInfo = page.locator('p', { hasText: '012-3456789' });
    await expect(phoneInfo).toBeVisible();

    // Verify toll-free number.
    const supportInfo = page.locator('p', { hasText: '1800-0000-0000 (toll free)' });
    await expect(supportInfo).toBeVisible();
  });
});