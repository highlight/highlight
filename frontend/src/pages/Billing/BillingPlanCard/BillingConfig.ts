import { PlanType } from '@graph/schemas';

type FeatureWithTooltip = {
    text: string;
    tooltip?: string;
};

export type BillingPlan = {
    name: string;
    monthlyPrice: number;
    annualPrice: number;
    type: PlanType;
    advertisedFeatures: (FeatureWithTooltip | string)[];
    membersIncluded?: number;
};

const SESSIONS_AFTER_LIMIT_TOOLTIP =
    'After this monthly limit is reached, extra sessions will be charged $5 per 1000 sessions.';

const freePlan: BillingPlan = {
    name: 'Free',
    type: PlanType.Free,
    monthlyPrice: 0,
    annualPrice: 0,
    advertisedFeatures: [
        {
            text: '500 sessions / month',
            tooltip:
                'After this monthly limit is reached, sessions will be recorded but will not be visible until your plan is upgraded.',
        },
        'Unlimited dev tools access',
    ],
};

const basicPlan: BillingPlan = {
    name: 'Basic',
    type: PlanType.Basic,
    monthlyPrice: 100,
    annualPrice: 80,
    advertisedFeatures: [
        {
            text: '10,000 free sessions / mo',
            tooltip: SESSIONS_AFTER_LIMIT_TOOLTIP,
        },
        '2 members included',
        'Unlimited dev tools access',
        'Unlimited retention',
    ],
    membersIncluded: 2,
};

const startupPlan: BillingPlan = {
    name: 'Startup',
    type: PlanType.Startup,
    monthlyPrice: 300,
    annualPrice: 240,
    advertisedFeatures: [
        {
            text: '80,000 free sessions / mo',
            tooltip: SESSIONS_AFTER_LIMIT_TOOLTIP,
        },
        'Everything in Basic',
        '8 members included',
        'Enhanced user metadata',
        'Issue tracking integrations',
    ],
    membersIncluded: 8,
};

const enterprisePlan: BillingPlan = {
    name: 'Enterprise',
    type: PlanType.Enterprise,
    monthlyPrice: 1000,
    annualPrice: 800,
    advertisedFeatures: [
        'Everything in Basic/Startup',
        '15 members included',
        'User RBAC/Permissioning',
        'On-premise deployments',
        'SSO/SAML',
    ],
    membersIncluded: 15,
};

export const BILLING_PLANS = [
    freePlan,
    basicPlan,
    startupPlan,
    enterprisePlan,
] as const;
