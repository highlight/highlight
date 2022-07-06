import classNames from 'classnames';
import React from 'react';
import { useLocation } from 'react-router';

import styles from './FieldsBox.module.scss';

export const FieldsBox = ({
    children,
    id,
}: React.PropsWithChildren<{ id?: string }>) => {
    const location = useLocation();
    const divRef = React.createRef<HTMLDivElement>();
    const focus = location.hash === `#${id}`;
    React.useEffect(() => {
        if (focus && divRef.current) {
            divRef.current.scrollIntoView();
        }
    }, [focus, divRef]);
    return (
        <div
            id={id}
            ref={divRef}
            className={classNames(styles.fieldsBox, {
                [styles.focus]: focus,
            })}
        >
            {children}
        </div>
    );
};
