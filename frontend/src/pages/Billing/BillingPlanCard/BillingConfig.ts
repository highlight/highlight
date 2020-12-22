export type BillingPlan = {
    planName: string;
    monthlyPrice: string;
    advertisedFeatures: string[];
    priceId: string;
}

export const basicPlan: BillingPlan = {
    planName: 'Basic',
    monthlyPrice: '100',
    advertisedFeatures: [
        '2,000+ page views/month',
        'Unlimited dev tools access',
        'On premise deployments',
        'SSO/SAML'
    ],
    priceId: "price_1HswN7Gz4ry65q421RTixaZB"
}

export const startupPlan: BillingPlan = {
    planName: 'Startup',
    monthlyPrice: '250',
    advertisedFeatures: [
        '2,000+ page views/month',
        'Unlimited dev tools access',
        'On premise deployments',
        'SSO/SAML'
    ],
    priceId: "price_1I1GpaGz4ry65q42eha1NkFb"
}

export const enterprisePlan: BillingPlan = {
    planName: 'Enterprise',
    monthlyPrice: '500+',
    advertisedFeatures: [
        '2,000+ page views/month',
        'Unlimited dev tools access',
        'On premise deployments',
        'SSO/SAML'
    ],
    priceId: "price_1I1GpoGz4ry65q42rwSyiiCJ"
}