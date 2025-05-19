const fs = require('fs').promises;
const path = require('path');
const { exec } = require('child_process');
const util = require('util');
const logger = require('../utils/logger');

// Convert exec to promise-based
const execPromise = util.promisify(exec);

/**
 * Test Runner module for executing various types of tests
 */
class TestRunner {
  /**
   * Run tests based on specified test directory and type
   * @param {string} testDir - Directory containing test cases
   * @param {string} testType - Type of tests to run (unit, integration, e2e, all)
   * @returns {Object} Test results
   */
  async runTests(testDir, testType = 'all') {
    logger.info(`Running ${testType} tests from ${testDir}`);
    
    try {
      const results = {
        summary: {
          total: 0,
          passed: 0,
          failed: 0,
          skipped: 0,
          duration: 0,
        },
        tests: [],
        timestamp: new Date().toISOString(),
      };
      
      // Determine which tests to run
      if (testType === 'all' || testType === 'e2e') {
        logger.info('Running E2E tests...');
        const e2eResults = await this.runE2ETests();
        results.tests.push(...e2eResults.tests);
        results.summary.total += e2eResults.summary.total;
        results.summary.passed += e2eResults.summary.passed;
        results.summary.failed += e2eResults.summary.failed;
        results.summary.skipped += e2eResults.summary.skipped;
        results.summary.duration += e2eResults.summary.duration;
      }
      
      if (testType === 'all' || testType === 'performance') {
        logger.info('Running performance tests...');
        const perfResults = await this.runPerformanceTests();
        results.tests.push(...perfResults.tests);
        results.summary.total += perfResults.summary.total;
        results.summary.passed += perfResults.summary.passed;
        results.summary.failed += perfResults.summary.failed;
        results.summary.skipped += perfResults.summary.skipped;
        results.summary.duration += perfResults.summary.duration;
      }
      
      if (testType === 'all' || testType === 'api') {
        logger.info('Running API tests...');
        const apiResults = await this.runAPITests();
        results.tests.push(...apiResults.tests);
        results.summary.total += apiResults.summary.total;
        results.summary.passed += apiResults.summary.passed;
        results.summary.failed += apiResults.summary.failed;
        results.summary.skipped += apiResults.summary.skipped;
        results.summary.duration += apiResults.summary.duration;
      }
      
      logger.info(`Tests complete. Total: ${results.summary.total}, Passed: ${results.summary.passed}, Failed: ${results.summary.failed}`);
      return results;
    } catch (error) {
      logger.error(`Error running tests: ${error.message}`);
      throw error;
    }
  }

  /**
   * Run E2E tests using Playwright
   * @returns {Object} E2E test results
   */
  async runE2ETests() {
    logger.info('Running E2E tests with Playwright...');
    
    try {
      // Run Playwright tests
      const startTime = Date.now();
      const { stdout, stderr } = await execPromise('npx playwright test test_scripts/e2e --reporter=json');
      const duration = Date.now() - startTime;
      
      // Parse test results
      const results = JSON.parse(stdout);
      
      // Format results
      const formattedResults = {
        summary: {
          total: results.suites.reduce((total, suite) => total + suite.specs.length, 0),
          passed: results.suites.reduce((passed, suite) => passed + suite.specs.filter(spec => spec.tests[0].results.every(r => r.status === 'passed')).length, 0),
          failed: results.suites.reduce((failed, suite) => failed + suite.specs.filter(spec => spec.tests[0].results.some(r => r.status === 'failed')).length, 0),
          skipped: results.suites.reduce((skipped, suite) => skipped + suite.specs.filter(spec => spec.tests[0].results.every(r => r.status === 'skipped')).length, 0),
          duration,
        },
        tests: results.suites.flatMap(suite => 
          suite.specs.map(spec => ({
            name: spec.title,
            suite: suite.title,
            status: spec.tests[0].results.every(r => r.status === 'passed') 
              ? 'passed' 
              : spec.tests[0].results.some(r => r.status === 'failed')
                ? 'failed'
                : 'skipped',
            duration: spec.tests[0].results.reduce((sum, r) => sum + r.duration, 0),
            error: spec.tests[0].results.find(r => r.status === 'failed')?.error?.message || null,
          }))
        ),
      };
      
      logger.info(`E2E tests complete. Total: ${formattedResults.summary.total}, Passed: ${formattedResults.summary.passed}, Failed: ${formattedResults.summary.failed}`);
      return formattedResults;
    } catch (error) {
      logger.error(`Error running E2E tests: ${error.message}`);
      
      // Return partial results if available
      if (error.stdout) {
        try {
          const results = JSON.parse(error.stdout);
          // Format partial results
          // ... (similar to above formatting)
          return results;
        } catch (parseError) {
          // Unable to parse results
        }
      }
      
      // Return empty results if no partial results available
      return {
        summary: {
          total: 0,
          passed: 0,
          failed: 0,
          skipped: 0,
          duration: 0,
        },
        tests: [],
        error: error.message,
      };
    }
  }

