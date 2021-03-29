export type BillingPlan = {
    planName: string;
    monthlyPrice: string;
    advertisedFeatures: string[];
};

export const basicPlan: BillingPlan = {
    planName: 'Basic',
    monthlyPrice: '100',
    advertisedFeatures: [
        '20,000 sessions /month',
        'Unlimited dev tools access',
        'Up to 5 saved searches',
        'Unlimited retention',
    ],
};

export const startupPlan: BillingPlan = {
    planName: 'Startup',
    monthlyPrice: '250',
    advertisedFeatures: [
        '80,000 sessions /month',
        'Unlimited dev tools access',
        'Unlimited saved searches',
        'Unlimited retention',
    ],
};

export const enterprisePlan: BillingPlan = {
    planName: 'Enterprise',
    monthlyPrice: '500+',
    advertisedFeatures: [
        'Everything in Basic/Startup',
        'User ACLS/Permissioning',
        'On premise deployments',
        'SSO/SAML',
    ],
};
