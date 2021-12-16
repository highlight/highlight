import { WebVitalDescriptor } from '@pages/Player/Toolbar/DevToolsWindow/MetricsPage/utils/WebVitalsUtils';
import classNames from 'classnames';
import React from 'react';

import styles from './Metric.module.scss';

interface Props {
    configuration: WebVitalDescriptor;
    value: number;
}

const Metric = ({ configuration, value }: Props) => {
    const valueScore = getValueScore(value, configuration);

    return (
        <div
            className={classNames(styles.metric, {
                [styles.goodScore]: valueScore === ValueScore.Good,
                [styles.needsImprovementScore]:
                    valueScore === ValueScore.NeedsImprovement,
                [styles.poorScore]: valueScore === ValueScore.Poor,
            })}
        >
            <h3 className={styles.name}>{configuration.name}</h3>
            <p className={styles.value}>
                {value.toFixed(2)}{' '}
                <span className={styles.units}>{configuration.units}</span>
            </p>
        </div>
    );
};

export default Metric;

enum ValueScore {
    Good,
    NeedsImprovement,
    Poor,
}

function getValueScore(
    value: number,
    { maxGoodValue, maxNeedsImprovementValue }: WebVitalDescriptor
): ValueScore {
    if (value <= maxGoodValue) {
        return ValueScore.Good;
    }
    if (value <= maxNeedsImprovementValue) {
        return ValueScore.NeedsImprovement;
    }

    return ValueScore.Poor;
}
