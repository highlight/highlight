const CracoAntDesignPlugin = require('craco-antd');
const path = require('path');
const alias = require(`./src/config/aliases`);
const webpack = require(`webpack`);
const cp = require('child_process');

const SRC = `./src`;
const aliases = alias(SRC);

const codeRev = cp.execSync('git rev-parse --short HEAD').toString();

const resolvedAliases = Object.fromEntries(
    Object.entries(aliases).map(([key, value]) => [
        key,
        path.resolve(__dirname, value),
    ])
);

module.exports = {
    webpack: {
        alias: resolvedAliases,
        plugins: {
            add: [
                new webpack.EnvironmentPlugin({
                    REACT_APP_CODE_REV: codeRev,
                }),
            ],
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
