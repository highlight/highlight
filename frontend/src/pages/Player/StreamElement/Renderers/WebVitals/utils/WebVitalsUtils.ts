import { DashboardChartType, DashboardMetricConfig } from '@graph/schemas';

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
        name: 'CLS',
        description: WebVitalName.CLS,
        max_needs_improvement_value: 0.25,
        poor_value: 0,
        units: 'LS',
        help_article: 'https://web.dev/cls',
        chart_type: DashboardChartType.Timeline,
    },
    FID: {
        max_good_value: 100,
        name: 'FID',
        description: WebVitalName.FID,
        max_needs_improvement_value: 300,
        poor_value: 0,
        units: 'ms',
        help_article: 'https://web.dev/fid',
        chart_type: DashboardChartType.Timeline,
    },
    LCP: {
        max_good_value: 2500,
        name: 'LCP',
        description: WebVitalName.LCP,
        max_needs_improvement_value: 4000,
        poor_value: 0,
        units: 'ms',
        help_article: 'https://web.dev/lcp',
        chart_type: DashboardChartType.Timeline,
    },
    FCP: {
        max_good_value: 1800,
        name: 'FCP',
        description: WebVitalName.FCP,
        max_needs_improvement_value: 3000,
        poor_value: 0,
        units: 'ms',
        help_article: 'https://web.dev/fcp',
        chart_type: DashboardChartType.Timeline,
    },
    TTFB: {
        max_good_value: 500,
        name: 'TTFB',
        description: WebVitalName.TTFB,
        max_needs_improvement_value: 3000,
        poor_value: 0,
        units: 'ms',
        help_article: 'https://web.dev/ttfb',
        chart_type: DashboardChartType.Timeline,
    },
};
