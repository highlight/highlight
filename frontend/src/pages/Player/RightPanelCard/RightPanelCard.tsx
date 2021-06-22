import classNames from 'classnames';
import React from 'react';

import styles from './RightPanelCard.module.scss';

type Props = { selected: boolean } & React.HTMLProps<HTMLDivElement>;
const RightPanelCard: React.FC<Props> = ({ children, selected, ...props }) => {
    return (
        <article
            {...props}
            className={classNames(styles.card, props.className, {
                [styles.selected]: selected,
            })}
        >
            {children}
        </article>
    );
};

export default RightPanelCard;
