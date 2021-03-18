import * as React from 'react';

function SvgClose(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            width="1em"
            height="1em"
            viewBox="0 0 64 64"
            fill="current"
            xmlns="http://www.w3.org/2000/svg"
            {...props}
        >
            <path d="M35.4 32l19.9-19.9c1-1 1-2.4 0-3.4s-2.4-1-3.4 0L32 28.6 12 8.8c-.9-1-2.4-1-3.3 0-.9 1-1 2.4 0 3.4L28.6 32 8.7 51.9c-1 1-1 2.4 0 3.4.5.4 1 .7 1.7.7s1.2-.2 1.7-.7l20-19.9 20 19.8c.5.4 1.2.7 1.7.7s1.2-.2 1.7-.7c1-1 1-2.4 0-3.4L35.4 32z" />
        </svg>
    );
}

export default SvgClose;
