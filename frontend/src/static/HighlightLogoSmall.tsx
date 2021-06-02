import * as React from 'react';

function SvgHighlightLogoSmall(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            width="1em"
            height="1em"
            viewBox="0 0 30 30"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            {...props}
        >
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M7.152.457L4 .467a3 3 0 00-2.99 3.01l.07 22.467a3 3 0 003.01 2.99l12.542-.039L7.152.457zm16.454 28.416L13.653.436l12.815-.04a3 3 0 013.01 2.99l.07 22.469a3 3 0 01-2.991 3.01l-2.951.008z"
                fill="#643DDC"
            />
        </svg>
    );
}

export default SvgHighlightLogoSmall;
