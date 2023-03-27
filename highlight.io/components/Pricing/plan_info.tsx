export type PricingInfo = {
  tierName: string
  numSessionCredits: number
  price?: number
  mostPopular: boolean
  discount?: number
}

export const BasicInfo: PricingInfo = {
  tierName: 'Basic',
  numSessionCredits: 500,
  price: 0,
  mostPopular: false,
  discount: 0,
}

export const EssentialsInfo: PricingInfo = {
  tierName: 'Essentials',
  numSessionCredits: 10000,
  price: 150,
  mostPopular: false,
  discount: 20,
}

export const StartupInfo: PricingInfo = {
  tierName: 'Startup',
  numSessionCredits: 80000,
  price: 400,
  mostPopular: true,
  discount: 20,
}

export const EnterpriseInfo: PricingInfo = {
  tierName: 'Enterprise',
  numSessionCredits: 0,
  mostPopular: false,
}
