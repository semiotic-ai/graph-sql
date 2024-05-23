// release.config.js

const config = {
  plugins: [
    [
      '@semantic-release/commit-analyzer',
      {
        releaseRules: [
          {
            type: 'perf',
            release: 'patch'
          },
          {
            type: 'refactor',
            release: 'patch'
          },
          {
            type: 'build',
            scope: 'deps',
            release: 'patch'
          }
        ]
      }
    ],
    [
      '@semantic-release/release-notes-generator',
      {
        presetConfig: {
          types: [
            { type: 'feat', section: 'Features' },
            { type: 'feature', section: 'Features' },
            { type: 'fix', section: 'Bug Fixes' },
            { type: 'perf', section: 'Performance Improvements' },
            { type: 'revert', section: 'Reverts' },
            { type: 'docs', section: 'Documentation', hidden: false },
            { type: 'style', section: 'Styles', hidden: false },
            { type: 'chore', section: 'Miscellaneous Chores', hidden: false },
            { type: 'refactor', section: 'Code Refactoring', hidden: false },
            { type: 'test', section: 'Tests', hidden: false },
            { type: 'build', section: 'Build System', hidden: false },
            { type: 'ci', section: 'Continuous Integration', hidden: false }
          ]
        }
      }
    ],
    [
      '@semantic-release/changelog',
      {
        changelogTitle: '# Changelog'
      }
    ],
    '@semantic-release/npm'
  ],
  branches: ['main'],
  preset: 'conventionalcommits'
};

module.exports = config;
