const aliases = (prefix = `src`) => ({
    '@components': `${prefix}/components`,
    '@icons': `${prefix}/static`,
    '@util': `${prefix}/util`,
    '@hooks': `${prefix}/hooks`,
    '@pages': `${prefix}/pages`,
    '@routers': `${prefix}/routers`,
    '@queries': `${prefix}/graph/generated`,
    '@authentication': `${prefix}/authentication`,
});

module.exports = aliases;
