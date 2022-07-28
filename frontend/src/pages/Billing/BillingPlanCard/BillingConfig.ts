import { PlanType } from '@graph/schemas';

type FeatureWithTooltip = {
    text: string;
    tooltip?: string;
};

export type BillingPlan = {
    name: string;
    monthlyPrice: number;
    annualPrice: number;
    monthlyUnlimitedMembersPrice: number;
    annualUnlimitedMembersPrice: number;
    type: PlanType;
    advertisedFeatures: (FeatureWithTooltip | string)[];
    membersIncluded?: number;
};

const SESSIONS_AFTER_LIMIT_TOOLTIP =
    'After this monthly limit is reached, extra sessions will be charged $5 per 1000 sessions.';

const freePlan: BillingPlan = {
    name: 'Basic',
    type: PlanType.Free,
    monthlyPrice: 0,
    annualPrice: 0,
    monthlyUnlimitedMembersPrice: 0,
    annualUnlimitedMembersPrice: 0,
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
    name: 'Essentials',
    type: PlanType.Basic,
    monthlyPrice: 100,
    annualPrice: 80,
    monthlyUnlimitedMembersPrice: 150,
    annualUnlimitedMembersPrice: 120,
    advertisedFeatures: [
        {
            text: '10,000 free sessions / mo',
            tooltip: SESSIONS_AFTER_LIMIT_TOOLTIP,
        },
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
    monthlyUnlimitedMembersPrice: 400,
    annualUnlimitedMembersPrice: 320,
    advertisedFeatures: [
        {
            text: '80,000 free sessions / mo',
            tooltip: SESSIONS_AFTER_LIMIT_TOOLTIP,
        },
        'Everything in Basic',
        'Enhanced user metadata',
        'App performance metrics',
        'Issue tracking integrations',
    ],
    membersIncluded: 8,
};

const enterprisePlan: BillingPlan = {
    name: 'Enterprise',
    type: PlanType.Enterprise,
    monthlyPrice: 1000,
    annualPrice: 800,
    monthlyUnlimitedMembersPrice: 1500,
    annualUnlimitedMembersPrice: 1200,
    advertisedFeatures: [
        {
            text: '300,000 free sessions / mo',
            tooltip: SESSIONS_AFTER_LIMIT_TOOLTIP,
        },
        'Everything in Basic/Startup',
        'Personalized support',
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
