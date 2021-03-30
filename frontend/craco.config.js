const CracoAntDesignPlugin = require('craco-antd');

module.exports = {
    plugins: [
        {
            plugin: CracoAntDesignPlugin,
            options: {
                customizeTheme: {
                    '@font-family': 'AvenirNext',
                    '@primary-color': '#5629c6',
                    '@border-radius-base': '5px',
                },
            },
        },
    ],
};
