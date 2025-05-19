const fs = require('fs').promises;
const path = require('path');
const logger = require('../utils/logger');

/**
 * Report Generator module for creating test reports
 */
class ReportGenerator {
  /**
   * Generate test reports based on test results
   * @param {string} resultsDir - Directory containing test results
   * @param {string} outputDir - Output directory for reports
   * @param {string} format - Report format (html, pdf, json)
   * @returns {Object} Generated report paths
   */
  async generateReports(resultsDir, outputDir, format = 'html') {
    logger.info(`Generating ${format} reports from ${resultsDir} to ${outputDir}`);
    
    try {
      // Ensure output directory exists
      await fs.mkdir(outputDir, { recursive: true });
      
      // Find result files
      const files = await fs.readdir(resultsDir);
      const resultFiles = files.filter(file => 
        file.startsWith('test-results-') && file.endsWith('.json')
      );
      
      if (resultFiles.length === 0) {
        throw new Error(`No test result files found in ${resultsDir}`);
      }
      
      // Get the latest result file
      resultFiles.sort().reverse(); // Sort in descending order
      const latestResultFile = resultFiles[0];
      const resultPath = path.join(resultsDir, latestResultFile);
      
      // Read and parse result file
      const resultData = await fs.readFile(resultPath, 'utf8');
      const results = JSON.parse(resultData);
      
      // Generate different report formats
      const reports = {};
      
      if (format === 'html' || format === 'all') {
        const htmlPath = await this.generateHtmlReport(results, outputDir);
        reports.html = htmlPath;
      }
      
      if (format === 'pdf' || format === 'all') {
        const pdfPath = await this.generatePdfReport(results, outputDir);
        reports.pdf = pdfPath;
      }
      
      if (format === 'json' || format === 'all') {
        const jsonPath = await this.generateJsonReport(results, outputDir);
        reports.json = jsonPath;
      }
      
      logger.info(`Reports generated: ${Object.keys(reports).join(', ')}`);
      return reports;
    } catch (error) {
      logger.error(`Error generating reports: ${error.message}`);
      throw error;
    }
  }

