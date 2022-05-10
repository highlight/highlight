import { getHeaderFromError } from '@pages/Error/ErrorPage';
import { getFullScreenPopoverGetPopupContainer } from '@pages/Player/context/PlayerUIContext';
import usePlayerConfiguration from '@pages/Player/PlayerHook/utils/usePlayerConfiguration';
import { DevToolTabType } from '@pages/Player/Toolbar/DevToolsContext/DevToolsContext';
import { useResourceOrErrorDetailPanel } from '@pages/Player/Toolbar/DevToolsWindow/ResourceOrErrorDetailPanel/ResourceOrErrorDetailPanel';
import { MillisToMinutesAndSeconds } from '@util/time';
import { message } from 'antd';
import React, { ReactElement, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

import GoToButton from '../../../../components/Button/GoToButton';
import Popover from '../../../../components/Popover/Popover';
import { PlayerSearchParameters } from '../../PlayerHook/utils';
import { ParsedErrorObject, useReplayerContext } from '../../ReplayerContext';
import styles from '../Toolbar.module.scss';
import TimelineAnnotation, { getPopoverPlacement } from './TimelineAnnotation';
import timelineAnnotationStyles from './TimelineAnnotation.module.scss';

interface Props {
    error: ParsedErrorObject;
    relativeStartPercent: number;
}

function TimelineErrorAnnotation({
    error,
    relativeStartPercent,
}: Props): ReactElement {
    const location = useLocation();
    const errorId = new URLSearchParams(location.search).get(
        PlayerSearchParameters.errorId
    );
    const { pause, replayer, sessionMetadata } = useReplayerContext();
    const {
        setShowDevTools,
        setSelectedDevToolsTab,
    } = usePlayerConfiguration();
    const { setErrorPanel } = useResourceOrErrorDetailPanel();

    const [isTooltipOpen, setIsTooltipOpen] = useState(false);

    useEffect(() => {
        if (errorId && error.id === errorId) {
            setShowDevTools(true);
            if (error.request_id) {
                setSelectedDevToolsTab(DevToolTabType.Network);
            } else {
                setSelectedDevToolsTab(DevToolTabType.Errors);
                setErrorPanel(error);
            }
        }
    }, [
        error,
        errorId,
        setErrorPanel,
        setSelectedDevToolsTab,
        setShowDevTools,
    ]);

    const { offset, placement } = getPopoverPlacement(relativeStartPercent);
    return (
        <Popover
            align={{
                overflow: {
                    adjustY: false,
                    adjustX: false,
                },
                offset: offset,
            }}
            placement={placement}
            getPopupContainer={getFullScreenPopoverGetPopupContainer}
            key={error.id}
            defaultVisible={errorId === error.id}
            popoverClassName={timelineAnnotationStyles.popover}
            content={
                <div className={styles.popoverContent}>
                    {error.source}
                    <div className={styles.buttonContainer}>
                        <GoToButton
                            onClick={() => {
                                setShowDevTools(true);
                                setSelectedDevToolsTab(DevToolTabType.Errors);
                                setErrorPanel(error);
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
                            sessionMetadata.startTime;

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
