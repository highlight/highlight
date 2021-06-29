import * as React from 'react';

function SvgCloseIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            width="1em"
            height="1em"
            fill="none"
            viewBox="4 4 16 16"
            {...props}
        >
            <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4.75 12A7.25 7.25 0 0112 4.75v0A7.25 7.25 0 0119.25 12v0A7.25 7.25 0 0112 19.25v0A7.25 7.25 0 014.75 12v0zM9.75 9.75l4.5 4.5M14.25 9.75l-4.5 4.5"
            />
        </svg>
    );
}

export default SvgCloseIcon;
