export const ERRORS_TO_IGNORE = [
    '["\\"Script error.\\""]' /** This is an error that happens from a script that is on a different origin than the origin that Highlight is running on. See: https://sentry.io/answers/script-error/*/,
];
