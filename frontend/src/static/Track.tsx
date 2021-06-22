import * as React from 'react';

function SvgTrack(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            width="1em"
            height="1em"
            viewBox="0 0 48 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            {...props}
        >
            <path
                d="M24 0C10.7 0 0 11.2 0 25.3c0 12 16.5 31.7 21.6 37.6.5.8 1.6 1.1 2.4 1.1 1.1 0 1.9-.5 2.4-1.1C31.5 57.1 48 37.1 48 25.3 48 11.2 37.3 0 24 0zm0 57.6C14.9 46.9 5.3 32.8 5.3 25.3c0-11.2 8.3-20 18.7-20 10.4 0 18.7 9.1 18.7 20 0 7.5-9.6 21.6-18.7 32.3z"
                fill="current"
            />
            <path
                d="M24 13.3c-5.9 0-10.7 4.8-10.7 10.7 0 5.9 4.8 10.7 10.7 10.7 5.9 0 10.7-4.8 10.7-10.7 0-5.9-4.8-10.7-10.7-10.7zm0 16c-2.9 0-5.3-2.4-5.3-5.3s2.4-5.3 5.3-5.3 5.3 2.4 5.3 5.3-2.4 5.3-5.3 5.3z"
                fill="current"
            />
        </svg>
    );
}

export default SvgTrack;
