import * as React from 'react';

function SvgWarningTriangle(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg width="24" height="24" fill="none" viewBox="0 0 24 24" {...props}>
            <path
                stroke="red"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M4.9522 16.3536L10.2152 5.85658C10.9531 4.38481 13.0539 4.3852 13.7913 5.85723L19.0495 16.3543C19.7156 17.6841 18.7487 19.25 17.2613 19.25H6.74007C5.25234 19.25 4.2854 17.6835 4.9522 16.3536Z"
            ></path>
            <path
                stroke="red"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 10V12"
            ></path>
            <circle cx="12" cy="16" r="1" fill="red"></circle>
        </svg>
    );
}

export default SvgWarningTriangle;
