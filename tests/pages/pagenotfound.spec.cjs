const { test, expect } = require('@playwright/test');

test.describe('Page Not Found Tests', () => {

  test('should display 404 Page Not Found with Go Back button', async ({ page }) => {

    await page.goto('http://localhost:3000/non-existent-page');  

    await page.waitForSelector('h1.pnf-title');
    
    await expect(page.locator('h1.pnf-title')).toHaveText('404');

    await expect(page.locator('h2.pnf-heading')).toHaveText('Oops ! Page Not Found');

    const goBackButton = page.locator('a.pnf-btn');
    await expect(goBackButton).toBeVisible();
    
    await goBackButton.click();

    await expect(page).toHaveURL('http://localhost:3000/');  
  });

});
