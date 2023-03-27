const fs = require('fs')

const ignorePatterns = ['_', 'sitemap', 'api']

function getStaticPages() {
  return fs
    .readdirSync('./pages')
    .filter((file) => !ignorePatterns.some((pattern) => file.startsWith(pattern)))
    .join(', ')
}

module.exports = getStaticPages
