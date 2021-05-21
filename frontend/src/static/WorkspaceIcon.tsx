import * as React from 'react';

function SvgWorkspaceIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            width="1em"
            height="1em"
            viewBox="0 0 20 20"
            fill="current"
            xmlns="http://www.w3.org/2000/svg"
            {...props}
        >
            <path d="M18.844 5H14c-.406-1.406-1.844-2.5-3.594-2.5H9.5C7.75 2.5 6.344 3.594 5.906 5h-4.75C.5 5 0 5.5 0 6.156v10.157C0 17 .5 17.5 1.156 17.5h17.75C19.5 17.5 20 17 20 16.344V6.156C20 5.5 19.5 5 18.844 5zM9.5 4.156h.906c.75 0 1.406.344 1.75.844H7.75c.406-.5 1-.844 1.75-.844zm-3.656 2.5h12.468v2.75l-7.75 1.406h-.343L1.656 9.25V6.656h4.188zm-4.188 9.188v-4.938L10 12.5c.156 0 .344.094.5.094.156 0 .344 0 .5-.094l7.406-1.406v4.75H1.656z" />
        </svg>
    );
}

export default SvgWorkspaceIcon;
