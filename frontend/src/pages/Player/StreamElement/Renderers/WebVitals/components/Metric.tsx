import InfoTooltip from '@components/InfoTooltip/InfoTooltip';
import { MetricConfig } from '@pages/Dashboards/Metrics';
import classNames from 'classnames';
import { motion } from 'framer-motion';
import React from 'react';

import styles from './Metric.module.scss';

interface Props {
    configuration: MetricConfig;
    value: number;
    name: string;
}

const SimpleMetric = ({ configuration, value, name }: Props) => {
    const valueScore = getWebVitalValueScore(value, configuration);

    return (
        <div
            className={classNames(styles.simpleMetric, styles.metric, {
                [styles.goodScore]: valueScore === WebVitalValueScore.Good,
                [styles.needsImprovementScore]:
                    valueScore === WebVitalValueScore.NeedsImprovement,
                [styles.poorScore]: valueScore === WebVitalValueScore.Poor,
            })}
        >
            <span className={styles.name}>{name}</span>
        </div>
    );
};

export const DetailedMetric = ({ configuration, value, name }: Props) => {
    const valueScore = getWebVitalValueScore(value, configuration);

    return (
        <div
            className={classNames(styles.metric, styles.detailedMetric, {
                [styles.goodScore]: valueScore === WebVitalValueScore.Good,
                [styles.needsImprovementScore]:
                    valueScore === WebVitalValueScore.NeedsImprovement,
                [styles.poorScore]: valueScore === WebVitalValueScore.Poor,
            })}
        >
            <span className={styles.name}>
                {name}{' '}
                <InfoTooltip
                    className={styles.infoTooltip}
                    title={getInfoTooltipText(configuration, value)}
                    align={{ offset: [-13, 0] }}
                    placement="topLeft"
                />
            </span>
            <ScoreVisualization value={value} configuration={configuration} />
        </div>
    );
};

export default SimpleMetric;

export enum WebVitalValueScore {
    Good,
    NeedsImprovement,
    Poor,
}

export function getWebVitalValueScore(
    value: number,
    {
        maxGoodValue,
        maxNeedsImprovementValue,
    }: Pick<MetricConfig, 'maxGoodValue' | 'maxNeedsImprovementValue'>
): WebVitalValueScore {
    if (value <= maxGoodValue) {
        return WebVitalValueScore.Good;
    }
    if (value <= maxNeedsImprovementValue) {
        return WebVitalValueScore.NeedsImprovement;
    }

    return WebVitalValueScore.Poor;
}

function getInfoTooltipText(
    configuration: MetricConfig,
    value: number
): React.ReactNode {
    const valueScore = getWebVitalValueScore(value, configuration);

    let message = '';
    switch (valueScore) {
        case WebVitalValueScore.Poor:
            message = `Looks like you're not doing so hot for ${configuration.name} on this session.`;
            break;
        case WebVitalValueScore.NeedsImprovement:
            message = `You're scoring okay for ${configuration.name} on this session. You can do better though!`;
            break;
        case WebVitalValueScore.Good:
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
    configuration: MetricConfig;
}

const ScoreVisualization = ({
    configuration,
    value,
}: ScoreVisualizationProps) => {
    const valueScore = getWebVitalValueScore(value, configuration);
    const scorePosition = getScorePosition(configuration, value);
    let gapSpacing = 0;

    switch (valueScore) {
        case WebVitalValueScore.NeedsImprovement:
            gapSpacing = 2;
            break;
        case WebVitalValueScore.Poor:
            gapSpacing = 2 * 2;
            break;
    }

    return (
        <div className={styles.scoreVisualization}>
            <motion.div
                className={styles.scoreIndicator}
                animate={{
                    left: `calc(${
                        scorePosition * 100
                    }% - calc(var(--size) / 2) + ${gapSpacing}px)`,
                }}
                transition={{
                    type: 'spring',
                }}
            >
                <span
                    className={classNames(styles.value, {
                        [styles.mirror]: valueScore === WebVitalValueScore.Poor,
                    })}
                >
                    {value.toFixed(2)}
                    <span className={styles.units}>{configuration.units}</span>
                </span>
            </motion.div>
            <div
                className={classNames(styles.good, {
                    [styles.active]: valueScore === WebVitalValueScore.Good,
                })}
            ></div>
            <div
                className={classNames(styles.needsImprovement, {
                    [styles.active]:
                        valueScore === WebVitalValueScore.NeedsImprovement,
                })}
            ></div>
            <div
                className={classNames(styles.poor, {
                    [styles.active]: valueScore === WebVitalValueScore.Poor,
                })}
            ></div>
        </div>
    );
};

const getScorePosition = (configuration: MetricConfig, value: number) => {
    const valueScore = getWebVitalValueScore(value, configuration);
    let offset = 0;
    let min = 0;
    let max = 0;
    const OFFSET_AMOUNT = 0.33;

    switch (valueScore) {
        case WebVitalValueScore.Good:
            offset = 0;
            min = 0;
            max = configuration.maxGoodValue;
            break;
        case WebVitalValueScore.NeedsImprovement:
            offset = OFFSET_AMOUNT;
            min = configuration.maxGoodValue;
            max = configuration.maxNeedsImprovementValue;
            break;
        case WebVitalValueScore.Poor:
            offset = OFFSET_AMOUNT * 2;
            min = configuration.maxNeedsImprovementValue;
            max = Infinity;
            break;
    }

    // There's no upper value for a poor value so we generate a random value.
    if (max === Infinity) {
        return offset + Math.random() * OFFSET_AMOUNT;
    }

    const range = max - min;
    const percent = (value - min) / range;
    const relativePercent = OFFSET_AMOUNT * percent;

    return offset + relativePercent;
};
