import { useAuthContext } from '@authentication/AuthContext';
import classNames from 'classnames';
import React from 'react';

const HighlightGate: React.FC = ({ children }) => {
    const { isHighlightAdmin } = useAuthContext();

    if (!isHighlightAdmin) {
        return null;
    }

    return (
        <>
            {React.Children.map(children, (child) => {
                // @ts-expect-error
                return React.cloneElement(child, {
                    class: classNames(
                        'boba',
                        // @ts-expect-error
                        child?.props.className
                    ),
                });
            })}
        </>
    );
};

export default HighlightGate;
