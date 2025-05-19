const fs = require('fs').promises;
const path = require('path');
const logger = require('../utils/logger');

/**
 * Test Generator module responsible for creating test cases 
 * based on repository analysis
 */
class TestGenerator {
  /**
   * Generate test cases based on repository analysis
   * @param {string} analysisPath - Path to analysis JSON file
   * @returns {Object} Generated test cases
   */
  async generateTests(analysisPath) {
    try {
      logger.info(`Loading analysis from ${analysisPath}`);
      
      // Read and parse analysis file
      const analysisContent = await fs.readFile(analysisPath, 'utf8');
      const analysis = JSON.parse(analysisContent);
      
      logger.info(`Generating tests for ${analysis.name}`);
      
      // Generate test cases based on repository analysis
      const testCases = {
        unitTests: this.generateUnitTests(analysis),
        integrationTests: this.generateIntegrationTests(analysis),
        e2eTests: this.generateE2ETests(analysis),
        apiTests: this.generateAPITests(analysis),
        performanceTests: this.generatePerformanceTests(analysis),
        securityTests: this.generateSecurityTests(analysis),
      };
      
      logger.info(`Generated ${Object.values(testCases).flat().length} test cases`);
      return testCases;
    } catch (error) {
      logger.error(`Error generating tests: ${error.message}`);
      throw error;
    }
  }

  /**
   * Generate unit tests based on repository analysis
   * @param {Object} analysis - Repository analysis data
   * @returns {Array} Unit test cases
   */
  generateUnitTests(analysis) {
    const unitTests = [];
    const { languages, frameworks } = analysis;
    
    // Determine test framework based on languages
    let testFramework = 'Jest';
    if (languages.Python) {
      testFramework = 'pytest';
    } else if (languages.Java) {
      testFramework = 'JUnit';
    } else if (languages.Ruby) {
      testFramework = 'RSpec';
    } else if (languages.Go) {
      testFramework = 'Go testing';
    }
    
    // Add basic test case template
    unitTests.push({
      name: 'Basic Unit Tests',
      description: 'Basic unit tests for core functionality',
      framework: testFramework,
      priority: 'High',
      type: 'unit',
    });
    
    // Add language-specific test cases
    if (languages.JavaScript || languages.TypeScript) {
      unitTests.push({
        name: 'JavaScript Function Tests',
        description: 'Unit tests for JavaScript functions and modules',
        framework: 'Jest',
        priority: 'High',
        type: 'unit',
        template: 'test_templates/js_unit_test.js',
      });
      
      // Add framework-specific test cases
      if (frameworks.javascript.includes('React') || frameworks.javascript.includes('Next.js')) {
        unitTests.push({
          name: 'React Component Tests',
          description: 'Unit tests for React components',
          framework: 'React Testing Library',
          priority: 'High',
          type: 'unit',
          template: 'test_templates/react_component_test.js',
        });
      }
    }
    
    if (languages.Python) {
      unitTests.push({
        name: 'Python Function Tests',
        description: 'Unit tests for Python functions and modules',
        framework: 'pytest',
        priority: 'High',
        type: 'unit',
        template: 'test_templates/python_unit_test.py',
      });
      
      // Add framework-specific test cases
      if (frameworks.python.includes('Django')) {
        unitTests.push({
          name: 'Django Model Tests',
          description: 'Unit tests for Django models',
          framework: 'Django Test',
          priority: 'High',
          type: 'unit',
          template: 'test_templates/django_model_test.py',
        });
      }
    }
    
    return unitTests;
  }

  /**
   * Generate integration tests based on repository analysis
   * @param {Object} analysis - Repository analysis data
   * @returns {Array} Integration test cases
   */
  generateIntegrationTests(analysis) {
    const integrationTests = [];
    const { languages, frameworks } = analysis;
    
    // Add basic integration test case
    integrationTests.push({
      name: 'Basic Integration Tests',
      description: 'Tests for component interactions',
      priority: 'Medium',
      type: 'integration',
    });
    
    // Add language/framework specific integration tests
    if (languages.JavaScript || languages.TypeScript) {
      if (frameworks.javascript.includes('Node.js')) {
        integrationTests.push({
          name: 'API Integration Tests',
          description: 'Integration tests for API endpoints',
          framework: 'Supertest',
          priority: 'High',
          type: 'integration',
          template: 'test_templates/api_integration_test.js',
        });
      }
      
      if (frameworks.javascript.includes('React') || frameworks.javascript.includes('Next.js')) {
        integrationTests.push({
          name: 'React Component Integration',
          description: 'Integration tests for React component interactions',
          framework: 'React Testing Library',
          priority: 'Medium',
          type: 'integration',
          template: 'test_templates/react_integration_test.js',
        });
      }
    }
    
    if (languages.Python) {
      if (frameworks.python.includes('Django') || frameworks.python.includes('Flask')) {
        integrationTests.push({
          name: 'API Route Integration',
          description: 'Integration tests for API routes',
          framework: 'pytest',
          priority: 'High',
          type: 'integration',
          template: 'test_templates/python_api_integration.py',
        });
      }
    }
    
    return integrationTests;
  }

