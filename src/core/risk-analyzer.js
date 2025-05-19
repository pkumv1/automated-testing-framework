const fs = require('fs').promises;
const path = require('path');
const logger = require('../utils/logger');

/**
 * Risk Analyzer module for identifying potential vulnerabilities
 * and security issues in repositories
 */
class RiskAnalyzer {
  /**
   * Analyze repository for risks and vulnerabilities
   * @param {string} repoPath - Path to local repository
   * @returns {Object} Risk analysis results
   */
  async analyzeRisks(repoPath) {
    logger.info(`Analyzing risks in repository: ${repoPath}`);
    
    try {
      // Check if path exists
      await fs.access(repoPath);
      
      // Analyze different types of risks
      const securityRisks = await this.analyzeSecurityRisks(repoPath);
      const codeQualityRisks = await this.analyzeCodeQuality(repoPath);
      const configurationRisks = await this.analyzeConfiguration(repoPath);
      
      const risks = {
        securityRisks,
        codeQualityRisks,
        configurationRisks,
        summary: {
          totalRisks: 
            securityRisks.length + 
            codeQualityRisks.length + 
            configurationRisks.length,
          highRisks: this.countRisksByLevel(
            [...securityRisks, ...codeQualityRisks, ...configurationRisks],
            'high'
          ),
          mediumRisks: this.countRisksByLevel(
            [...securityRisks, ...codeQualityRisks, ...configurationRisks],
            'medium'
          ),
          lowRisks: this.countRisksByLevel(
            [...securityRisks, ...codeQualityRisks, ...configurationRisks],
            'low'
          ),
        },
      };
      
      logger.info(`Risk analysis complete. Found ${risks.summary.totalRisks} potential risks.`);
      return risks;
    } catch (error) {
      logger.error(`Error analyzing risks: ${error.message}`);
      throw error;
    }
  }

  /**
   * Count risks by severity level
   * @param {Array} risks - Array of risk objects
   * @param {string} level - Risk level to count ('high', 'medium', 'low')
   * @returns {number} Count of risks with the specified level
   */
  countRisksByLevel(risks, level) {
    return risks.filter(risk => risk.level.toLowerCase() === level).length;
  }

  /**
   * Analyze security risks in the repository
   * @param {string} repoPath - Path to local repository
   * @returns {Array} Security risks found
   */
  async analyzeSecurityRisks(repoPath) {
    logger.info('Analyzing security risks...');
    
    const securityRisks = [];
    
    try {
      // Check for .env files with potential secrets
      const envFiles = await this.findFiles(repoPath, '.env');
      if (envFiles.length > 0) {
        securityRisks.push({
          type: 'secret_exposure',
          description: 'Environment files (.env) found which may contain secrets',
          level: 'high',
          files: envFiles,
          remediation: 'Ensure .env files are added to .gitignore and use .env.example instead'
        });
      }
      
      // Look for hardcoded secrets in common file types
      const potentialSecretFiles = await this.findFiles(repoPath, '.js|.py|.java|.rb|.config');
      const hardcodedSecrets = await this.scanForSecrets(potentialSecretFiles);
      if (hardcodedSecrets.length > 0) {
        securityRisks.push({
          type: 'hardcoded_secrets',
          description: 'Potential hardcoded secrets detected in code files',
          level: 'high',
          files: hardcodedSecrets,
          remediation: 'Remove hardcoded secrets and use environment variables instead'
        });
      }
      
      // Check for dependency vulnerabilities
      if (await this.fileExists(path.join(repoPath, 'package.json'))) {
        securityRisks.push({
          type: 'dependency_check',
          description: 'Node.js project: Dependencies should be scanned for vulnerabilities',
          level: 'medium',
          remediation: 'Run npm audit or yarn audit to check for vulnerable dependencies'
        });
      }
      
      // Check for insecure auth mechanisms
      if (await this.fileExists(path.join(repoPath, 'auth')) ||
          await this.fileExists(path.join(repoPath, 'authentication'))) {
        securityRisks.push({
          type: 'auth_review',
          description: 'Authentication mechanisms should be reviewed for security',
          level: 'medium',
          remediation: 'Ensure proper authentication practices like password hashing, rate limiting'
        });
      }
      
      // Add SauceDemo specific security risks
      securityRisks.push({
        type: 'login_security',
        description: 'SauceDemo login page should be tested for security vulnerabilities',
        level: 'high',
        url: 'https://www.saucedemo.com/',
        remediation: 'Test for SQL injection, XSS, and CSRF vulnerabilities'
      });
      
      securityRisks.push({
        type: 'checkout_security',
        description: 'SauceDemo checkout process should be tested for security vulnerabilities',
        level: 'high',
        url: 'https://www.saucedemo.com/checkout-step-one.html',
        remediation: 'Test for data validation, input sanitization, and secure form submissions'
      });
      
      return securityRisks;
    } catch (error) {
      logger.error(`Error analyzing security risks: ${error.message}`);
      return [{
        type: 'analysis_error',
        description: `Error during security analysis: ${error.message}`,
        level: 'medium',
        remediation: 'Review repository manually for security issues'
      }];
    }
  }

