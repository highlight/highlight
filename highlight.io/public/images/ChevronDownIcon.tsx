import * as React from 'react'

function SvgChevronDownIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width="1em" height="1em" fill="none" viewBox="4 4 16 16" {...props}>
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M15.25 10.75L12 14.25l-3.25-3.5"
      />
    </svg>
  )
}

export default SvgChevronDownIcon
