# SauceDemo Testing Guide

This guide provides detailed instructions for testing the [SauceDemo](https://www.saucedemo.com/) website using our Automated Testing Framework.

## Overview

SauceDemo is a sample e-commerce website provided by Sauce Labs for testing purposes. It offers a complete shopping experience with:

- User authentication
- Product catalog
- Shopping cart functionality
- Checkout process

Our framework includes pre-configured tests for all major functionality of the SauceDemo website.

## Available Test Users

SauceDemo provides several test users with different characteristics:

| Username | Password | Description |
|----------|----------|-------------|
| `standard_user` | `secret_sauce` | Normal user with full access |
| `locked_out_user` | `secret_sauce` | User that is locked out |
| `problem_user` | `secret_sauce` | User with intentional UI issues |
| `performance_glitch_user` | `secret_sauce` | User with intentional performance glitches |

## Test Scenarios

### 1. Login Functionality

The login tests (`test_scripts/e2e/login.spec.js`) verify:

- Login form display and validation
- Successful login with valid credentials
- Error handling for invalid credentials
- Behavior for locked out users
- Login with performance glitch user
- Login with problem user

### 2. Shopping Cart Functionality

The cart tests (`test_scripts/e2e/cart.spec.js`) verify:

- Adding items to cart
- Adding multiple items to cart
- Removing items from cart
- Continuing shopping from cart page
- Checkout process flow
- Checkout information validation

### 3. Performance Testing

The performance tests (`test_scripts/performance/performance.spec.js`) measure:

- Login page load time
- Time to interactive
- Performance glitch user login time
- Page transition performance
- Image load performance

## Running the Tests

### Prerequisites

Ensure you have completed the main framework installation steps from the primary README.

### Running All Tests

```bash
npx playwright test
```

This command will run all test files in the `test_scripts` directory across all configured browsers.

### Running Specific Test Files

```bash
# Run only login tests
npx playwright test test_scripts/e2e/login.spec.js

# Run only cart tests
npx playwright test test_scripts/e2e/cart.spec.js

# Run only performance tests
npx playwright test test_scripts/performance/performance.spec.js
```

### Running on Specific Browsers

```bash
# Run on Chrome only
npx playwright test --project=chromium

# Run on Firefox only
npx playwright test --project=firefox

# Run on Safari only
npx playwright test --project=webkit
```

### Running on Mobile Viewports

```bash
# Run on mobile Chrome
npx playwright test --project="Mobile Chrome"

# Run on mobile Safari
npx playwright test --project="Mobile Safari"
```

## Viewing Test Results

After running tests, the results are available in:

- **HTML Report**: `./results/playwright-report/index.html`
- **JSON Results**: `./results/playwright-results.json`

To open the HTML report directly:

```bash
npx playwright show-report ./results/playwright-report
```

## Generated Reports

For more detailed reports including performance metrics and security findings:

```bash
node src/index.js generate-report ./results
```

This will create comprehensive reports in the `./results/reports` directory.

## Common Issues and Troubleshooting

### Login Failures

If login tests fail:
- Verify the SauceDemo website is accessible
- Check if the test user credentials have changed
- Ensure the correct login endpoint is being used

### Performance Test Failures

Performance tests may fail due to:
- Network conditions affecting load times
- System resources on the test machine
- Browser-specific performance differences

Adjust the performance thresholds in `test_config/config.json` if necessary.

### Browser Compatibility Issues

If tests fail on specific browsers:
- Check that the browser is properly installed
- Verify any browser-specific selectors or behaviors
- Consider browser-specific workarounds for known issues

## Extending the Tests

### Adding New Test Scenarios

1. Create a new test specification in `test_cases/`
2. Implement the test script in `test_scripts/`
3. Run the new tests using the specific file path

### Modifying Test Data

Update the test data in `test_config/config.json` to add or modify:
- Test users
- Product information
- Form data

## Security Testing Considerations

For security testing:

1. The framework includes basic security tests, but manual review is also recommended
2. Test in isolated environments only as security tests might be flagged as attacks
3. Do not run aggressive security tests against production environments

---

**Note**: The SauceDemo website is designed for testing purposes and includes intentional issues like the "problem_user" account. These are not bugs but features designed to help testers practice their skills.