  /**
   * Analyze code quality issues in the repository
   * @param {string} repoPath - Path to local repository
   * @returns {Array} Code quality risks found
   */
  async analyzeCodeQuality(repoPath) {
    logger.info('Analyzing code quality...');
    
    const codeQualityRisks = [];
    
    try {
      // Check for linting configuration
      const hasEslint = await this.fileExists(path.join(repoPath, '.eslintrc'));
      const hasPrettier = await this.fileExists(path.join(repoPath, '.prettierrc'));
      
      if (!hasEslint && !hasPrettier) {
        codeQualityRisks.push({
          type: 'no_linting',
          description: 'No linting or code formatting configuration found',
          level: 'low',
          remediation: 'Add ESLint and/or Prettier for consistent code quality'
        });
      }
      
      // Check for test coverage
      const testDirs = [
        'test',
        'tests',
        '__tests__',
        'spec',
        'specs'
      ];
      
      let hasTests = false;
      for (const dir of testDirs) {
        if (await this.fileExists(path.join(repoPath, dir))) {
          hasTests = true;
          break;
        }
      }
      
      if (!hasTests) {
        codeQualityRisks.push({
          type: 'no_tests',
          description: 'No test directory found in the repository',
          level: 'medium',
          remediation: 'Add unit and integration tests to ensure code quality'
        });
      }
      
      // Add SauceDemo specific code quality checks
      codeQualityRisks.push({
        type: 'web_accessibility',
        description: 'SauceDemo website should be tested for accessibility issues',
        level: 'medium',
        url: 'https://www.saucedemo.com/',
        remediation: 'Run accessibility tests to ensure compliance with WCAG standards'
      });
      
      return codeQualityRisks;
    } catch (error) {
      logger.error(`Error analyzing code quality: ${error.message}`);
      return [{
        type: 'analysis_error',
        description: `Error during code quality analysis: ${error.message}`,
        level: 'low',
        remediation: 'Review repository manually for code quality issues'
      }];
    }
  }

