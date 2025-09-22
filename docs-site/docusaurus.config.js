const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');

// With JSDoc @type annotations, IDEs can provide config autocompletion
/** @type {import('@docusaurus/types').DocusaurusConfig} */
(module.exports = {
  title: 'TFG-Galetto-Alejo Documentation',
  tagline: 'Complete project documentation for AutomateSMB',
  url: 'https://your-domain.com',
  baseUrl: '/',
  onBrokenLinks: 'warn',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/favicon.ico',
  organizationName: 'alejogaletto', // Usually your GitHub org/user name.
  projectName: 'TFG-Galetto-Alejo', // Usually your repo name.

  presets: [
    [
      '@docusaurus/preset-classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          // Please change this to your repo.
          editUrl: 'https://github.com/alejogaletto/TFG-Galetto-Alejo/edit/main/docs/',
        },
        blog: {
          showReadingTime: true,
          // Please change this to your repo.
          editUrl:
            'https://github.com/facebook/docusaurus/edit/main/website/blog/',
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      navbar: {
        title: 'TFG Documentation',
        logo: {
          alt: 'TFG Logo',
          src: 'img/logo.svg',
        },
        items: [
          {
            type: 'doc',
            docId: 'README',
            position: 'left',
            label: 'Documentation',
          },
          {
            href: 'https://github.com/alejogaletto/TFG-Galetto-Alejo',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Documentation',
            items: [
              {
                label: 'Workflow Builder',
                to: '/docs/workflow-builder',
              },
              {
                label: 'Database Builder',
                to: '/docs/database-builder',
              },
              {
                label: 'API Endpoints',
                to: '/docs/api-endpoints',
              },
            ],
          },
          {
            title: 'Project',
            items: [
              {
                label: 'Setup & Deployment',
                to: '/docs/setup-deployment',
              },
              {
                label: 'Database Schema',
                to: '/docs/database-schema',
              },
              {
                label: 'Form Submissions',
                to: '/docs/form-submissions',
              },
            ],
          },
          {
            title: 'More',
            items: [
              {
                label: 'GitHub',
                href: 'https://github.com/alejogaletto/TFG-Galetto-Alejo',
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} Alejo Galetto. Built with Docusaurus.`,
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
      },
    }),
});
