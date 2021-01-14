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
        '20,000+ sessions collected/month',
        'Unlimited dev tools access',
        'Up to 5 saved searches',
        'Unlimited retention',
    ],
    priceId: "price_1I9MVtGz4ry65q428w94BtY0"
}

export const startupPlan: BillingPlan = {
    planName: 'Startup',
    monthlyPrice: '300',
    advertisedFeatures: [
        '80,000+ sessions collected/month',
        'Unlimited dev tools access',
        'Unlimited saved searches',
        'Unlimited retention',
    ],
    priceId: "price_1I9MVtGz4ry65q42XaSmn4qm"
}

export const enterprisePlan: BillingPlan = {
    planName: 'Enterprise',
    monthlyPrice: '500+',
    advertisedFeatures: [
        'Everything in Basic/Startup',
        'Session based user ACLS/Permissioning',
        'On premise deployments',
        'SSO/SAML'
    ],
    priceId: "price_1I1GpoGz4ry65q42rwSyiiCJ"
}