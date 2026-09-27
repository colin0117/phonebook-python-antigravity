module.exports = {
  default: {
    paths: ['features/**/*.feature'],
    require: [
      'support/**/*.ts',
      'step-definitions/**/*.ts'
    ],
    requireModule: ['ts-node/register'],
    format: [
      'progress-bar',
      'summary',
      ['html', 'reports/cucumber-report.html']
    ],
    formatOptions: {
      snippetInterface: 'async-await'
    }
  }
};
