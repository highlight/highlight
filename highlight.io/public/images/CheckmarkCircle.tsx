import * as React from 'react'

function SvgCheckmarkCircle(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="1em" height="1em" {...props}>
      <path d="M32 0C14.4 0 0 14.4 0 32s14.4 32 32 32 32-14.4 32-32S49.6 0 32 0zm0 58.7c-14.7 0-26.7-12-26.7-26.7S17.3 5.3 32 5.3s26.7 12 26.7 26.7-12 26.7-26.7 26.7z" />
      <path d="M40.8 22.1l-12.3 12-5.6-5.3c-1.1-1.1-2.7-1.1-3.7 0s-1.1 2.7 0 3.7l6.7 6.4c.8.8 1.6 1.1 2.4 1.1.8 0 1.9-.3 2.4-1.1l13.6-13.1c1.1-1.1 1.1-2.7 0-3.7-.8-1-2.4-1-3.5 0z" />
    </svg>
  )
}

export default SvgCheckmarkCircle
