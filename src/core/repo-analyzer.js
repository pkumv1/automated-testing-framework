const fs = require('fs').promises;
const path = require('path');
const { Octokit } = require('@octokit/rest');
const logger = require('../utils/logger');

/**
 * Repository analyzer module that examines GitHub repositories
 * and extracts information about their structure, technologies,
 * and components.
 */
class RepoAnalyzer {
  /**
   * Initialize the analyzer
   * @param {string} token - GitHub token for authentication (optional)
   */
  constructor(token) {
    this.octokit = new Octokit({
      auth: token,
    });
  }

  /**
   * Parse GitHub repository URL to extract owner and repo name
   * @param {string} repoUrl - GitHub repository URL
   * @returns {Object} Object containing owner and repo properties
   */
  parseRepoUrl(repoUrl) {
    // Handle common GitHub URL formats
    let ownerRepo;
    
    try {
      const url = new URL(repoUrl);
      if (url.hostname === 'github.com') {
        // Format: https://github.com/owner/repo
        ownerRepo = url.pathname.substring(1); // Remove leading slash
      } else if (url.hostname.endsWith('github.com')) {
        // Format: owner.github.com/repo or github.com/owner/repo
        ownerRepo = url.pathname.substring(1);
      }
    } catch (e) {
      // Not a URL, might be in format owner/repo
      ownerRepo = repoUrl;
    }
    
    // Split owner/repo format
    const parts = ownerRepo.split('/');
    if (parts.length >= 2) {
      // Clean up repo name (remove .git extension if present)
      const repo = parts[1].replace(/\\.git$/, '');
      return { owner: parts[0], repo };
    }
    
    throw new Error('Invalid GitHub repository URL format');
  }

  /**
   * Analyze a GitHub repository
   * @param {string} repoUrl - GitHub repository URL
   * @param {string} token - GitHub token for authentication (optional)
   * @returns {Object} Analysis result object
   */
  async analyze(repoUrl, token) {
    logger.info(`Analyzing repository: ${repoUrl}`);
    
    // Use provided token or instance token
    if (token) {
      this.octokit = new Octokit({ auth: token });
    }
    
    const { owner, repo } = this.parseRepoUrl(repoUrl);
    logger.info(`Parsed owner: ${owner}, repo: ${repo}`);
    
    try {
      // Get repository information
      const { data: repoData } = await this.octokit.repos.get({
        owner,
        repo,
      });
      
      // Get repository languages
      const { data: languages } = await this.octokit.repos.listLanguages({
        owner,
        repo,
      });
      
      // Get repository contents (root directory)
      const { data: contents } = await this.octokit.repos.getContent({
        owner,
        repo,
        path: '',
      });
      
      // Analyze repository structure
      const structure = this.analyzeStructure(contents);
      
      // Get commit information
      const { data: commits } = await this.octokit.repos.listCommits({
        owner,
        repo,
        per_page: 10,
      });
      
      const result = {
        name: repoData.name,
        fullName: repoData.full_name,
        description: repoData.description,
        url: repoData.html_url,
        createdAt: repoData.created_at,
        updatedAt: repoData.updated_at,
        stars: repoData.stargazers_count,
        forks: repoData.forks_count,
        languages,
        structure,
        commits: commits.map(commit => ({
          sha: commit.sha,
          message: commit.commit.message,
          author: commit.commit.author.name,
          date: commit.commit.author.date,
        })),
        frameworks: this.detectFrameworks(structure, languages),
      };
      
      logger.info(`Analysis complete for ${owner}/${repo}`);
      return result;
    } catch (error) {
      logger.error(`Error analyzing repository: ${error.message}`);
      throw error;
    }
  }

