import * as React from 'react';

function SvgCircleCheckIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            width="1em"
            height="1em"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            {...props}
        >
            <circle cx={12} cy={12} r={12} fill="currentColor" />
            <path
                d="M6.792 12.722l2.158 2.956a1.667 1.667 0 002.717-.035l5.541-8.018"
                stroke="#fff"
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

export default SvgCircleCheckIcon;
