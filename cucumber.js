module.exports = {
  default: {
    paths: ['playwright/features/**/*.feature'],
    require: [
      'playwright/support/**/*.ts',
      'playwright/step-definitions/**/*.ts'
    ],
    requireModule: ['ts-node/register'],
    format: [
      'progress-bar',
      'summary',
      ['html', 'playwright/reports/cucumber-report.html']
    ],
    formatOptions: {
      snippetInterface: 'async-await'
    }
  }
};
