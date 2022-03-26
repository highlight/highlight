import Tag from '@components/Tag/Tag';
import SvgBugIcon from '@icons/BugIcon';
import { ErrorCommentButton } from '@pages/Error/components/ErrorComments/ErrorCommentButton/ErrorCommentButton';
import { getErrorTitle } from '@util/errors/errorUtils';
import React, { useEffect, useState } from 'react';

import { ErrorGroup, Maybe } from '../../../../graph/generated/schemas';
import { getHeaderFromError } from '../../ErrorPage';
import ErrorShareButton from '../ErrorShareButton/ErrorShareButton';
import styles from './ErrorTitle.module.scss';

interface Props {
    errorGroup:
        | Maybe<Pick<ErrorGroup, 'event' | 'type' | 'secure_id' | 'is_public'>>
        | undefined;
    showShareButton?: boolean;
    onClickCreateComment?: () => void;
}

const ErrorTitle = ({
    errorGroup,
    showShareButton = true,
    onClickCreateComment,
}: Props) => {
    const [headerTextAsJson, setHeaderTextAsJson] = useState<null | any>(null);

    const headerText = getHeaderFromError(errorGroup?.event ?? []);

    useEffect(() => {
        if (headerText) {
            if (errorGroup?.event) {
                const title = getErrorTitle(errorGroup.event);
                if (title) {
                    setHeaderTextAsJson(title);
                } else {
                    setHeaderTextAsJson(null);
                }
            } else {
                setHeaderTextAsJson(null);
            }
        }
    }, [errorGroup?.event, headerText]);

    return (
        <header className={styles.header}>
            <div className={styles.topRow}>
                {!showShareButton ? (
                    <h3>{headerTextAsJson || headerText}</h3>
                ) : (
                    <h2>{headerTextAsJson || headerText}</h2>
                )}
                {showShareButton && (
                    <ErrorShareButton errorGroup={errorGroup} />
                )}
                <ErrorCommentButton
                    onClick={onClickCreateComment ?? (() => {})}
                    trackingId="CreateErrorIssue"
                >
                    <SvgBugIcon />
                    <span>Create an Issue</span>
                </ErrorCommentButton>
            </div>
            {errorGroup?.type && (
                <Tag
                    infoTooltipText="This is where the error was thrown."
                    backgroundColor="var(--color-orange-300)"
                >
                    {errorGroup.type}
                </Tag>
            )}
        </header>
    );
};

export default ErrorTitle;
