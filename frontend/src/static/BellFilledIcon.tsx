import * as React from 'react';

function SvgBellFilledIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            width="1em"
            height="1em"
            viewBox="0 0 17 17"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            {...props}
        >
            <path
                d="M3.236 13.084h11.52c.766 0 1.244-.421 1.244-1.043 0-.762-.675-1.399-1.335-1.998-.515-.474-.63-1.487-.743-2.48-.136-2.5-.925-4.291-2.76-4.935C10.857 1.703 10.053 1 9 1c-1.062 0-1.858.703-2.169 1.628-1.828.644-2.624 2.435-2.76 4.936-.107.992-.22 2.005-.744 2.479C2.675 10.643 2 11.279 2 12.04c0 .622.478 1.043 1.236 1.043zM9 16c1.297 0 2.237-.888 2.328-1.931H6.664C6.755 15.112 7.704 16 9 16z"
                fill="currentColor"
            />
        </svg>
    );
}

export default SvgBellFilledIcon;
