const CracoAntDesignPlugin = require('craco-antd');
const path = require('path');
const alias = require(`./src/config/aliases`);

const SRC = `./src`;
const aliases = alias(SRC);

const resolvedAliases = Object.fromEntries(
    Object.entries(aliases).map(([key, value]) => [
        key,
        path.resolve(__dirname, value),
    ])
);

module.exports = {
    webpack: {
        alias: resolvedAliases,
        configure: {
            devtool: 'source-map',
            output: {
                sourceMapFilename: '/[file].map',
            },
        },
    },
    plugins: [
        {
            plugin: CracoAntDesignPlugin,
            options: {
                customizeThemeLessPath: path.join(
                    __dirname,
                    'src/style/AntDesign/antd.overrides.less'
                ),
            },
        },
    ],
};
