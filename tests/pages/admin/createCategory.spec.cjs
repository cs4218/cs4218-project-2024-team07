const { test, expect } = require('@playwright/test');

test.use({
  trace: 'on',
  launchOptions: {
    headless: true,
  },
});

test.beforeEach(async ({ page }) => {
  await page.goto('http://localhost:3000/', {waitUntil: "commit"});
  await page.getByRole('link', { name: 'Login' }).click();
  // Login as admin
  await page.getByPlaceholder('Enter Your Email ').fill('admin_test@u.nus.edu');
  await page.getByPlaceholder('Enter Your Password').fill('testing');
  await page.getByRole('button', { name: 'LOGIN' }).click();
  await page.locator('a.nav-link.dropdown-toggle:has-text("TEST")').click();
  await page.locator('a.dropdown-item:has-text("Dashboard")').click();
  await expect(page).toHaveURL('http://localhost:3000/dashboard/admin');
  await page.getByRole('link', { name: 'Create Category' }).click();
  await expect(page).toHaveURL('http://localhost:3000/dashboard/admin/create-category');
});

test('Create a new category and check if it is successfully created', async ({ page }) => {
  const categoryName = 'Test Category';
  await page.getByPlaceholder('Enter new category').fill(categoryName);
  await page.getByRole('button', { name: 'Submit' }).click();
  // Check if the status message is displayed
  const statusDiv = page.locator('div[role="status"]').filter({ hasText: `${categoryName} is created` });
  await expect(statusDiv).toHaveText(`${categoryName} is created`);
  // Check if the category is displayed in the table
  const categoryCell = page.getByRole('cell', { name: categoryName });
  await expect(categoryCell).toHaveText(categoryName);
  // Navigate to the categories page and check if the new category exists
  await page.locator('a.nav-link.dropdown-toggle:has-text("CATEGORIES")').click();
  await page.locator('a.dropdown-item:has-text("ALL CATEGORIES")').click();
  await expect(page).toHaveURL('http://localhost:3000/categories');

  // Check if the new category is accessible
  await page.getByRole('link', { name: categoryName }).click();
  await expect(page).toHaveURL(`http://localhost:3000/category/test-category`);
  expect(page.locator('h4:has-text("Category - Test Category")')).toBeTruthy();
});

test('Update a category and check if it is successfully updated', async ({ page }) => {
  const originalCategoryName = 'Test Category';
  const updatedCategoryName = 'Updated Category';

  // Proceed to update 'Test Category' to 'Updated Category'
  const categoryRow = page.locator('tr', { hasText: originalCategoryName });
  const editButton = categoryRow.locator('button.btn-primary:has-text("Edit")');
  await editButton.click();
  await page.waitForSelector('.ant-modal-body', { state: 'visible' });
  const inputField = page.locator('.ant-modal-body input[placeholder="Enter new category"]');
  await inputField.fill(updatedCategoryName);
  await page.locator('.ant-modal-body button[type="submit"]').click();

  // Check if the status message is displayed
  const statusDiv = page.locator('div[role="status"]').filter({ hasText: `${updatedCategoryName} is updated` });
  await expect(statusDiv).toHaveText(`${updatedCategoryName} is updated`);
  // Check if the updated category is displayed in the table
  const updatedCategoryCell = page.getByRole('cell', { name: updatedCategoryName });
  await expect(updatedCategoryCell).toHaveText(updatedCategoryName);

  // Navigate to the categories page and check if the updated category exists
  await page.locator('a.nav-link.dropdown-toggle:has-text("CATEGORIES")').click();
  await page.locator('a.dropdown-item:has-text("ALL CATEGORIES")').click();
  await expect(page).toHaveURL('http://localhost:3000/categories');

  // Check if the updated category is accessible
  await page.getByRole('link', { name: updatedCategoryName }).click();
  await expect(page).toHaveURL(`http://localhost:3000/category/updated-category`);
  expect(page.locator('h4:has-text("Category - Updated Category")')).toBeTruthy();
});

test('Delete a category and check if it is successfully deleted', async ({ page }) => {
  const categoryName = 'Updated Category';

  // Proceed to delete the category
  const categoryRow = page.locator('tr', { hasText: categoryName });
  const deleteButton = categoryRow.locator('button.btn-danger:has-text("Delete")');
  await deleteButton.click();

  // Check if the status message is displayed
  const statusDiv = page.locator('div[role="status"]').filter({ hasText: 'category is deleted' });
  await expect(statusDiv).toHaveText('category is deleted');
  // Check if the category is not displayed in the table
  const categoryCell = page.getByRole('cell', { name: categoryName });
  await expect(categoryCell).toHaveCount(0);

  // Navigate to the categories page and check if the category is deleted
  await page.locator('a.nav-link.dropdown-toggle:has-text("CATEGORIES")').click();
  await page.locator('a.dropdown-item:has-text("ALL CATEGORIES")').click();
  await expect(page).toHaveURL('http://localhost:3000/categories');

  // Check if the category is not accessible
  const categoryLink = page.getByRole('link', { name: categoryName });
  await expect(categoryLink).toHaveCount(0);
});



