import * as React from 'react';

function SvgSetupIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            width="1em"
            height="1em"
            viewBox="0 0 20 20"
            fill="current"
            xmlns="http://www.w3.org/2000/svg"
            {...props}
        >
            <path d="M15 3.344h-1.656v-2.5C13.344.344 13 0 12.5 0s-.844.344-.844.844v2.5H8.344v-2.5C8.344.344 8 0 7.5 0s-.844.344-.844.844v2.5H5c-.5 0-.844.344-.844.844V7.5c0 2.906 2.157 5.344 5 5.75v5.906c0 .5.344.844.844.844s.844-.344.844-.844V13.25c2.844-.406 5-2.844 5-5.75V4.156c0-.5-.344-.812-.844-.812zM14.187 7.5c0 2.344-1.874 4.156-4.187 4.156S5.844 9.844 5.844 7.5V5h8.343v2.5z" />
        </svg>
    );
}

export default SvgSetupIcon;
