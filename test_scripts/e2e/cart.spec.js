// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('SauceDemo Shopping Cart Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the login page
    await page.goto('/');
    
    // Login with standard user
    await page.locator('#user-name').fill('standard_user');
    await page.locator('#password').fill('secret_sauce');
    await page.locator('#login-button').click();
    
    // Verify we're on the inventory page
    await expect(page).toHaveURL('/inventory.html');
  });

  test('should add item to cart', async ({ page }) => {
    // Get the first add to cart button
    const addToCartButton = page.locator('.inventory_item').first().locator('.btn_inventory');
    
    // Get the text of the item we're adding
    const itemName = await page.locator('.inventory_item').first().locator('.inventory_item_name').textContent();
    
    // Add item to cart
    await addToCartButton.click();
    
    // Verify cart badge shows 1 item
    await expect(page.locator('.shopping_cart_badge')).toHaveText('1');
    
    // Go to cart
    await page.locator('.shopping_cart_link').click();
    
    // Verify we're on the cart page
    await expect(page).toHaveURL('/cart.html');
    
    // Verify the item is in the cart
    await expect(page.locator('.cart_item')).toHaveCount(1);
    await expect(page.locator('.inventory_item_name')).toHaveText(itemName);
  });

  test('should add multiple items to cart', async ({ page }) => {
    // Add first item to cart
    await page.locator('.inventory_item').first().locator('.btn_inventory').click();
    
    // Add second item to cart
    await page.locator('.inventory_item').nth(1).locator('.btn_inventory').click();
    
    // Verify cart badge shows 2 items
    await expect(page.locator('.shopping_cart_badge')).toHaveText('2');
    
    // Go to cart
    await page.locator('.shopping_cart_link').click();
    
    // Verify we have 2 items in the cart
    await expect(page.locator('.cart_item')).toHaveCount(2);
  });

  test('should remove item from cart', async ({ page }) => {
    // Add item to cart
    await page.locator('.inventory_item').first().locator('.btn_inventory').click();
    
    // Verify cart badge shows 1 item
    await expect(page.locator('.shopping_cart_badge')).toHaveText('1');
    
    // Go to cart
    await page.locator('.shopping_cart_link').click();
    
    // Remove item from cart
    await page.locator('.cart_item').first().locator('.cart_button').click();
    
    // Verify cart is empty
    await expect(page.locator('.cart_item')).toHaveCount(0);
    await expect(page.locator('.shopping_cart_badge')).toBeHidden();
  });

  test('should continue shopping from cart', async ({ page }) => {
    // Add item to cart
    await page.locator('.inventory_item').first().locator('.btn_inventory').click();
    
    // Go to cart
    await page.locator('.shopping_cart_link').click();
    
    // Click continue shopping
    await page.locator('[data-test="continue-shopping"]').click();
    
    // Verify we're back on the inventory page
    await expect(page).toHaveURL('/inventory.html');
  });

  test('should proceed to checkout', async ({ page }) => {
    // Add item to cart
    await page.locator('.inventory_item').first().locator('.btn_inventory').click();
    
    // Go to cart
    await page.locator('.shopping_cart_link').click();
    
    // Click checkout
    await page.locator('[data-test="checkout"]').click();
    
    // Verify we're on the checkout step one page
    await expect(page).toHaveURL('/checkout-step-one.html');
    
    // Fill in checkout form
    await page.locator('[data-test="firstName"]').fill('Test');
    await page.locator('[data-test="lastName"]').fill('User');
    await page.locator('[data-test="postalCode"]').fill('12345');
    
    // Continue to step two
    await page.locator('[data-test="continue"]').click();
    
    // Verify we're on the checkout step two page
    await expect(page).toHaveURL('/checkout-step-two.html');
    
    // Verify the item is in the checkout
    await expect(page.locator('.cart_item')).toHaveCount(1);
    
    // Finish checkout
    await page.locator('[data-test="finish"]').click();
    
    // Verify we're on the completion page
    await expect(page).toHaveURL('/checkout-complete.html');
    await expect(page.locator('.complete-header')).toHaveText('Thank you for your order!');
  });

  test('should validate checkout information', async ({ page }) => {
    // Add item to cart
    await page.locator('.inventory_item').first().locator('.btn_inventory').click();
    
    // Go to cart
    await page.locator('.shopping_cart_link').click();
    
    // Click checkout
    await page.locator('[data-test="checkout"]').click();
    
    // Try to continue without filling the form
    await page.locator('[data-test="continue"]').click();
    
    // Verify error message
    await expect(page.locator('[data-test="error"]')).toBeVisible();
    await expect(page.locator('[data-test="error"]')).toContainText('First Name is required');
    
    // Fill in first name only
    await page.locator('[data-test="firstName"]').fill('Test');
    await page.locator('[data-test="continue"]').click();
    
    // Verify error message
    await expect(page.locator('[data-test="error"]')).toBeVisible();
    await expect(page.locator('[data-test="error"]')).toContainText('Last Name is required');
    
    // Fill in last name too
    await page.locator('[data-test="lastName"]').fill('User');
    await page.locator('[data-test="continue"]').click();
    
    // Verify error message
    await expect(page.locator('[data-test="error"]')).toBeVisible();
    await expect(page.locator('[data-test="error"]')).toContainText('Postal Code is required');
  });
});
