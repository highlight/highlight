export type BillingPlan = {
    planName: string;
    monthlyPrice: string;
    advertisedFeatures: string[];
}

export const basicPlan: BillingPlan = {
    planName: 'Basic',
    monthlyPrice: '100',
    advertisedFeatures: [
        '2,000+ page views/month',
        'Unlimited dev tools access',
        'On premise deployments',
        'SSO/SAML'
    ]
}

export const startupPlan: BillingPlan = {
    planName: 'Startup',
    monthlyPrice: '250',
    advertisedFeatures: [
        '2,000+ page views/month',
        'Unlimited dev tools access',
        'On premise deployments',
        'SSO/SAML'
    ]
}

export const enterprisePlan: BillingPlan = {
    planName: 'Enterprise',
    monthlyPrice: '500+',
    advertisedFeatures: [
        '2,000+ page views/month',
        'Unlimited dev tools access',
        'On premise deployments',
        'SSO/SAML'
    ]
}