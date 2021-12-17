import { WebVitalDescriptor } from '@pages/Player/StreamElement/Renderers/WebVitals/utils/WebVitalsUtils';
import classNames from 'classnames';
import React from 'react';

import styles from './Metric.module.scss';

interface Props {
    configuration: WebVitalDescriptor;
    value: number;
    name: string;
}

const SimpleMetric = ({ configuration, value, name }: Props) => {
    const valueScore = getValueScore(value, configuration);

    return (
        <div
            className={classNames(styles.simpleMetric, styles.metric, {
                [styles.goodScore]: valueScore === ValueScore.Good,
                [styles.needsImprovementScore]:
                    valueScore === ValueScore.NeedsImprovement,
                [styles.poorScore]: valueScore === ValueScore.Poor,
            })}
        >
            <span className={styles.name}>{name}</span>
        </div>
    );
};

export const DetailedMetric = ({ configuration, value, name }: Props) => {
    const valueScore = getValueScore(value, configuration);

    return (
        <div
            className={classNames(styles.metric, styles.detailedMetric, {
                [styles.goodScore]: valueScore === ValueScore.Good,
                [styles.needsImprovementScore]:
                    valueScore === ValueScore.NeedsImprovement,
                [styles.poorScore]: valueScore === ValueScore.Poor,
            })}
        >
            <span className={styles.name}>{name}</span>
            <span className={styles.name}>
                {value.toFixed(2)}
                <span className={styles.units}>{configuration.units}</span>
            </span>
        </div>
    );
};

export default SimpleMetric;

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
