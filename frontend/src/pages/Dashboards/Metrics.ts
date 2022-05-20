export interface MetricConfig {
    name: string;
    maxGoodValue: number;
    maxNeedsImprovementValue: number;
    poorValue: number;
    units: string;
    helpArticle: string;
}
