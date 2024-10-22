import { test, expect } from "@playwright/test";
import { create } from "domain";

// Assumption is that
// 1) admin_test@u.nus.edu, testing
// 2) Genshin item is available

let createProductPage;

test.beforeEach(async ({ browser }) => {
  const context = await browser.newContext();
  createProductPage = await context.newPage();
  await createProductPage.goto("http://localhost:3000/", {
    waitUntil: "commit",
  });
  await createProductPage.getByRole("link", { name: "Login" }).click();

  await createProductPage
    .getByPlaceholder("Enter Your Email ")
    .fill("admin_test@u.nus.edu");
  await createProductPage
    .getByPlaceholder("Enter Your Password")
    .fill("testing");
  await createProductPage.getByRole("button", { name: "LOGIN" }).click();
  await createProductPage.locator('a:has-text("TEST")').click();
  await createProductPage
    .locator('a.dropdown-item:has-text("Dashboard")')
    .click();
  await expect(createProductPage).toHaveURL(
    "http://localhost:3000/dashboard/admin"
  );
  await createProductPage.getByRole("link", { name: "Create Product" }).click();
  await expect(createProductPage).toHaveURL(
    "http://localhost:3000/dashboard/admin/create-product"
  );
});

test("create a product and submit successfully", async () => {
  await createProductPage
    .locator(".form-select.mb-3 .ant-select-selector")
    .first()
    .click();
  await createProductPage.locator(".ant-select-item-option").first().click();

  // Fill other details
  const fileInput = createProductPage.locator('input[name="photo"]');
  await fileInput.setInputFiles("tests/client/src/pages/admin/mcdonalds.jpg");
  await createProductPage.fill(
    'input[placeholder="write a name"]',
    "Biggest MAC"
  );
  await createProductPage.fill(
    'textarea[placeholder="write a description"]',
    "Sample description for the product"
  );
  await createProductPage.fill('input[placeholder="write a Price"]', "50");
  await createProductPage.fill('input[placeholder="write a quantity"]', "100");
  await createProductPage
    .locator(".form-select.mb-3 .ant-select-selector")
    .nth(1)
    .click();

  await createProductPage
    .locator(".ant-select-item-option", { hasText: "Yes" })
    .click();
  await createProductPage
    .locator("button.btn.btn-primary", { hasText: "CREATE PRODUCT" })
    .click();

  await expect(
    createProductPage.locator("text=Product created successfully")
  ).toBeVisible();

  // Refresh page
  await createProductPage.goto("http://localhost:3000/dashboard/admin/products", {
    waitUntil: "commit",
  });

  const count = await createProductPage
    .locator("a.product-link", { hasText: "Biggest MAC" })
    .count();
  expect(count).toBeGreaterThan(0);
});

test("update a product successfully", async () => {
  await createProductPage.getByRole("link", { name: "Products" }).click();
  await expect(createProductPage).toHaveURL(
    "http://localhost:3000/dashboard/admin/products"
  );

  await createProductPage
    .locator("a.product-link", { hasText: "Biggest MAC" })
    .first()
    .click();

  const descriptionField = createProductPage.locator(
    "text=Sample description for the product"
  );
  await descriptionField.fill("Edit description for the product");

  await createProductPage
    .locator("button.btn.btn-primary", { hasText: "UPDATE PRODUCT" })
    .click();

  await createProductPage.getByRole("link", { name: "Products" }).click();
  await expect(createProductPage).toHaveURL(
    "http://localhost:3000/dashboard/admin/products"
  );

  await expect(
    createProductPage.locator("a.product-link", { hasText: "Biggest MAC" })
  ).toBeVisible();
});

test("delete a product successfully", async () => {
  // Accept the deletion of the product
  createProductPage.on("dialog", async (dialog) => {
    expect(dialog.type()).toContain("prompt");
    expect(dialog.message()).toContain(
      "Are You Sure want to delete this product ? "
    );
    await dialog.accept("Yes");
  });

  await createProductPage.getByRole("link", { name: "Products" }).click();
  await expect(createProductPage).toHaveURL(
    "http://localhost:3000/dashboard/admin/products"
  );

  await createProductPage
    .locator("a.product-link", { hasText: "Biggest MAC" })
    .first()
    .click();

  await createProductPage
    .locator("button.btn.btn-danger", { hasText: "DELETE PRODUCT" })
    .click();

  await createProductPage.getByRole("link", { name: "Products" }).click();
  await expect(createProductPage).toHaveURL(
    "http://localhost:3000/dashboard/admin/products"
  );

  await expect(
    createProductPage.locator("a.product-link", { hasText: "Biggest MAC" })
  ).toBeHidden();
});
