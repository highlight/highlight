import * as React from 'react';

function SvgPlayIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            width="1em"
            height="1em"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            {...props}
        >
            <path
                d="M1.657 20c.54 0 .981-.173 1.547-.457l15.29-7.913C19.6 11.062 20 10.654 20 10c0-.654-.4-1.062-1.506-1.63L3.204.457C2.638.173 2.196 0 1.657 0 .663 0 0 .679 0 1.74v16.52C0 19.32.663 20 1.657 20z"
                fill="currentColor"
            />
        </svg>
    );
}

export default SvgPlayIcon;
