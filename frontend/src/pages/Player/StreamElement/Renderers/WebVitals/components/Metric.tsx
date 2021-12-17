import InfoTooltip from '@components/InfoTooltip/InfoTooltip';
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
            <ScoreVisualization value={value} configuration={configuration} />
            <span className={styles.value}>
                {value.toFixed(2)}
                <span className={styles.units}>{configuration.units}</span>
                <InfoTooltip
                    className={styles.infoTooltip}
                    title={getTooltipText(configuration, value)}
                    align={{ offset: [-13, 0] }}
                    placement="topLeft"
                />
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

function getTooltipText(
    configuration: WebVitalDescriptor,
    value: number
): React.ReactNode {
    const valueScore = getValueScore(value, configuration);

    let message = '';
    switch (valueScore) {
        case ValueScore.Poor:
            message = `Looks like you're not doing so hot for ${configuration.name} on this session.`;
            break;
        case ValueScore.NeedsImprovement:
            message = `You're scoring okay for ${configuration.name} on this session. You can do better though!`;
            break;
        case ValueScore.Good:
            message = `You're scoring AMAZINGLY for ${configuration.name} on this session!`;
            break;
    }

    return (
        <div
            // This is to prevent the stream element from collapsing from clicking on a link.
            onClick={(e) => {
                e.stopPropagation();
            }}
        >
            {message}{' '}
            <a
                href={configuration.helpArticle}
                target="_blank"
                rel="noreferrer"
            >
                Learn more about optimizing {configuration.name}.
            </a>
        </div>
    );
}

interface ScoreVisualizationProps {
    value: number;
    configuration: WebVitalDescriptor;
}

const ScoreVisualization = ({
    configuration,
    value,
}: ScoreVisualizationProps) => {
    return (
        <div className={styles.scoreVisualization}>
            <div className={styles.poor}></div>
            <div className={styles.needsImprovement}></div>
            <div className={styles.good}></div>
        </div>
    );
};
