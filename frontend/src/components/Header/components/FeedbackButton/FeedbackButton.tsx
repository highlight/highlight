import React from 'react';

import SvgAnnotationDotsIcon from '../../../../static/AnnotationDotsIcon';
import ButtonLink from '../../../Button/ButtonLink/ButtonLink';
import styles from './FeedbackButton.module.scss';

const FeedbackButton = () => {
    return (
        <ButtonLink
            className={styles.feedbackButton}
            anchor
            href={FEEDBACK_URL}
            trackingId="feedbackButton"
        >
            <SvgAnnotationDotsIcon />
            Got feedback?
        </ButtonLink>
    );
};

export default FeedbackButton;

const FEEDBACK_URL = 'https://feedback.highlight.run/feature-requests';