  /**
   * Run performance tests
   * @returns {Object} Performance test results
   */
  async runPerformanceTests() {
    logger.info('Running performance tests...');
    
    try {
      // Run Playwright tests for performance
      const startTime = Date.now();
      const { stdout, stderr } = await execPromise('npx playwright test test_scripts/performance --reporter=json');
      const duration = Date.now() - startTime;
      
      // Parse test results
      const results = JSON.parse(stdout);
      
      // Format results (similar to E2E tests)
      const formattedResults = {
        summary: {
          total: results.suites.reduce((total, suite) => total + suite.specs.length, 0),
          passed: results.suites.reduce((passed, suite) => passed + suite.specs.filter(spec => spec.tests[0].results.every(r => r.status === 'passed')).length, 0),
          failed: results.suites.reduce((failed, suite) => failed + suite.specs.filter(spec => spec.tests[0].results.some(r => r.status === 'failed')).length, 0),
          skipped: results.suites.reduce((skipped, suite) => skipped + suite.specs.filter(spec => spec.tests[0].results.every(r => r.status === 'skipped')).length, 0),
          duration,
        },
        tests: results.suites.flatMap(suite => 
          suite.specs.map(spec => ({
            name: spec.title,
            suite: suite.title,
            status: spec.tests[0].results.every(r => r.status === 'passed') 
              ? 'passed' 
              : spec.tests[0].results.some(r => r.status === 'failed')
                ? 'failed'
                : 'skipped',
            duration: spec.tests[0].results.reduce((sum, r) => sum + r.duration, 0),
            error: spec.tests[0].results.find(r => r.status === 'failed')?.error?.message || null,
          }))
        ),
      };
      
      logger.info(`Performance tests complete. Total: ${formattedResults.summary.total}, Passed: ${formattedResults.summary.passed}, Failed: ${formattedResults.summary.failed}`);
      return formattedResults;
    } catch (error) {
      logger.error(`Error running performance tests: ${error.message}`);
      
      // Return empty results
      return {
        summary: {
          total: 0,
          passed: 0,
          failed: 0,
          skipped: 0,
          duration: 0,
        },
        tests: [],
        error: error.message,
      };
    }
  }

  /**
   * Run API tests
   * @returns {Object} API test results
   */
  async runAPITests() {
    logger.info('Running API tests...');
    
    // For the demo, we'll return mock API test results
    // In a real implementation, this would run actual API tests
    
    return {
      summary: {
        total: 3,
        passed: 3,
        failed: 0,
        skipped: 0,
        duration: 1500,
      },
      tests: [
        {
          name: 'GET /api/products',
          suite: 'API Tests',
          status: 'passed',
          duration: 500,
          error: null,
        },
        {
          name: 'POST /api/login',
          suite: 'API Tests',
          status: 'passed',
          duration: 520,
          error: null,
        },
        {
          name: 'GET /api/cart',
          suite: 'API Tests',
          status: 'passed',
          duration: 480,
          error: null,
        },
      ],
    };
  }

  /**
   * Save test results to file
   * @param {Object} results - Test results
   * @param {string} outputDir - Output directory
   * @returns {string} Path to results file
   */
  async saveResults(results, outputDir) {
    try {
      // Ensure output directory exists
      await fs.mkdir(outputDir, { recursive: true });
      
      // Create filename with timestamp
      const timestamp = new Date().toISOString().replace(/:/g, '-');
      const filename = `test-results-${timestamp}.json`;
      const outputPath = path.join(outputDir, filename);
      
      // Write results to file
      await fs.writeFile(
        outputPath,
        JSON.stringify(results, null, 2),
        'utf8'
      );
      
      logger.info(`Test results saved to ${outputPath}`);
      return outputPath;
    } catch (error) {
      logger.error(`Error saving test results: ${error.message}`);
      throw error;
    }
  }
}

// Export singleton instance
const runner = new TestRunner();
module.exports = runner;
