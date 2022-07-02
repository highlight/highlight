import classNames from 'classnames';
import React from 'react';

import styles from './FieldsBox.module.scss';

export const FieldsBox = ({
    children,
    focus,
}: React.PropsWithChildren<{ focus?: boolean }>) => {
    const divRef = React.createRef<HTMLDivElement>();
    React.useEffect(() => {
        if (focus && divRef.current) {
            divRef.current.scrollIntoView();
        }
    }, [divRef, focus]);
    return (
        <div
            ref={divRef}
            className={classNames(styles.fieldsBox, {
                [styles.focus]: focus,
            })}
        >
            {children}
        </div>
    );
};
