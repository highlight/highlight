import classNames from 'classnames';
import React, { HTMLProps } from 'react';

import SvgSparklesIcon from '../../static/SparklesIcon';
import { useIntegrated } from '../../util/integrated';
import styles from './Changelog.module.scss';

const Changelog = (props: HTMLProps<HTMLDivElement>) => {
    const { integrated } = useIntegrated();

    if (!integrated) {
        return null;
    }

    // @ts-expect-error
    Canny('initChangelog', {
        appID: '6106e922db58e766285b5206',
        position: 'top',
        align: 'left',
    });

    return (
        <div
            {...props}
            className={classNames(styles.container, props.className)}
        >
            <button
                className={classNames(styles.indicator)}
                data-canny-changelog
            >
                <SvgSparklesIcon className={classNames(styles.indicatorIcon)} />
            </button>
        </div>
    );
};

export default Changelog;