  /**
   * Analyze repository structure based on its contents
   * @param {Array} contents - Repository contents
   * @returns {Object} Structure analysis
   */
  analyzeStructure(contents) {
    const structure = {
      rootFiles: [],
      hasTests: false,
      hasDocs: false,
      hasCI: false,
      configFiles: [],
      packageManagers: [],
    };
    
    // Check common file and directory patterns
    for (const item of contents) {
      if (item.type === 'file') {
        structure.rootFiles.push(item.name);
        
        // Check for configuration files
        if (
          item.name.endsWith('.json') ||
          item.name.endsWith('.yml') ||
          item.name.endsWith('.yaml') ||
          item.name.endsWith('.config.js') ||
          item.name === '.env.example'
        ) {
          structure.configFiles.push(item.name);
        }
        
        // Check for package manager files
        if (item.name === 'package.json') {
          structure.packageManagers.push('npm');
        } else if (item.name === 'yarn.lock') {
          structure.packageManagers.push('yarn');
        } else if (item.name === 'pnpm-lock.yaml') {
          structure.packageManagers.push('pnpm');
        } else if (item.name === 'Gemfile') {
          structure.packageManagers.push('bundler');
        } else if (item.name === 'requirements.txt' || item.name === 'Pipfile') {
          structure.packageManagers.push('pip');
        } else if (item.name === 'go.mod') {
          structure.packageManagers.push('go');
        }
      } else if (item.type === 'dir') {
        // Check for common directories
        const lowerName = item.name.toLowerCase();
        if (
          lowerName === 'test' ||
          lowerName === 'tests' ||
          lowerName === '__tests__' ||
          lowerName === 'spec'
        ) {
          structure.hasTests = true;
        } else if (
          lowerName === 'doc' ||
          lowerName === 'docs' ||
          lowerName === 'documentation'
        ) {
          structure.hasDocs = true;
        } else if (
          lowerName === '.github' ||
          lowerName === '.gitlab' ||
          lowerName === 'ci' ||
          lowerName === '.circleci'
        ) {
          structure.hasCI = true;
        }
      }
    }
    
    return structure;
  }

  /**
   * Detect frameworks used in the repository
   * @param {Object} structure - Repository structure
   * @param {Object} languages - Repository languages
   * @returns {Object} Detected frameworks
   */
  detectFrameworks(structure, languages) {
    const frameworks = {
      javascript: [],
      python: [],
      ruby: [],
      java: [],
      golang: [],
      other: [],
    };
    
    // Check for JavaScript frameworks
    if (languages.JavaScript || languages.TypeScript) {
      const configFiles = structure.configFiles;
      const pkgManager = structure.packageManagers;
      
      if (configFiles.includes('next.config.js')) {
        frameworks.javascript.push('Next.js');
      } else if (configFiles.includes('nuxt.config.js')) {
        frameworks.javascript.push('Nuxt.js');
      } else if (configFiles.includes('angular.json')) {
        frameworks.javascript.push('Angular');
      } else if (configFiles.includes('remix.config.js')) {
        frameworks.javascript.push('Remix');
      }
      
      if (pkgManager.includes('npm') || pkgManager.includes('yarn') || pkgManager.includes('pnpm')) {
        // Further analysis would require examining package.json content
        frameworks.javascript.push('Node.js');
      }
    }
    
    // Check for Python frameworks
    if (languages.Python) {
      if (structure.rootFiles.includes('manage.py')) {
        frameworks.python.push('Django');
      } else if (structure.rootFiles.includes('app.py') || structure.rootFiles.includes('wsgi.py')) {
        frameworks.python.push('Flask');
      } else if (structure.rootFiles.includes('fastapi.py')) {
        frameworks.python.push('FastAPI');
      }
    }
    
    return frameworks;
  }

  /**
   * Save analysis results to a file
   * @param {Object} analysis - Analysis results
   * @param {string} outputPath - Path to save the results
   */
  async saveAnalysis(analysis, outputPath) {
    try {
      // Ensure directory exists
      const directory = path.dirname(outputPath);
      await fs.mkdir(directory, { recursive: true });
      
      // Write analysis to file
      await fs.writeFile(
        outputPath,
        JSON.stringify(analysis, null, 2),
        'utf8'
      );
      
      logger.info(`Analysis saved to ${outputPath}`);
    } catch (error) {
      logger.error(`Error saving analysis: ${error.message}`);
      throw error;
    }
  }
}

// Export a singleton instance
const analyzer = new RepoAnalyzer();
module.exports = analyzer;