  /**
   * Generate HTML report
   * @param {Object} results - Test results
   * @param {string} outputDir - Output directory
   * @returns {string} Path to generated HTML report
   */
  async generateHtmlReport(results, outputDir) {
    logger.info('Generating HTML report...');
    
    try {
      // Create filename with timestamp
      const timestamp = new Date().toISOString().replace(/:/g, '-');
      const filename = `test-report-${timestamp}.html`;
      const outputPath = path.join(outputDir, filename);
      
      // Calculate statistics
      const passRate = results.summary.total > 0 
        ? (results.summary.passed / results.summary.total * 100).toFixed(2)
        : '0.00';
      
      // Generate HTML content
      const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Test Report - ${timestamp}</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
      color: #333;
    }
    h1, h2, h3 {
      color: #222;
    }
    .summary {
      background-color: #f5f5f5;
      padding: 20px;
      border-radius: 5px;
      margin-bottom: 20px;
    }
    .stats {
      display: flex;
      flex-wrap: wrap;
      gap: 20px;
      margin-bottom: 20px;
    }
    .stat-box {
      padding: 15px;
      border-radius: 5px;
      min-width: 150px;
      box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    }
    .total {
      background-color: #e3f2fd;
      border-left: 5px solid #2196f3;
    }
    .passed {
      background-color: #e8f5e9;
      border-left: 5px solid #4caf50;
    }
    .failed {
      background-color: #ffebee;
      border-left: 5px solid #f44336;
    }
    .skipped {
      background-color: #fff8e1;
      border-left: 5px solid #ffc107;
    }
    .tests {
      margin-top: 30px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
    }
    th, td {
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid #ddd;
    }
    th {
      background-color: #f8f8f8;
    }
    tr:hover {
      background-color: #f5f5f5;
    }
    .status-passed {
      color: #4caf50;
      font-weight: bold;
    }
    .status-failed {
      color: #f44336;
      font-weight: bold;
    }
    .status-skipped {
      color: #ff9800;
      font-weight: bold;
    }
    .error-message {
      background-color: #ffebee;
      padding: 10px;
      border-left: 5px solid #f44336;
      font-family: monospace;
      white-space: pre-wrap;
      margin-top: 10px;
    }
    .test-duration {
      color: #777;
      font-size: 0.9em;
    }
    .timestamp {
      color: #777;
      font-size: 0.9em;
      margin-bottom: 20px;
    }
    .progress-bar {
      height: 20px;
      background-color: #e0e0e0;
      border-radius: 10px;
      margin: 20px 0;
      overflow: hidden;
    }
    .progress-fill {
      height: 100%;
      background-color: #4caf50;
      width: ${passRate}%;
    }
  </style>
</head>
<body>
  <h1>Test Execution Report</h1>
  <div class="timestamp">Generated on: ${new Date().toLocaleString()}</div>
  
  <div class="summary">
    <h2>Summary</h2>
    <div class="progress-bar">
      <div class="progress-fill"></div>
    </div>
    <p>Pass Rate: <strong>${passRate}%</strong></p>
    
    <div class="stats">
      <div class="stat-box total">
        <h3>Total Tests</h3>
        <div class="stat-value">${results.summary.total}</div>
      </div>
      <div class="stat-box passed">
        <h3>Passed</h3>
        <div class="stat-value">${results.summary.passed}</div>
      </div>
      <div class="stat-box failed">
        <h3>Failed</h3>
        <div class="stat-value">${results.summary.failed}</div>
      </div>
      <div class="stat-box skipped">
        <h3>Skipped</h3>
        <div class="stat-value">${results.summary.skipped}</div>
      </div>
    </div>
    
    <p>Total Duration: ${(results.summary.duration / 1000).toFixed(2)} seconds</p>
  </div>
  
  <div class="tests">
    <h2>Test Results</h2>
    <table>
      <thead>
        <tr>
          <th>Test Name</th>
          <th>Suite</th>
          <th>Status</th>
          <th>Duration</th>
        </tr>
      </thead>
      <tbody>
        ${results.tests.map(test => `
          <tr>
            <td>${test.name}</td>
            <td>${test.suite}</td>
            <td class="status-${test.status}">${test.status.toUpperCase()}</td>
            <td class="test-duration">${(test.duration / 1000).toFixed(2)}s</td>
          </tr>
          ${test.error ? `
          <tr>
            <td colspan="4">
              <div class="error-message">${test.error}</div>
            </td>
          </tr>
          ` : ''}
        `).join('')}
      </tbody>
    </table>
  </div>
</body>
</html>
      `;
      
      // Write HTML report to file
      await fs.writeFile(outputPath, htmlContent, 'utf8');
      
      logger.info(`HTML report generated: ${outputPath}`);
      return outputPath;
    } catch (error) {
      logger.error(`Error generating HTML report: ${error.message}`);
      throw error;
    }
  }

  /**
   * Generate PDF report
   * @param {Object} results - Test results
   * @param {string} outputDir - Output directory
   * @returns {string} Path to generated PDF report
   */
  async generatePdfReport(results, outputDir) {
    logger.info('Generating PDF report...');
    
    // For the demo, we'll just create a placeholder file
    // In a real implementation, this would generate a PDF using a library
    
    try {
      // Create filename with timestamp
      const timestamp = new Date().toISOString().replace(/:/g, '-');
      const filename = `test-report-${timestamp}.pdf`;
      const outputPath = path.join(outputDir, filename);
      
      // Write a placeholder file
      await fs.writeFile(
        outputPath,
        '[PDF REPORT PLACEHOLDER - In a real implementation, this would be a PDF file]',
        'utf8'
      );
      
      logger.info(`PDF report placeholder generated: ${outputPath}`);
      return outputPath;
    } catch (error) {
      logger.error(`Error generating PDF report: ${error.message}`);
      throw error;
    }
  }

  /**
   * Generate JSON report
   * @param {Object} results - Test results
   * @param {string} outputDir - Output directory
   * @returns {string} Path to generated JSON report
   */
  async generateJsonReport(results, outputDir) {
    logger.info('Generating JSON report...');
    
    try {
      // Create filename with timestamp
      const timestamp = new Date().toISOString().replace(/:/g, '-');
      const filename = `test-report-${timestamp}.json`;
      const outputPath = path.join(outputDir, filename);
      
      // Add report metadata
      const reportData = {
        metadata: {
          generated: new Date().toISOString(),
          title: 'Test Execution Report',
          format: 'json',
        },
        results,
      };
      
      // Write JSON report to file
      await fs.writeFile(
        outputPath,
        JSON.stringify(reportData, null, 2),
        'utf8'
      );
      
      logger.info(`JSON report generated: ${outputPath}`);
      return outputPath;
    } catch (error) {
      logger.error(`Error generating JSON report: ${error.message}`);
      throw error;
    }
  }
}

// Export singleton instance
const generator = new ReportGenerator();
module.exports = generator;
