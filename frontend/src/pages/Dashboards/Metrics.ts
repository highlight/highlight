import { DashboardMetricConfig, MetricType } from '@graph/schemas';
import { WEB_VITALS_CONFIGURATION } from '@pages/Player/StreamElement/Renderers/WebVitals/utils/WebVitalsUtils';

export const DEFAULT_METRICS_LAYOUT = {
    lg: [
        {
            w: 6,
            h: 2,
            x: 0,
            y: 0,
            i: '0',
            minW: 3,
            static: false,
        },
        {
            w: 6,
            h: 2,
            x: 6,
            y: 0,
            i: '1',
            minW: 3,
            static: false,
        },
        {
            w: 6,
            h: 2,
            x: 0,
            y: 2,
            i: '2',
            minW: 3,
            static: false,
        },
        {
            w: 6,
            h: 2,
            x: 6,
            y: 2,
            i: '3',
            minW: 3,
            static: false,
        },
        {
            w: 6,
            h: 2,
            x: 0,
            y: 4,
            i: '4',
            minW: 3,
            static: false,
        },
    ],
};

export const getDefaultMetricConfig = (name: string): DashboardMetricConfig => {
    let cfg: DashboardMetricConfig | undefined = undefined;
    if (WEB_VITALS_CONFIGURATION.hasOwnProperty(name.toUpperCase())) {
        cfg = WEB_VITALS_CONFIGURATION[name.toUpperCase()];
    }
    return {
        name: name,
        description: cfg?.description || '',
        help_article: cfg?.help_article || '',
        units: cfg?.units || 'ms',
        max_good_value: cfg?.max_good_value || 10,
        max_needs_improvement_value: cfg?.max_needs_improvement_value || 100,
        poor_value: cfg?.poor_value || 1000,
        type: cfg?.type || MetricType.Frontend,
    };
};
