import Button from '@components/Button/Button/Button';
import SvgAnnotationDotsIcon from '@icons/AnnotationDotsIcon';
import React from 'react';

import styles from './ErrorCommentButton.module.scss';

interface Props {
    onClick: () => void;
    trackingId?: string;
}

export function ErrorCommentButton({
    onClick,
    trackingId,
    children,
}: React.PropsWithChildren<Props>) {
    if (!children)
        children = (
            <>
                <SvgAnnotationDotsIcon />
                <span>Comment</span>
            </>
        );
    return (
        <Button
            type="primary"
            trackingId={trackingId ?? 'ErrorCommentButton'}
            onClick={onClick}
            className={styles.button}
        >
            {children}
        </Button>
    );
}
