export interface EnvironmentSuggestion {
    name: string;
    value: string;
}

export const dedupeEnvironments = (
    environmentsFromApi: EnvironmentSuggestion[]
) => {
    const allEnvironments = new Set([
        ...environmentsFromApi.map(({ value }) => value),
        ...DEFAULT_HIGHLIGHT_ENVIRONMENTS,
    ]);

    return Array.from(allEnvironments);
};

/**
 * Names for the environments a Highlight session was recorded in.
 */
export const DEFAULT_HIGHLIGHT_ENVIRONMENTS = [
    'production',
    'staging',
    'development',
];
