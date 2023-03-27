export type PricingDetails = {
  features: {
    name: 'Features'
    items: [
      {
        name: 'Public session sharing'
        value: boolean
      },
      {
        name: 'Custom data export'
        value: boolean
      },
      {
        name: 'Enhanced user properties'
        value: boolean
      },
      {
        name: 'Session / error commenting'
        value: boolean
      },
    ]
  }
  teamManagement: {
    name: 'Team Management'
    items: [
      {
        name: 'Role-based access control'
        value: boolean
      },
      {
        name: 'Single sign-on'
        value: boolean
      },
      {
        name: 'Two-factor authentication'
        value: boolean
      },
    ]
  }
  support: {
    name: 'Support'
    items: [
      {
        name: 'Email'
        value: boolean
      },
      {
        name: 'Intercom'
        value: boolean
      },
      {
        name: 'Slack Connect'
        value: boolean
      },
      {
        name: '24x7 support with SLAs'
        value: boolean
      },
    ]
  }
}

export const BasicDetails: PricingDetails = {
  features: {
    name: 'Features',
    items: [
      {
        name: 'Public session sharing',
        value: false,
      },
      {
        name: 'Custom data export',
        value: false,
      },
      {
        name: 'Enhanced user properties',
        value: false,
      },
      {
        name: 'Session / error commenting',
        value: true,
      },
    ],
  },
  teamManagement: {
    name: 'Team Management',
    items: [
      {
        name: 'Role-based access control',
        value: false,
      },
      {
        name: 'Single sign-on',
        value: false,
      },
      {
        name: 'Two-factor authentication',
        value: false,
      },
    ],
  },
  support: {
    name: 'Support',
    items: [
      {
        name: 'Email',
        value: true,
      },
      {
        name: 'Intercom',
        value: true,
      },
      {
        name: 'Slack Connect',
        value: false,
      },
      {
        name: '24x7 support with SLAs',
        value: false,
      },
    ],
  },
}

export const EssentialsDetails: PricingDetails = {
  features: {
    name: 'Features',
    items: [
      {
        name: 'Public session sharing',
        value: false,
      },
      {
        name: 'Custom data export',
        value: false,
      },
      {
        name: 'Enhanced user properties',
        value: false,
      },
      {
        name: 'Session / error commenting',
        value: true,
      },
    ],
  },
  teamManagement: {
    name: 'Team Management',
    items: [
      {
        name: 'Role-based access control',
        value: false,
      },
      {
        name: 'Single sign-on',
        value: false,
      },
      {
        name: 'Two-factor authentication',
        value: false,
      },
    ],
  },
  support: {
    name: 'Support',
    items: [
      {
        name: 'Email',
        value: true,
      },
      {
        name: 'Intercom',
        value: true,
      },
      {
        name: 'Slack Connect',
        value: false,
      },
      {
        name: '24x7 support with SLAs',
        value: false,
      },
    ],
  },
}

export const StartupDetails: PricingDetails = {
  features: {
    name: 'Features',
    items: [
      {
        name: 'Public session sharing',
        value: true,
      },
      {
        name: 'Custom data export',
        value: false,
      },
      {
        name: 'Enhanced user properties',
        value: true,
      },
      {
        name: 'Session / error commenting',
        value: true,
      },
    ],
  },
  teamManagement: {
    name: 'Team Management',
    items: [
      {
        name: 'Role-based access control',
        value: true,
      },
      {
        name: 'Single sign-on',
        value: true,
      },
      {
        name: 'Two-factor authentication',
        value: true,
      },
    ],
  },
  support: {
    name: 'Support',
    items: [
      {
        name: 'Email',
        value: true,
      },
      {
        name: 'Intercom',
        value: true,
      },
      {
        name: 'Slack Connect',
        value: true,
      },
      {
        name: '24x7 support with SLAs',
        value: false,
      },
    ],
  },
}

export const EnterpriseDetails: PricingDetails = {
  features: {
    name: 'Features',
    items: [
      {
        name: 'Public session sharing',
        value: true,
      },
      {
        name: 'Custom data export',
        value: true,
      },
      {
        name: 'Enhanced user properties',
        value: true,
      },
      {
        name: 'Session / error commenting',
        value: true,
      },
    ],
  },
  teamManagement: {
    name: 'Team Management',
    items: [
      {
        name: 'Role-based access control',
        value: true,
      },
      {
        name: 'Single sign-on',
        value: true,
      },
      {
        name: 'Two-factor authentication',
        value: true,
      },
    ],
  },
  support: {
    name: 'Support',
    items: [
      {
        name: 'Email',
        value: true,
      },
      {
        name: 'Intercom',
        value: true,
      },
      {
        name: 'Slack Connect',
        value: true,
      },
      {
        name: '24x7 support with SLAs',
        value: true,
      },
    ],
  },
}
