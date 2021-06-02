import * as React from 'react';

function SvgChevronDownIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            width="1em"
            height="1em"
            viewBox="0 0 18 18"
            fill="current"
            xmlns="http://www.w3.org/2000/svg"
            {...props}
        >
            <g clipPath="url(#chevron-down-icon_svg__clip0)">
                <path d="M9 13.528c-.365 0-.675-.14-.984-.366l-7.79-7.34c-.31-.31-.31-.76 0-1.04.309-.31.759-.31 1.04 0L9 12.036l7.735-7.34c.309-.31.759-.31 1.04 0 .31.31.31.76 0 1.04l-7.79 7.341c-.31.394-.62.45-.985.45z" />
            </g>
            <defs>
                <clipPath id="chevron-down-icon_svg__clip0">
                    <path fill="curent" d="M0 0h18v18H0z" />
                </clipPath>
            </defs>
        </svg>
    );
}

export default SvgChevronDownIcon;
