require('dotenv').config();
const { Command } = require('commander');
const repoAnalyzer = require('./core/repo-analyzer');
const testGenerator = require('./core/test-generator');
const riskAnalyzer = require('./core/risk-analyzer');
const testRunner = require('./core/test-runner');
const reportGenerator = require('./core/report-generator');
const logger = require('./utils/logger');

const program = new Command();

program
  .name('test-framework')
  .description('Automated Testing Framework for GitHub repositories')
  .version('1.0.0');

program
  .command('analyze')
  .description('Analyze GitHub repository structure')
  .argument('<repo-url>', 'GitHub repository URL')
  .option('-o, --output <path>', 'Output file path', './results/analysis.json')
  .option('-t, --token <token>', 'GitHub token for private repositories')
  .action(async (repoUrl, options) => {
    try {
      logger.info(`Starting analysis of repository: ${repoUrl}`);
      const analysis = await repoAnalyzer.analyze(repoUrl, options.token);
      await repoAnalyzer.saveAnalysis(analysis, options.output);
      logger.info(`Analysis complete. Results saved to ${options.output}`);
    } catch (error) {
      logger.error(`Analysis failed: ${error.message}`);
      process.exit(1);
    }
  });

program
  .command('generate-tests')
  .description('Generate test cases based on repository analysis')
  .argument('<analysis-path>', 'Path to analysis JSON file')
  .option('-o, --output <path>', 'Output directory', './test_cases')
  .action(async (analysisPath, options) => {
    try {
      logger.info(`Generating tests based on analysis: ${analysisPath}`);
      const testCases = await testGenerator.generateTests(analysisPath);
      await testGenerator.saveTestCases(testCases, options.output);
      logger.info(`Test generation complete. Results saved to ${options.output}`);
    } catch (error) {
      logger.error(`Test generation failed: ${error.message}`);
      process.exit(1);
    }
  });

program
  .command('analyze-risks')
  .description('Analyze repository for risks and vulnerabilities')
  .argument('<repo-path>', 'Path to local repository')
  .option('-o, --output <path>', 'Output file path', './results/risks.json')
  .action(async (repoPath, options) => {
    try {
      logger.info(`Analyzing risks in repository: ${repoPath}`);
      const risks = await riskAnalyzer.analyzeRisks(repoPath);
      await riskAnalyzer.saveRiskAnalysis(risks, options.output);
      logger.info(`Risk analysis complete. Results saved to ${options.output}`);
    } catch (error) {
      logger.error(`Risk analysis failed: ${error.message}`);
      process.exit(1);
    }
  });

program
  .command('run-tests')
  .description('Run generated tests against repository')
  .argument('<test-dir>', 'Directory containing test cases')
  .option('-t, --test-type <type>', 'Type of tests to run (unit, integration, e2e, all)', 'all')
  .option('-r, --results <path>', 'Results output directory', './results')
  .action(async (testDir, options) => {
    try {
      logger.info(`Running tests from directory: ${testDir}`);
      const results = await testRunner.runTests(testDir, options.testType);
      await testRunner.saveResults(results, options.results);
      logger.info(`Tests complete. Results saved to ${options.results}`);
    } catch (error) {
      logger.error(`Test execution failed: ${error.message}`);
      process.exit(1);
    }
  });

program
  .command('generate-report')
  .description('Generate test reports based on test results')
  .argument('<results-dir>', 'Directory containing test results')
  .option('-o, --output <path>', 'Output directory for reports', './results/reports')
  .option('-f, --format <format>', 'Report format (html, pdf, json)', 'html')
  .action(async (resultsDir, options) => {
    try {
      logger.info(`Generating test reports from: ${resultsDir}`);
      await reportGenerator.generateReports(resultsDir, options.output, options.format);
      logger.info(`Report generation complete. Reports saved to ${options.output}`);
    } catch (error) {
      logger.error(`Report generation failed: ${error.message}`);
      process.exit(1);
    }
  });

program.parse(process.argv);
