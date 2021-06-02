import * as React from 'react';

function SvgLayout(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 64 64"
            width="1em"
            height="1em"
            {...props}
        >
            <path d="M59.2 0H4.8C2.1 0 0 2.1 0 4.8v54.4C0 61.9 2.1 64 4.8 64h54.4c2.4 0 4.5-1.9 4.8-4.3V4.8C64 2.1 61.9 0 59.2 0zM5.3 5.3h53.3V16H5.3V5.3zm16 16h37.3v16H21.3v-16zm-16 37.4V21.3H16v37.3H5.3zm16 0v-16h37.3v16H21.3z" />
        </svg>
    );
}

export default SvgLayout;
