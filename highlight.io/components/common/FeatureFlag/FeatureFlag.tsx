import React from 'react'

export enum Feature {}

export const IsFeatureOn = (feature: Feature): boolean => {
  if (process.env.NODE_ENV === 'development') return true
  switch (feature) {
    default:
      return false
  }
}

interface Props {
  feature: Feature
  on: React.ReactNode
  off: React.ReactNode
}

export const FeatureFlag: React.FC<Props> = ({ feature, on, off }) => {
  if (IsFeatureOn(feature)) {
    return <>{on}</>
  }
  return <>{off}</>
}
