// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('SauceDemo Performance Tests', () => {
  test('should load login page quickly', async ({ page }) => {
    // Measure navigation time
    const startTime = Date.now();
    
    // Navigate to the login page
    const response = await page.goto('/');
    
    // Calculate load time
    const loadTime = Date.now() - startTime;
    
    // Log the load time
    console.log(`Login page load time: ${loadTime}ms`);
    
    // Assert that the page loaded successfully
    expect(response.status()).toBe(200);
    
    // Assert that the page loaded in a reasonable time (adjustable threshold)
    expect(loadTime).toBeLessThan(5000); // 5 seconds max
  });

  test('should have acceptable time-to-interactive', async ({ page }) => {
    // Navigate to the login page
    await page.goto('/');
    
    // Measure time until login form is interactive
    const startTime = Date.now();
    
    // Wait for login button to be enabled
    await page.locator('#login-button').isEnabled();
    
    const timeToInteractive = Date.now() - startTime;
    console.log(`Time to interactive: ${timeToInteractive}ms`);
    
    // Assert acceptable time-to-interactive
    expect(timeToInteractive).toBeLessThan(3000); // 3 seconds max
  });

  test('should handle performance_glitch_user delay', async ({ page }) => {
    // Navigate to the login page
    await page.goto('/');
    
    // Login with performance_glitch_user
    await page.locator('#user-name').fill('performance_glitch_user');
    await page.locator('#password').fill('secret_sauce');
    
    // Measure login time
    const startTime = Date.now();
    await page.locator('#login-button').click();
    
    // Wait for navigation to complete
    await page.waitForURL('/inventory.html');
    
    const loginTime = Date.now() - startTime;
    console.log(`Performance glitch user login time: ${loginTime}ms`);
    
    // This user should have a delay, but it should still complete eventually
    // We set a high threshold because we expect it to be slow
    expect(loginTime).toBeLessThan(15000); // 15 seconds max
  });

  test('should have acceptable navigation transitions', async ({ page }) => {
    // Navigate to the login page
    await page.goto('/');
    
    // Login with standard user
    await page.locator('#user-name').fill('standard_user');
    await page.locator('#password').fill('secret_sauce');
    await page.locator('#login-button').click();
    
    // Verify we're on the inventory page
    await expect(page).toHaveURL('/inventory.html');
    
    // Measure transition time to cart
    const startCartTime = Date.now();
    await page.locator('.shopping_cart_link').click();
    await page.waitForURL('/cart.html');
    const cartTransitionTime = Date.now() - startCartTime;
    
    console.log(`Transition to cart time: ${cartTransitionTime}ms`);
    expect(cartTransitionTime).toBeLessThan(2000); // 2 seconds max
    
    // Measure transition back to inventory
    const startInventoryTime = Date.now();
    await page.locator('[data-test="continue-shopping"]').click();
    await page.waitForURL('/inventory.html');
    const inventoryTransitionTime = Date.now() - startInventoryTime;
    
    console.log(`Transition back to inventory time: ${inventoryTransitionTime}ms`);
    expect(inventoryTransitionTime).toBeLessThan(2000); // 2 seconds max
  });

  test('should have acceptable image load times', async ({ page }) => {
    // Navigate to the login page
    await page.goto('/');
    
    // Login with standard user
    await page.locator('#user-name').fill('standard_user');
    await page.locator('#password').fill('secret_sauce');
    await page.locator('#login-button').click();
    
    // Wait for all images to load
    const startTime = Date.now();
    
    // Wait for all inventory item images to be visible
    await page.waitForSelector('.inventory_item_img img');
    
    // Get all image elements
    const images = await page.locator('.inventory_item_img img').all();
    
    // Ensure all images are loaded
    for (const img of images) {
      // Wait for the image to be loaded (has width and height)
      await img.evaluate(img => {
        return new Promise((resolve) => {
          if (img.complete) {
            resolve();
          } else {
            img.onload = () => resolve();
            img.onerror = () => resolve(); // Count errors as "loaded" for the test
          }
        });
      });
    }
    
    const imageLoadTime = Date.now() - startTime;
    console.log(`All images load time: ${imageLoadTime}ms`);
    
    // Assert acceptable image load time
    expect(imageLoadTime).toBeLessThan(5000); // 5 seconds max
  });
});
