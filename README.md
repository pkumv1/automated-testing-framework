# Automated Testing Framework

A comprehensive testing framework for analyzing and testing GitHub repositories and web applications. This framework provides end-to-end capabilities from repository analysis to test generation, execution, and reporting.

## Features

- **Repository Analysis**: Analyze GitHub repositories to understand their structure, technologies, and architecture
- **Test Case Generation**: Automatically generate test cases based on repository analysis
- **Risk Analysis**: Identify potential security vulnerabilities and code quality issues
- **Test Execution**: Run various types of tests including:
  - Unit Tests
  - Integration Tests
  - End-to-End Tests
  - Performance Tests
  - Security Tests
- **Reporting**: Generate detailed test reports in multiple formats

## Project Structure

```
automated-testing-framework/
├── src/                      # Source code for the framework
│   ├── core/                 # Core framework modules
│   │   ├── repo-analyzer.js  # Repository analysis logic
│   │   ├── test-generator.js # Test case generation logic
│   │   ├── risk-analyzer.js  # Risk and vulnerability analysis
│   │   ├── test-runner.js    # Test execution engine
│   │   └── report-generator.js # Test report generation
│   └── utils/                # Utility functions
│       └── logger.js         # Logging utility
├── test_cases/               # Test case specifications
│   ├── login_test_cases.json # Login functionality test cases
│   ├── cart_test_cases.json  # Shopping cart test cases
│   ├── performance_test_cases.json # Performance test cases
│   └── security_test_cases.json # Security test cases
├── test_scripts/             # Executable test scripts
│   ├── e2e/                  # End-to-end test scripts
│   │   ├── login.spec.js     # Login functionality tests
│   │   └── cart.spec.js      # Shopping cart tests
│   └── performance/          # Performance test scripts
│       └── performance.spec.js # Performance tests
├── test_config/              # Test configuration files
│   └── config.json           # Main configuration file
├── test_data/                # Test fixtures and mock data
├── results/                  # Test execution results and reports
├── playwright.config.js      # Playwright configuration
└── package.json              # Project dependencies
```

## Getting Started

### Prerequisites

- Node.js 16.x or higher
- NPM or Yarn
- GitHub account (for repository analysis)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/pkumv1/automated-testing-framework.git
   cd automated-testing-framework
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Install Playwright browsers:
   ```bash
   npx playwright install
   ```

### Configuration

Before running tests, review and update the configuration files:

1. **Environment Variables**: Create a `.env` file in the root directory:
   ```
   GITHUB_TOKEN=your_github_token
   LOG_LEVEL=info
   ```

2. **Test Configuration**: Modify `test_config/config.json` as needed for your testing environment.

### Usage

The framework provides a command-line interface for all operations:

#### Repository Analysis

Analyze a GitHub repository:

```bash
node src/index.js analyze https://github.com/username/repo
```

Options:
- `-o, --output <path>`: Output file path (default: `./results/analysis.json`)
- `-t, --token <token>`: GitHub token for private repositories

#### Test Generation

Generate test cases based on repository analysis:

```bash
node src/index.js generate-tests ./results/analysis.json
```

Options:
- `-o, --output <path>`: Output directory (default: `./test_cases`)

#### Risk Analysis

Analyze a repository for risks and vulnerabilities:

```bash
node src/index.js analyze-risks ./path/to/repo
```

Options:
- `-o, --output <path>`: Output file path (default: `./results/risks.json`)

#### Running Tests

Run the generated tests:

```bash
node src/index.js run-tests ./test_cases
```

Options:
- `-t, --test-type <type>`: Type of tests to run (`unit`, `integration`, `e2e`, `all`) (default: `all`)
- `-r, --results <path>`: Results output directory (default: `./results`)

#### Generating Reports

Generate test reports based on test results:

```bash
node src/index.js generate-report ./results
```

Options:
- `-o, --output <path>`: Output directory for reports (default: `./results/reports`)
- `-f, --format <format>`: Report format (`html`, `pdf`, `json`) (default: `html`)

### Running Tests for SauceDemo

To run the pre-configured SauceDemo website tests:

```bash
# Run all tests
npx playwright test

# Run specific test file
npx playwright test test_scripts/e2e/login.spec.js

# Run with specific browser
npx playwright test --project=chromium
```

## Test Case Examples

### Login Tests

The framework includes various login test scenarios:

- Valid user login
- Invalid credentials handling
- Locked out user testing
- Performance glitch user testing
- Problem user testing

### Shopping Cart Tests

E-commerce functionality tests:

- Adding items to cart
- Removing items from cart
- Checkout process
- Form validation during checkout

### Performance Tests

Performance measurement tests:

- Page load time testing
- Time-to-interactive measurement
- Transition performance
- Image loading performance

### Security Tests

Security validation tests:

- Input sanitization
- XSS prevention
- Authentication security
- Session management
- URL/access control

## Extending the Framework

### Adding New Test Types

1. Create test case specifications in `test_cases/`
2. Implement test scripts in `test_scripts/`
3. Update the test generator to handle the new test type
4. Extend the test runner to execute the new tests

### Supporting New Repositories

To test different repositories or web applications:

1. Update the repository analyzer to understand the new structure
2. Create appropriate test cases and scripts
3. Modify the configuration file for the new environment

## Troubleshooting

### Common Issues

- **Authentication Failures**: Ensure your GitHub token has appropriate permissions
- **Test Runner Issues**: Check that all dependencies are installed correctly
- **Playwright Errors**: Ensure browsers are installed with `npx playwright install`

### Logging

The framework uses Winston for logging. Control log level using the `LOG_LEVEL` environment variable:

```
LOG_LEVEL=debug node src/index.js run-tests
```

Log files are stored in the `logs/` directory.

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.