import { PlanType } from '../../../graph/generated/schemas';

export type BillingPlan = {
    name: string;
    monthlyPrice: string;
    type: PlanType;
    advertisedFeatures: string[];
};

export const freePlan: BillingPlan = {
    name: 'Free',
    type: PlanType.None,
    monthlyPrice: '0',
    advertisedFeatures: ['500 sessions /month', 'Unlimited dev tools access'],
};

export const basicPlan: BillingPlan = {
    name: 'Basic',
    type: PlanType.Basic,
    monthlyPrice: '100',
    advertisedFeatures: [
        '10,000 sessions /month',
        'Unlimited dev tools access',
        'Unlimited retention',
    ],
};

export const startupPlan: BillingPlan = {
    name: 'Startup',
    type: PlanType.Startup,
    monthlyPrice: '250',
    advertisedFeatures: [
        '80,000 sessions /month',
        'Unlimited dev tools access',
        'Unlimited retention',
    ],
};

export const enterprisePlan: BillingPlan = {
    name: 'Enterprise',
    type: PlanType.Enterprise,
    monthlyPrice: '500+',
    advertisedFeatures: [
        'Everything in Basic/Startup',
        'User ACLS/Permissioning',
        'On premise deployments',
        'SSO/SAML',
    ],
};

export const BILLING_PLANS = [
    freePlan,
    basicPlan,
    startupPlan,
    enterprisePlan,
] as const;
