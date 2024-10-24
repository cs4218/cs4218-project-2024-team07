const { test, expect } = require('@playwright/test');

test.describe('Login Page Tests', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/login', {waitUntil: "commit"});
  });
  
  test('should log in with valid credentials', async ({ page }) => {
    await page.fill('input#exampleInputEmail1', 'testlogin@gmail.com');
    await page.fill('input#exampleInputPassword1', 'hongsheng123');
  
    await page.click('button:has-text("LOGIN")');
  
    await expect(page).toHaveURL('http://localhost:3000/');
  });
  
  test('should display error message on invalid credentials', async ({ page }) => {
    await page.fill('input#exampleInputEmail1', 'wrongemail@example.com');
    await page.fill('input#exampleInputPassword1', 'wrongpassword');
  
    await page.click('button:has-text("LOGIN")');
  
    const errorMessage = page.locator('div[role="status"]');
    await errorMessage.waitFor({ state: 'visible', timeout: 5000 });
  
    await expect(errorMessage).toHaveText('Something went wrong');
  });
  
  test('should navigate to Forgot Password page', async ({ page }) => {
    await page.click('button.forgot-btn');
  
    await expect(page).toHaveURL('http://localhost:3000/forgot-password');
  });
});
