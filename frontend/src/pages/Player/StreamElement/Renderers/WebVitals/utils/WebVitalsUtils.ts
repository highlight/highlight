import { DashboardMetricConfig } from '@graph/schemas';

export enum WebVitalName {
    CLS = 'Cumulative Layout Shift',
    FCP = 'First Contentful Paint',
    FID = 'First Input Delay',
    LCP = 'Largest Contentful Paint',
    TTFB = 'Time to First Byte',
}

export const WEB_VITALS_CONFIGURATION: {
    [key in string]: DashboardMetricConfig;
} = {
    CLS: {
        max_good_value: 0.1,
        name: WebVitalName.CLS,
        max_needs_improvement_value: 0.25,
        poor_value: 0,
        units: 'LS',
        help_article: 'https://web.dev/cls',
    },
    FID: {
        max_good_value: 100,
        name: WebVitalName.FID,
        max_needs_improvement_value: 300,
        poor_value: 0,
        units: 'ms',
        help_article: 'https://web.dev/fid',
    },
    LCP: {
        max_good_value: 2500,
        name: WebVitalName.LCP,
        max_needs_improvement_value: 4000,
        poor_value: 0,
        units: 'ms',
        help_article: 'https://web.dev/lcp',
    },
    FCP: {
        max_good_value: 1800,
        name: WebVitalName.FCP,
        max_needs_improvement_value: 3000,
        poor_value: 0,
        units: 'ms',
        help_article: 'https://web.dev/fcp',
    },
    TTFB: {
        max_good_value: 500,
        name: WebVitalName.TTFB,
        max_needs_improvement_value: 3000,
        poor_value: 0,
        units: 'ms',
        help_article: 'https://web.dev/ttfb',
    },
};
