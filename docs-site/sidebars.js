/**
 * Creating a sidebar enables you to:
 * - create an ordered group of docs
 * - render a sidebar for each doc of that group
 * - provide next/previous navigation
 *
 * The sidebars can be generated from the filesystem, or explicitly defined here.
 *
 * Create as many sidebars as you want.
 */

module.exports = {
  // Main documentation sidebar
  tutorialSidebar: [
    'README',
    {
      type: 'category',
      label: '🚀 Getting Started',
      items: [
        'setup-deployment',
        'database-schema',
      ],
    },
    {
      type: 'category',
      label: '🏗️ Builders',
      items: [
        'database-builder',
        'workflow-builder',
      ],
    },
    {
      type: 'category',
      label: '📚 Technical Documentation',
      items: [
        'api-endpoints',
        'form-submissions',
      ],
    },
  ],
};