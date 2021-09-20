import usePlayerConfiguration from '@pages/Player/PlayerHook/utils/usePlayerConfiguration';
import { useDevToolsContext } from '@pages/Player/Toolbar/DevToolsContext/DevToolsContext';
import ErrorModal from '@pages/Player/Toolbar/DevToolsWindow/ErrorsPage/components/ErrorModal/ErrorModal';
import { message } from 'antd';
import React, { ReactElement, useState } from 'react';
import { useLocation } from 'react-router-dom';

import GoToButton from '../../../../components/Button/GoToButton';
import Popover from '../../../../components/Popover/Popover';
import { MillisToMinutesAndSeconds } from '../../../../util/time';
import { getHeaderFromError } from '../../../Error/ErrorPage';
import { PlayerSearchParameters } from '../../PlayerHook/utils';
import { ParsedErrorObject, useReplayerContext } from '../../ReplayerContext';
import styles from '../Toolbar.module.scss';
import TimelineAnnotation from './TimelineAnnotation';

interface Props {
    error: ParsedErrorObject;
}

function TimelineErrorAnnotation({ error }: Props): ReactElement {
    const location = useLocation();
    const errorId = new URLSearchParams(location.search).get(
        PlayerSearchParameters.errorId
    );
    const { pause, replayer } = useReplayerContext();
    const {
        setShowDevTools,
        setSelectedDevToolsTab,
    } = usePlayerConfiguration();
    const { setPanelContent } = useDevToolsContext();

    const [isTooltipOpen, setIsTooltipOpen] = useState(false);

    return (
        <Popover
            key={error.id}
            defaultVisible={errorId === error.id}
            content={
                <div className={styles.popoverContent}>
                    {error.source}
                    <div className={styles.buttonContainer}>
                        <GoToButton
                            onClick={() => {
                                setShowDevTools(true);
                                setSelectedDevToolsTab('Errors');
                                setPanelContent({
                                    title: null,
                                    content: <ErrorModal error={error} />,
                                });
                            }}
                            label="More info"
                        />
                    </div>
                </div>
            }
            onVisibleChange={(visible) => {
                setIsTooltipOpen(visible);
            }}
            title={
                <div className={styles.popoverHeader}>
                    {getHeaderFromError(error.event)}
                </div>
            }
        >
            <TimelineAnnotation
                isSelected={isTooltipOpen}
                event={error}
                colorKey="Errors"
                onClickHandler={() => {
                    if (replayer) {
                        const newTime =
                            new Date(error.timestamp).getTime() -
                            replayer.getMetaData().startTime;

                        pause(newTime);
                        message.success(
                            `Changed player time to where error was thrown at ${MillisToMinutesAndSeconds(
                                newTime
                            )}.`
                        );
                    }
                }}
            />
        </Popover>
    );
}

export default TimelineErrorAnnotation;
