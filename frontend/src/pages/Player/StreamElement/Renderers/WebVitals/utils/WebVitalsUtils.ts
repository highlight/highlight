enum WebVitalName {
    CLS = 'Cumulative Layout Shift',
    FCP = 'First Contentful Paint',
    FID = 'First Input Delay',
    LCP = 'Largest Contentful Paint',
    TTFB = 'Time to First Byte',
}
export interface WebVitalDescriptor {
    name: WebVitalName;
    maxGoodValue: number;
    maxNeedsImprovementValue: number;
    poorValue: number;
    units: string;
}

export const WEB_VITALS_CONFIGURATION: {
    [key in string]: WebVitalDescriptor;
} = {
    CLS: {
        maxGoodValue: 0.1,
        name: WebVitalName.CLS,
        maxNeedsImprovementValue: 0.25,
        poorValue: 0,
        units: 'Layout Shift',
    },
    FID: {
        maxGoodValue: 100,
        name: WebVitalName.FID,
        maxNeedsImprovementValue: 300,
        poorValue: 0,
        units: 'ms',
    },
    LCP: {
        maxGoodValue: 2500,
        name: WebVitalName.LCP,
        maxNeedsImprovementValue: 4000,
        poorValue: 0,
        units: 'ms',
    },
    FCP: {
        maxGoodValue: 1800,
        name: WebVitalName.FCP,
        maxNeedsImprovementValue: 3000,
        poorValue: 0,
        units: 'ms',
    },
    TTFB: {
        maxGoodValue: 500,
        name: WebVitalName.TTFB,
        maxNeedsImprovementValue: 3000,
        poorValue: 0,
        units: 'ms',
    },
};
