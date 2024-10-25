const { test, expect } = require("@playwright/test");

test.use({
  trace: "on",
  launchOptions: {
    headless: true,
  },
});

test.describe("Profile component tests", () => {
  // Test needs to have a pre-existing user with these details in the database
  const userAccount = {
    name: "UiTestAccount",
    email: "UiTest@u.nus.edu",
    password: "UiTestingIsMyPassion",
    phone: "69420420",
    address: "Uganda",
    answer: "Esports",
  };
  const changedAccount = {
    name: "UxTestAccount",
    email: "UxTest@u.nus.edu",
    password: "UxTestingIsMyPassion",
    phone: "69696969",
    address: "United States",
    answer: "Football",
  };
  let changes = {};
  const nameInputFieldPlaceholder = "Enter Your Name";
  const passwordInputFieldPlaceholder = "Enter Your Password";
  const phoneInputFieldPLaceholder = "Enter Your Phone";
  const addressInputFieldPlaceholder = "Enter Your Address";

  const goToProfile = async (page, isLoggedOut, changes) => {
    await page.goto("http://localhost:3000/", {
      waitUntil: "domcontentloaded",
    });
    if (isLoggedOut) {
      await page.getByRole("link", { name: "Login" }).click();
      // Login
      await page
        .getByPlaceholder("Enter Your Email ")
        .fill(changes.email ? changes.email : userAccount.email);
      await page
        .getByPlaceholder("Enter Your Password")
        .fill(changes.password ? changes.password : userAccount.password);
      await page.getByRole("button", { name: "LOGIN" }).click();
    }
    await await page
      .getByRole("button", {
        name: changes.name ? changes.name : userAccount.name,
      })
      .click();
    await page.locator('a.dropdown-item:has-text("Dashboard")').click();
    await expect(page).toHaveURL("http://localhost:3000/dashboard/user");
    await page.getByRole("link", { name: "Profile" }).click();
    await expect(page).toHaveURL(
      "http://localhost:3000/dashboard/user/profile"
    );
  };

  // Helper function, to be used inside the tests
  const changeProfileInfo = async (page, changes) => {
    if (changes.name) {
      await page.getByPlaceholder(nameInputFieldPlaceholder).fill(changes.name);
    }
    if (changes.password) {
      await page
        .getByPlaceholder(passwordInputFieldPlaceholder)
        .fill(changes.password);
    }
    if (changes.phone) {
      await page
        .getByPlaceholder(phoneInputFieldPLaceholder)
        .fill(changes.phone);
    }
    if (changes.address) {
      await page
        .getByPlaceholder(addressInputFieldPlaceholder)
        .fill(changes.address);
    }
    await page.getByRole("button", { name: "UPDATE" }).click();

    const statusDiv = page
      .locator('div[role="status"]')
      .filter({ hasText: "Profile Updated Successfully" });
    await expect(statusDiv).toHaveText("Profile Updated Successfully");
  };

  test.beforeEach(async ({ page }) => {
    await goToProfile(page, true, userAccount);
    // await changeProfileInfo(page, userAccount);
  });

  test.afterEach(async ({ page }) => {
    await goToProfile(page, false, changes);
    await changeProfileInfo(page, userAccount);
    changes = {};
  });

  test("should have popup when profile is updated successfully", async ({
    page,
  }) => {
    changes = {
      name: changedAccount.name,
      password: changedAccount.password,
      phone: changedAccount.phone,
      address: changedAccount.address,
    };
    await changeProfileInfo(page, changes);

    // Profile Updated toast pops up successfully
    const statusDiv = page
      .locator('div[role="status"]')
      .filter({ hasText: "Profile Updated Successfully" });
    await expect(statusDiv).toHaveText("Profile Updated Successfully");
  });

  test("should update dashboard when profile is updated successfully", async ({
    page,
  }) => {
    changes = {
      name: changedAccount.name,
      password: changedAccount.password,
      phone: changedAccount.phone,
    };
    await changeProfileInfo(page, changes);

    // New Profile name is updated on dropdown
    await expect(
      page.getByRole("button", { name: changedAccount.name })
    ).toBeVisible();

    // Verify that the information is updated in the user dashboard
    await page.getByRole("button", { name: changedAccount.name }).click();
    await page.locator('a.dropdown-item:has-text("Dashboard")').click();
    await expect(page).toHaveURL("http://localhost:3000/dashboard/user");
    await expect(
      page.getByRole("heading", { name: changedAccount.name })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: userAccount.address })
    ).toBeVisible();
  });

  test("should log in with new password when password is updated successfully", async ({
    page,
  }) => {
    changes = {
      password: changedAccount.password,
    };
    await changeProfileInfo(page, changes);

    // Logout
    await page.getByRole("button", { name: userAccount.name }).click();
    await page.getByRole("link", { name: "LOGOUT" }).click();
    await expect(page).toHaveURL("http://localhost:3000/login");

    await page.getByPlaceholder("Enter Your Email ").fill(userAccount.email);
    await page.getByPlaceholder("Enter Your Password").fill(changes.password);
    await page.getByRole("button", { name: "LOGIN" }).click();
    // Login successful
    await expect(page).toHaveURL("http://localhost:3000");
  });

  test.fail("should have popup when profile is updated unsuccessfully", async ({
    page,
  }) => {
    changes = {
      password: 'fail',
    };
    await changeProfileInfo(page, changes);

    // Profile Updated toast pops up successfully
    const statusDiv = page
      .locator('div[role="status"]')
      .filter({ hasText: "Something went wrong" });
    await expect(statusDiv).toHaveText("Something went wrong");
  });
});
