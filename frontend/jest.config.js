module.exports = {
    moduleFileExtensions: ['js', 'ts', 'tsx', 'json'],
    transform: {
        '^.+\\.tsx?$': 'ts-jest',
    },
    globals: {
        'ts-jest': {
            diagnostics: {
                exclude: ['**'],
            },
        },
    },
};
