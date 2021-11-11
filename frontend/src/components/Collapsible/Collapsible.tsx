import useLocalStorage from '@rehooks/local-storage';
import classNames from 'classnames';
import React from 'react';
import ReactCollapsible from 'react-collapsible';

import SvgChevronDownIcon from '../../static/ChevronDownIcon';
import styles from './Collapsible.module.scss';

interface Props {
    title: string | React.ReactNode;
    /** A unique identifier for this collapsible. This should be used if title is a ReactNode. */
    id?: string;
    contentClassName?: string;
    parentClassName?: string;
    defaultOpen?: boolean;
}

const Collapsible: React.FC<Props> = ({
    title,
    children,
    contentClassName,
    parentClassName,
    id,
    defaultOpen = false,
    ...props
}) => {
    const [expanded, setExpanded] = useLocalStorage(
        `highlight-collapsible-state-${id || title}`,
        defaultOpen
    );

    return (
        <ReactCollapsible
            {...props}
            trigger={
                <div
                    className={classNames(styles.header, {
                        [styles.collapsed]: !expanded,
                    })}
                >
                    <h2
                        className={classNames({
                            [styles.collapsed]: !expanded,
                        })}
                    >
                        {title}
                    </h2>
                    <SvgChevronDownIcon
                        className={classNames({ [styles.expanded]: expanded })}
                    />
                </div>
            }
            transitionTime={150}
            classParentString={classNames(styles.collapsible, parentClassName)}
            handleTriggerClick={() => {
                setExpanded(!expanded);
            }}
            open={expanded}
        >
            <div className={classNames(styles.content, contentClassName)}>
                {children}
            </div>
        </ReactCollapsible>
    );
};

export default Collapsible;
