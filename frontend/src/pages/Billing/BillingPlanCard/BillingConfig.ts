import { PlanType } from '../../../graph/generated/schemas';

export type BillingPlan = {
    name: string;
    monthlyPrice: number;
    annualPrice: number;
    type: PlanType;
    advertisedFeatures: string[];
    membersIncluded?: number;
};

const freePlan: BillingPlan = {
    name: 'Free',
    type: PlanType.Free,
    monthlyPrice: 0,
    annualPrice: 0,
    advertisedFeatures: ['500 sessions /month', 'Unlimited dev tools access'],
};

const basicPlan: BillingPlan = {
    name: 'Basic',
    type: PlanType.Basic,
    monthlyPrice: 100,
    annualPrice: 80,
    advertisedFeatures: [
        '10,000 sessions /month',
        '2 members included',
        'Unlimited dev tools access',
        'Unlimited retention',
    ],
    membersIncluded: 2,
};

const startupPlan: BillingPlan = {
    name: 'Startup',
    type: PlanType.Startup,
    monthlyPrice: 250,
    annualPrice: 200,
    advertisedFeatures: [
        '80,000 sessions /month',
        '8 members included',
        'Unlimited dev tools access',
        'Unlimited retention',
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
