const { test, expect } = require('@playwright/test');

let testPage;


test.beforeEach(async ({ browser}) => {
    const context = await browser.newContext();
    testPage = await context.newPage();
    await testPage.goto('http://localhost:3000/');
    await testPage.getByRole('link', { name: 'Login' }).click();
    // Login as admin
    await testPage.getByPlaceholder('Enter Your Email ').fill('admin_test@u.nus.edu');
    await testPage.getByPlaceholder('Enter Your Password').fill('testing');
    await testPage.getByRole('button', { name: 'LOGIN' }).click();
    await testPage.locator('a.nav-link.dropdown-toggle:has-text("TEST")').click();
    await testPage.locator('a.dropdown-item:has-text("Dashboard")').click();
    await expect(testPage).toHaveURL('http://localhost:3000/dashboard/admin');
    await testPage.getByRole('link', { name: 'Create Category' }).click();
    await expect(testPage).toHaveURL('http://localhost:3000/dashboard/admin/create-category');
});


test('Create a new category and check if it is successfully created', async () => {
    await testPage.getByPlaceholder('Enter new category').fill('Test Category');
    await testPage.getByRole('button', { name: 'Submit' }).click();
    // Check if the status message is displayed
    const statusDiv = testPage.locator('div[role="status"]').filter({ hasText: 'Test Category is created' });
    await expect(statusDiv).toHaveText('Test Category is created'); 
    // Check if the category is displayed in the table
    const categoryCell = testPage.getByRole('cell', { name: 'Test Category' });
    await expect(categoryCell).toHaveText('Test Category');
    // Navigate to the categories page and check if the new category exists
    await testPage.locator('a.nav-link.dropdown-toggle:has-text("CATEGORIES")').click();
    await testPage.locator('a.dropdown-item:has-text("ALL CATEGORIES")').click();
    await expect(testPage).toHaveURL('http://localhost:3000/categories');

    // Check if the new category is accessible
    await testPage.getByRole('link', { name: 'Test Category' }).click();
    await expect(testPage).toHaveURL('http://localhost:3000/category/test-category');
    await testPage.locator('h4:has-text("Category - Test Category")');
});

test('Update a category and check if it is successfully updated', async () => {
    const categoryRow = testPage.locator('tr', { hasText: 'Test Category' });
    const editButton = categoryRow.locator('button.btn-primary:has-text("Edit")');
    await editButton.click();
    await testPage.waitForSelector('.ant-modal-body', { state: 'visible' });
    const inputField = testPage.locator('.ant-modal-body input[placeholder="Enter new category"]');
    await inputField.fill('Updated Category');
    await testPage.locator('.ant-modal-body button[type="submit"]').click();
    // Check if the status message is displayed
    const statusDiv = testPage.locator('div[role="status"]').filter({ hasText: 'Updated Category is updated' });
    await expect(statusDiv).toHaveText('Updated Category is updated'); 
    // Check if the updated category is displayed in the table
    const updatedCategoryCell = testPage.getByRole('cell', { name: 'Updated Category' });
    await expect(updatedCategoryCell).toHaveText('Updated Category');
    // Navigate to the categories page and check if the updated category exists
    await testPage.locator('a.nav-link.dropdown-toggle:has-text("CATEGORIES")').click();
    await testPage.locator('a.dropdown-item:has-text("ALL CATEGORIES")').click();
    await expect(testPage).toHaveURL('http://localhost:3000/categories');
    // Check if the updated category is accessible
    await testPage.getByRole('link', { name: 'Updated Category' }).click();
    await expect(testPage).toHaveURL('http://localhost:3000/category/updated-category');
    await testPage.locator('h4:has-text("Category - Updated Category")');
});

test('Delete a category and check if it is successfully deleted', async ({ page }) => {
    const categoryRow = testPage.locator('tr', { hasText: 'Updated Category' });
    const deleteButton = categoryRow.locator('button.btn-danger:has-text("Delete")');
    await deleteButton.click();
    // Check if the status message is displayed
    const statusDiv = testPage.locator('div[role="status"]').filter({ hasText: 'category is deleted' });
    await expect(statusDiv).toHaveText('category is deleted'); 
    // Check if the updated category is not displayed in the table
    const updatedCategoryCell = page.getByRole('cell', { name: 'Updated Category' });
    await expect(updatedCategoryCell).toHaveCount(0);
    // Navigate to the categories page and check if the updated category is deleted
    await testPage.locator('a.nav-link.dropdown-toggle:has-text("CATEGORIES")').click();
    await testPage.locator('a.dropdown-item:has-text("ALL CATEGORIES")').click();
    await expect(testPage).toHaveURL('http://localhost:3000/categories');
    // Check if the updated category is not accessible
    const updatedCategoryLink = testPage.getByRole('link', { name: 'Updated Category' });
    await expect(updatedCategoryLink).toHaveCount(0);

});

