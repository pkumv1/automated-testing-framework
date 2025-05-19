// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('SauceDemo Login Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the login page before each test
    await page.goto('/');
  });

  test('should display login form', async ({ page }) => {
    // Check that the login form elements are visible
    await expect(page.locator('#user-name')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
    await expect(page.locator('#login-button')).toBeVisible();
  });

  test('should log in with valid credentials', async ({ page }) => {
    // Fill in the login form with valid credentials
    await page.locator('#user-name').fill('standard_user');
    await page.locator('#password').fill('secret_sauce');
    await page.locator('#login-button').click();

    // Verify successful login by checking URL and inventory container presence
    await expect(page).toHaveURL('/inventory.html');
    await expect(page.locator('.inventory_container')).toBeVisible();
  });

  test('should show error with invalid credentials', async ({ page }) => {
    // Fill in the login form with invalid credentials
    await page.locator('#user-name').fill('invalid_user');
    await page.locator('#password').fill('invalid_password');
    await page.locator('#login-button').click();

    // Verify error message is displayed
    await expect(page.locator('[data-test="error"]')).toBeVisible();
    await expect(page.locator('[data-test="error"]')).toContainText('Username and password do not match');
  });

  test('should show error with locked out user', async ({ page }) => {
    // Fill in the login form with locked out user
    await page.locator('#user-name').fill('locked_out_user');
    await page.locator('#password').fill('secret_sauce');
    await page.locator('#login-button').click();

    // Verify error message is displayed
    await expect(page.locator('[data-test="error"]')).toBeVisible();
    await expect(page.locator('[data-test="error"]')).toContainText('locked out');
  });

  test('should log in as performance glitch user', async ({ page }) => {
    // Fill in the login form with performance_glitch_user
    await page.locator('#user-name').fill('performance_glitch_user');
    await page.locator('#password').fill('secret_sauce');
    await page.locator('#login-button').click();

    // Verify successful login
    await expect(page).toHaveURL('/inventory.html');
  });

  test('should log in as problem user', async ({ page }) => {
    // Fill in the login form with problem_user
    await page.locator('#user-name').fill('problem_user');
    await page.locator('#password').fill('secret_sauce');
    await page.locator('#login-button').click();

    // Verify successful login but expect UI issues
    await expect(page).toHaveURL('/inventory.html');
    
    // Problem user has broken images, verify at least one image src
    const imageSrc = await page.locator('.inventory_item_img img').first().getAttribute('src');
    expect(imageSrc).toBeTruthy();
  });
});
