import Button from '@components/Button/Button/Button';
import Popover from '@components/Popover/Popover';
import SvgFilterIcon from '@icons/FilterIcon';
import { useEventTypeFilters } from '@pages/Player/components/EventStream/hooks/useEventTypeFilters';
import { Checkbox } from 'antd';
import React from 'react';

import styles from './EventStreamTypesFilter.module.scss';

export const EventStreamTypesFilter = () => {
    const {
        setShowClick,
        setShowFocus,
        setShowIdentify,
        setShowNavigate,
        setShowReferrer,
        setShowReload,
        setShowSegment,
        setShowTrack,
        setShowViewport,
        showClick,
        showFocus,
        showIdentify,
        showNavigate,
        showReferrer,
        showReload,
        showSegment,
        showTrack,
        showViewport,
    } = useEventTypeFilters();
    const activeFiltersCount = [
        showIdentify,
        showTrack,
        showViewport,
        showSegment,
        showFocus,
        showNavigate,
        showReferrer,
        showClick,
        showReload,
    ].reduce((acc, curr) => {
        return curr ? acc + 1 : acc;
    }, 0);

    return (
        <Popover
            trigger={['click']}
            content={
                <section className={styles.popover}>
                    <div className={styles.optionsContainer}>
                        <Checkbox
                            checked={showIdentify}
                            onChange={(e) => {
                                setShowIdentify(e.target.checked);
                            }}
                        >
                            Identify
                        </Checkbox>
                        <Checkbox
                            checked={showTrack}
                            onChange={(e) => {
                                setShowTrack(e.target.checked);
                            }}
                        >
                            Track
                        </Checkbox>
                        <Checkbox
                            checked={showViewport}
                            onChange={(e) => {
                                setShowViewport(e.target.checked);
                            }}
                        >
                            Viewport
                        </Checkbox>
                        <Checkbox
                            checked={showSegment}
                            onChange={(e) => {
                                setShowSegment(e.target.checked);
                            }}
                        >
                            Segment
                        </Checkbox>
                        <Checkbox
                            checked={showFocus}
                            onChange={(e) => {
                                setShowFocus(e.target.checked);
                            }}
                        >
                            Focus
                        </Checkbox>
                        <Checkbox
                            checked={showNavigate}
                            onChange={(e) => {
                                setShowNavigate(e.target.checked);
                            }}
                        >
                            Navigate
                        </Checkbox>
                        <Checkbox
                            checked={showReferrer}
                            onChange={(e) => {
                                setShowReferrer(e.target.checked);
                            }}
                        >
                            Referrer
                        </Checkbox>
                        <Checkbox
                            checked={showClick}
                            onChange={(e) => {
                                setShowClick(e.target.checked);
                            }}
                        >
                            Click
                        </Checkbox>
                        <Checkbox
                            checked={showReload}
                            onChange={(e) => {
                                setShowReload(e.target.checked);
                            }}
                        >
                            Reload
                        </Checkbox>
                    </div>
                </section>
            }
            placement="topLeft"
        >
            <Button
                trackingId="SessionEventStreamSettings"
                type="ghost"
                small
                className={styles.filtersButton}
            >
                <SvgFilterIcon />
                Filters ({activeFiltersCount})
            </Button>
        </Popover>
    );
};
