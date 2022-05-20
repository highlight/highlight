import { MetricConfig } from '@pages/Dashboards/Metrics';

export enum WebVitalName {
    CLS = 'Cumulative Layout Shift',
    FCP = 'First Contentful Paint',
    FID = 'First Input Delay',
    LCP = 'Largest Contentful Paint',
    TTFB = 'Time to First Byte',
}

export const WEB_VITALS_CONFIGURATION: {
    [key in string]: MetricConfig;
} = {
    CLS: {
        maxGoodValue: 0.1,
        name: WebVitalName.CLS,
        maxNeedsImprovementValue: 0.25,
        poorValue: 0,
        units: 'LS',
        helpArticle: 'https://web.dev/cls',
    },
    FID: {
        maxGoodValue: 100,
        name: WebVitalName.FID,
        maxNeedsImprovementValue: 300,
        poorValue: 0,
        units: 'ms',
        helpArticle: 'https://web.dev/fid',
    },
    LCP: {
        maxGoodValue: 2500,
        name: WebVitalName.LCP,
        maxNeedsImprovementValue: 4000,
        poorValue: 0,
        units: 'ms',
        helpArticle: 'https://web.dev/lcp',
    },
    FCP: {
        maxGoodValue: 1800,
        name: WebVitalName.FCP,
        maxNeedsImprovementValue: 3000,
        poorValue: 0,
        units: 'ms',
        helpArticle: 'https://web.dev/fcp',
    },
    TTFB: {
        maxGoodValue: 500,
        name: WebVitalName.TTFB,
        maxNeedsImprovementValue: 3000,
        poorValue: 0,
        units: 'ms',
        helpArticle: 'https://web.dev/ttfb',
    },
};
