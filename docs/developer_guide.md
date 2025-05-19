# Developer Guide: Extending the Framework

This guide provides detailed information for developers who want to extend or customize the Automated Testing Framework.

## Architecture Overview

The framework follows a modular architecture with clear separation of concerns:

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Repository     │     │  Test            │     │  Test           │
│  Analysis       │──►  │  Generation      │──►  │  Execution      │──┐
└─────────────────┘     └─────────────────┘     └─────────────────┘  │
                                                                     ▼
┌─────────────────┐                             ┌─────────────────┐
│  Risk           │◄────────────────────────────│  Report         │
│  Analysis       │                             │  Generation      │
└─────────────────┘                             └─────────────────┘
```

### Core Components

1. **Repository Analyzer (`src/core/repo-analyzer.js`)**:
   - Parses GitHub repositories
   - Identifies languages, frameworks, and structure
   - Creates analysis summary for test generation

2. **Test Generator (`src/core/test-generator.js`)**:
   - Generates test cases based on repository analysis
   - Creates test specifications for different test types
   - Customizes test approach based on technologies used

3. **Risk Analyzer (`src/core/risk-analyzer.js`)**:
   - Identifies security vulnerabilities
   - Detects code quality issues
   - Generates risk assessment report

4. **Test Runner (`src/core/test-runner.js`)**:
   - Executes tests using appropriate test runners
   - Handles test failures and retries
   - Collects test results

5. **Report Generator (`src/core/report-generator.js`)**:
   - Creates comprehensive test reports
   - Supports multiple formats (HTML, JSON, PDF)
   - Includes metrics and visualizations

## Adding New Test Types

### 1. Define Test Specifications

Create a new JSON file in the `test_cases/` directory following this structure:

```json
[
  {
    "id": "unique-test-id",
    "name": "Test Name",
    "description": "Test description",
    "priority": "high|medium|low",
    "preconditions": "Required preconditions",
    "steps": [
      "Step 1",
      "Step 2",
      "..."
    ],
    "expected_results": [
      "Expected Result 1",
      "Expected Result 2",
      "..."
    ],
    "test_data": {
      "key1": "value1",
      "key2": "value2"
    },
    "custom_attributes": {
      "attribute1": "value1"
    }
  }
]
```

### 2. Create Test Script

Create a new test script file in the appropriate subdirectory of `test_scripts/`:

For Playwright tests:

```javascript
// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('New Test Category', () => {
  test.beforeEach(async ({ page }) => {
    // Setup code
  });

  test('should perform specific action', async ({ page }) => {
    // Test implementation
    await page.goto('/');
    // Assertions
    await expect(page).toHaveTitle(/Expected Title/);
  });
});
```

### 3. Update Test Generator

Modify `src/core/test-generator.js` to handle the new test type:

1. Add a new method for generating the specific test type:
   ```javascript
   generateNewTypeTests(analysis) {
     const newTypeTests = [];
     
     // Generate test cases based on analysis
     newTypeTests.push({
       name: 'Example Test',
       description: 'Description of the test',
       framework: 'Appropriate Test Framework',
       priority: 'Medium',
       type: 'new-type',
     });
     
     return newTypeTests;
   }
   ```

2. Add the new type to the `generateTests` method:
   ```javascript
   async generateTests(analysisPath) {
     // ...existing code...
     
     const testCases = {
       // Existing test types
       unitTests: this.generateUnitTests(analysis),
       // Add your new test type
       newTypeTests: this.generateNewTypeTests(analysis),
     };
     
     // ...rest of the method...
   }
   ```

### 4. Update Test Runner

Modify `src/core/test-runner.js` to execute the new test type:

```javascript
if (testType === 'all' || testType === 'new-type') {
  logger.info('Running new type tests...');
  const newTypeResults = await this.runNewTypeTests();
  results.tests.push(...newTypeResults.tests);
  // Update summary
}

// Add the execution method
async runNewTypeTests() {
  // Implementation for running the new test type
}
```

## Supporting New Repositories or Web Applications

### 1. Update Repository Analyzer

Modify `src/core/repo-analyzer.js` to detect the specific patterns of the new repository type:

```javascript
// Add detection for new frameworks
detectFrameworks(structure, languages) {
  const frameworks = {
    // Existing frameworks
  };
  
  // Add detection for new framework
  if (languages.NewLanguage) {
    if (structure.configFiles.includes('new-framework.config.js')) {
      frameworks.newLanguage.push('NewFramework');
    }
  }
  
  return frameworks;
}
```

### 2. Create Custom Test Cases

Create test cases specifically designed for the new repository or application:

```json
[
  {
    "id": "new-app-001",
    "name": "New Application Test",
    "description": "Test specific to the new application",
    "priority": "high",
    "steps": [
      "Application-specific steps"
    ],
    "expected_results": [
      "Application-specific expectations"
    ]
  }
]
```

### 3. Create Test Scripts

Implement test scripts that target the specific application:

```javascript
test.describe('New Application Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the new application
    await page.goto('https://new-application-url.com');
  });

  test('should perform application-specific action', async ({ page }) => {
    // Test implementation specific to the new application
  });
});
```

## Advanced Customizations

### Custom Test Reporters

Extend the report generation by adding custom reporters in `src/core/report-generator.js`:

```javascript
async generateCustomReport(results, outputDir) {
  // Custom report implementation
}

// Add to generateReports method:
if (format === 'custom' || format === 'all') {
  const customPath = await this.generateCustomReport(results, outputDir);
  reports.custom = customPath;
}
```

### Performance Testing Extensions

To add advanced performance metrics:

1. Update the `test_config/config.json` with new metrics:
   ```json
   "performanceThresholds": {
     "existingMetric": 1000,
     "newMetric": 500
   }
   ```

2. Modify performance test scripts to measure and validate new metrics:
   ```javascript
   test('should meet new performance metric', async ({ page }) => {
     const startTime = Date.now();
     // Action to measure
     const metricValue = Date.now() - startTime;
     console.log(`New metric: ${metricValue}ms`);
     expect(metricValue).toBeLessThan(500); // Based on config
   });
   ```

### Security Testing Extensions

To add new security tests:

1. Update security test configuration in `test_config/config.json`:
   ```json
   "securityTests": {
     "existingTest": true,
     "newSecurityTest": true
   }
   ```

2. Implement the security test in appropriate test scripts:
   ```javascript
   test('should be secure against new vulnerability type', async ({ page }) => {
     // Security test implementation
   });
   ```

## Best Practices

1. **Modular Design**: Keep components focused on a single responsibility
2. **Configuration-Driven**: Make features configurable rather than hardcoded
3. **Comprehensive Logging**: Use detailed logging for debugging and tracing
4. **Error Handling**: Implement robust error handling with meaningful messages
5. **Documentation**: Update documentation when adding new features
6. **Testing**: Test your extensions to ensure they work as expected

## Contributing Guidelines

When contributing to the framework:

1. Create a new branch for your feature
2. Follow the existing code style and patterns
3. Include appropriate documentation
4. Add tests for your new functionality
5. Submit a pull request with a clear description

---

For further assistance or questions, please open an issue on the repository.