  /**
   * Analyze configuration issues in the repository
   * @param {string} repoPath - Path to local repository
   * @returns {Array} Configuration risks found
   */
  async analyzeConfiguration(repoPath) {
    logger.info('Analyzing configuration...');
    
    const configRisks = [];
    
    try {
      // Check for CI/CD configuration
      const ciConfigs = [
        '.github/workflows',
        '.gitlab-ci.yml',
        '.travis.yml',
        '.circleci/config.yml',
        'Jenkinsfile'
      ];
      
      let hasCiConfig = false;
      for (const config of ciConfigs) {
        if (await this.fileExists(path.join(repoPath, config))) {
          hasCiConfig = true;
          break;
        }
      }
      
      if (!hasCiConfig) {
        configRisks.push({
          type: 'no_ci_cd',
          description: 'No CI/CD configuration found',
          level: 'low',
          remediation: 'Add CI/CD configuration for automated testing and deployment'
        });
      }
      
      // Check for package lock files
      const hasPackageJson = await this.fileExists(path.join(repoPath, 'package.json'));
      const hasPackageLock = await this.fileExists(path.join(repoPath, 'package-lock.json')) || 
                              await this.fileExists(path.join(repoPath, 'yarn.lock'));
      
      if (hasPackageJson && !hasPackageLock) {
        configRisks.push({
          type: 'no_package_lock',
          description: 'package.json exists but no lock file found',
          level: 'low',
          remediation: 'Add package-lock.json or yarn.lock for dependency consistency'
        });
      }
      
      // Add SauceDemo specific configuration checks
      configRisks.push({
        type: 'browser_compatibility',
        description: 'SauceDemo should be tested across multiple browsers',
        level: 'medium',
        url: 'https://www.saucedemo.com/',
        remediation: 'Configure tests to run on Chrome, Firefox, and Safari browsers'
      });
      
      return configRisks;
    } catch (error) {
      logger.error(`Error analyzing configuration: ${error.message}`);
      return [{
        type: 'analysis_error',
        description: `Error during configuration analysis: ${error.message}`,
        level: 'low',
        remediation: 'Review repository manually for configuration issues'
      }];
    }
  }

  /**
   * Check if a file or directory exists
   * @param {string} filePath - Path to check
   * @returns {boolean} True if file exists, false otherwise
   */
  async fileExists(filePath) {
    try {
      await fs.access(filePath);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Find files matching a pattern in the repository
   * @param {string} repoPath - Path to local repository
   * @param {string} pattern - File pattern to match (extension)
   * @returns {Array} Array of matching file paths
   */
  async findFiles(repoPath, pattern) {
    // This is a simplified implementation
    // In a real implementation, this would recursively search directories
    const regex = new RegExp(`(${pattern})$`);
    const results = [];
    
    try {
      // Read top-level directory
      const files = await fs.readdir(repoPath);
      
      // Check each file
      for (const file of files) {
        const filePath = path.join(repoPath, file);
        const stats = await fs.stat(filePath);
        
        if (stats.isFile() && regex.test(file)) {
          results.push(filePath);
        }
      }
      
      return results;
    } catch (error) {
      logger.error(`Error finding files: ${error.message}`);
      return [];
    }
  }

  /**
   * Scan files for potential hardcoded secrets
   * @param {Array} files - Array of file paths to scan
   * @returns {Array} Array of files with potential secrets
   */
  async scanForSecrets(files) {
    // This is a simplified implementation
    // In a real implementation, this would use regex patterns to identify secrets
    const secretPatterns = [
      /api[_-]?key/i,
      /auth[_-]?token/i,
      /password/i,
      /secret/i,
      /credential/i
    ];
    
    const results = [];
    
    try {
      for (const file of files) {
        const content = await fs.readFile(file, 'utf8');
        
        for (const pattern of secretPatterns) {
          if (pattern.test(content)) {
            results.push(file);
            break; // Only add the file once
          }
        }
      }
      
      return results;
    } catch (error) {
      logger.error(`Error scanning for secrets: ${error.message}`);
      return [];
    }
  }

  /**
   * Save risk analysis results to a file
   * @param {Object} risks - Risk analysis results
   * @param {string} outputPath - Path to save the results
   */
  async saveRiskAnalysis(risks, outputPath) {
    try {
      // Ensure directory exists
      const directory = path.dirname(outputPath);
      await fs.mkdir(directory, { recursive: true });
      
      // Write risks to file
      await fs.writeFile(
        outputPath,
        JSON.stringify(risks, null, 2),
        'utf8'
      );
      
      logger.info(`Risk analysis saved to ${outputPath}`);
    } catch (error) {
      logger.error(`Error saving risk analysis: ${error.message}`);
      throw error;
    }
  }
}

// Export singleton instance
const analyzer = new RiskAnalyzer();
module.exports = analyzer;
