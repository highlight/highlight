const CracoAntDesignPlugin = require('craco-antd');
const CracoEsbuildPlugin = require('craco-esbuild');
const path = require('path');

module.exports = {
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
        {
            plugin: CracoEsbuildPlugin,
            options: {
                enableSvgr: true,
                esbuildLoaderOptions: {
                    loader: 'tsx',
                    target: 'es2019',
                },
            },
        },
    ],
};
