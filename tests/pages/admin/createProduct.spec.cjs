import { test, expect } from "@playwright/test";

// Assumption is that
// 1) admin_test@u.nus.edu, testing is an administration account and is available

test.use({
  trace: "on",
  launchOptions: {
    headless: true,
  },
});

test.beforeEach(async ({ page }) => {
  await page.goto("http://localhost:3000/", {
    waitUntil: "commit",
  });
  await page.getByRole("link", { name: "Login" }).click();

  await page.getByPlaceholder("Enter Your Email ").fill("admin_test@u.nus.edu");
  await page.getByPlaceholder("Enter Your Password").fill("testing");
  await page.getByRole("button", { name: "LOGIN" }).click();
  await page.getByRole("button", { name: "test" }).click();
  await page.getByRole("link", { name: "Dashboard" }).click();
  await expect(page).toHaveURL("http://localhost:3000/dashboard/admin");
  await page.getByRole("link", { name: "Create Product" }).click();
  await expect(page).toHaveURL(
    "http://localhost:3000/dashboard/admin/create-product"
  );
});

test("create a product and submit successfully", async ({ page }) => {
  await page.locator("#rc_select_0").click();
  await page.getByTitle("HEHE", { exact: true }).locator("div").click();
  const fileInput = page.locator('input[name="photo"]');
  await fileInput.setInputFiles("tests/pages/admin/macdonalds.png");
  await page.getByPlaceholder("write a name").click();
  await page.getByPlaceholder("write a name").fill("Biggest MAC");
  await page.getByPlaceholder("write a description").click();
  await page
    .getByPlaceholder("write a description")
    .fill("Biggest MAC description");
  await page.getByPlaceholder("write a Price").click();
  await page.getByPlaceholder("write a Price").fill("1");
  await page.getByPlaceholder("write a quantity").click();
  await page.getByPlaceholder("write a quantity").fill("100");
  await page.locator("#rc_select_1").click();
  await page.getByText("Yes").click();
  await page
    .locator("button.btn.btn-primary", { hasText: "CREATE PRODUCT" })
    .click();

  await expect(page.locator("text=Product created successfully")).toBeVisible();
  await expect(page.locator("text=Product created successfully")).toBeHidden();
  await page.reload();

  await expect(
    page
      .getByRole("link", { name: "Biggest MAC Biggest MAC description" })
      .first()
  ).toBeVisible();
});

test("update a product successfully", async ({ page }) => {
  await page.getByRole("link", { name: "Products" }).click();
  await expect(page).toHaveURL(
    "http://localhost:3000/dashboard/admin/products"
  );

  await page
    .getByRole("link", { name: "Biggest MAC Biggest MAC" })
    .first()
    .click();
  await expect(page.getByTitle("HEHE")).toBeVisible();
  await expect(page.getByRole("img", { name: "product_photo" })).toBeVisible();
  await expect(page.getByText("No")).toBeVisible();
  await page
    .getByPlaceholder("write a description")
    .fill("Smallest MAC description");
  await page.getByRole("button", { name: "UPDATE PRODUCT" }).click();
  await page.reload();
  await expect(
    page
      .getByRole("link", { name: "Biggest MAC Smallest MAC description" })
      .first()
  ).toBeVisible();
});

test("delete a product successfully", async ({ page }) => {
  await page.getByRole("link", { name: "Products" }).click();
  await expect(page).toHaveURL(
    "http://localhost:3000/dashboard/admin/products"
  );

  await page
    .getByRole("link", {
      name: "Biggest MAC Biggest MAC Smallest MAC description",
    })
    .click();

  // Accept the deletion of the product
  page.once("dialog", async (dialog) => {
    expect(dialog.type()).toContain("prompt");
    expect(dialog.message()).toContain(
      "Are You Sure want to delete this product ? "
    );
    await dialog.accept("Yes");
  });
  await expect(page.getByTitle("HEHE")).toBeVisible();
  await expect(page.getByRole("img", { name: "product_photo" })).toBeVisible();
  await expect(page.getByText("No")).toBeVisible();
  await page.getByRole("button", { name: "DELETE PRODUCT" }).click();
  await page.goto("http://localhost:3000/dashboard/admin/products", {
    waitUntil: "domcontentloaded",
  });

  await expect(
    page.getByRole("link", { name: "Biggest MAC Smallest MAC description" })
  ).toBeHidden();
});
