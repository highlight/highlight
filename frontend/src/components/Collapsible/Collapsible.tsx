import useLocalStorage from '@rehooks/local-storage';
import classNames from 'classnames';
import React from 'react';
import ReactCollapsible from 'react-collapsible';

import SvgChevronDownIcon from '../../static/ChevronDownIcon';
import styles from './Collapsible.module.scss';

interface Props {
    title: string | React.ReactNode;
    className?: string;
}

const Collapsible: React.FC<Props> = ({
    title,
    children,
    className,
    ...props
}) => {
    const [expanded, setExpanded] = useLocalStorage(
        `highlight-collapsible-state-${title}`,
        false
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
            classParentString={classNames(styles.collapsible)}
            handleTriggerClick={() => {
                setExpanded(!expanded);
            }}
            open={expanded}
        >
            <div className={classNames(styles.content, className)}>
                {children}
            </div>
        </ReactCollapsible>
    );
};

export default Collapsible;