  /**
   * Generate end-to-end tests based on repository analysis
   * @param {Object} analysis - Repository analysis data
   * @returns {Array} E2E test cases
   */
  generateE2ETests(analysis) {
    const e2eTests = [];
    
    // Add basic E2E test cases
    e2eTests.push({
      name: 'User Flow Tests',
      description: 'End-to-end tests for critical user flows',
      framework: 'Playwright',
      priority: 'High',
      type: 'e2e',
    });
    
    // Add website-specific E2E tests for SauceLabs demo site
    e2eTests.push({
      name: 'SauceDemo Login Tests',
      description: 'Test login functionality on SauceDemo site',
      framework: 'Playwright',
      priority: 'High',
      type: 'e2e',
      template: 'test_templates/saucedemo_login_test.js',
      url: 'https://www.saucedemo.com/'
    });
    
    e2eTests.push({
      name: 'SauceDemo Shopping Cart Tests',
      description: 'Test shopping cart functionality on SauceDemo site',
      framework: 'Playwright',
      priority: 'High',
      type: 'e2e',
      template: 'test_templates/saucedemo_cart_test.js',
      url: 'https://www.saucedemo.com/'
    });
    
    e2eTests.push({
      name: 'SauceDemo Checkout Process Tests',
      description: 'Test checkout process on SauceDemo site',
      framework: 'Playwright',
      priority: 'High',
      type: 'e2e',
      template: 'test_templates/saucedemo_checkout_test.js',
      url: 'https://www.saucedemo.com/'
    });
    
    return e2eTests;
  }

  /**
   * Generate API tests based on repository analysis
   * @param {Object} analysis - Repository analysis data
   * @returns {Array} API test cases
   */
  generateAPITests(analysis) {
    const apiTests = [];
    
    // Add basic API test cases
    apiTests.push({
      name: 'API Endpoint Tests',
      description: 'Tests for API endpoints',
      framework: 'Supertest/Axios',
      priority: 'High',
      type: 'api',
    });
    
    // Add SauceDemo API-related tests
    apiTests.push({
      name: 'SauceDemo API Tests',
      description: 'Tests for SauceDemo API (if available)',
      framework: 'Axios',
      priority: 'Medium',
      type: 'api',
      url: 'https://www.saucedemo.com/api'
    });
    
    return apiTests;
  }

  /**
   * Generate performance tests based on repository analysis
   * @param {Object} analysis - Repository analysis data
   * @returns {Array} Performance test cases
   */
  generatePerformanceTests(analysis) {
    const performanceTests = [];
    
    // Add basic performance test cases
    performanceTests.push({
      name: 'Load Time Tests',
      description: 'Tests for page load time',
      framework: 'Lighthouse',
      priority: 'Medium',
      type: 'performance',
    });
    
    // Add SauceDemo performance tests
    performanceTests.push({
      name: 'SauceDemo Performance Tests',
      description: 'Performance tests for SauceDemo site',
      framework: 'Lighthouse',
      priority: 'Medium',
      type: 'performance',
      template: 'test_templates/saucedemo_performance_test.js',
      url: 'https://www.saucedemo.com/'
    });
    
    return performanceTests;
  }

  /**
   * Generate security tests based on repository analysis
   * @param {Object} analysis - Repository analysis data
   * @returns {Array} Security test cases
   */
  generateSecurityTests(analysis) {
    const securityTests = [];
    
    // Add basic security test cases
    securityTests.push({
      name: 'Authentication Tests',
      description: 'Security tests for authentication',
      framework: 'OWASP ZAP',
      priority: 'High',
      type: 'security',
    });
    
    // Add SauceDemo security tests
    securityTests.push({
      name: 'SauceDemo Security Tests',
      description: 'Security tests for SauceDemo site',
      framework: 'OWASP ZAP',
      priority: 'High',
      type: 'security',
      template: 'test_templates/saucedemo_security_test.js',
      url: 'https://www.saucedemo.com/'
    });
    
    return securityTests;
  }

  /**
   * Save generated test cases to output directory
   * @param {Object} testCases - Generated test cases
   * @param {string} outputDir - Output directory path
   */
  async saveTestCases(testCases, outputDir) {
    try {
      // Ensure output directory exists
      await fs.mkdir(outputDir, { recursive: true });
      
      // Save each test category to a separate file
      for (const [category, tests] of Object.entries(testCases)) {
        const outputPath = path.join(outputDir, `${category}.json`);
        
        await fs.writeFile(
          outputPath,
          JSON.stringify(tests, null, 2),
          'utf8'
        );
        
        logger.info(`Saved ${tests.length} ${category} to ${outputPath}`);
      }
      
      // Save a summary file with all test cases
      const summaryPath = path.join(outputDir, 'all-tests.json');
      await fs.writeFile(
        summaryPath,
        JSON.stringify(testCases, null, 2),
        'utf8'
      );
      
      logger.info(`Saved test case summary to ${summaryPath}`);
    } catch (error) {
      logger.error(`Error saving test cases: ${error.message}`);
      throw error;
    }
  }
}

// Export singleton instance
const generator = new TestGenerator();
module.exports = generator;
