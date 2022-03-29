import 'antd/dist/antd.css';

import Button from '@components/Button/Button/Button';
import Input from '@components/Input/Input';
import { Slider } from 'antd';
import { debounce } from 'lodash';
import React, { useEffect, useMemo, useState } from 'react';
import { useToggle } from 'react-use';

import styles from './LengthInput.module.scss';

interface LengthInputProps {
    start: number;
    end: number;
    onChange: (start: number, end: number) => void;
}

export const LengthInput = ({ start, end, onChange }: LengthInputProps) => {
    const [localMin, setLocalMin] = useState(start);
    const [localMax, setLocalMax] = useState(end);
    const [showAdvanced, toggleShowAdvanced] = useToggle(false);

    const updateSearchParams = () => {
        onChange(Math.min(localMin, localMax), Math.max(localMin, localMax));
    };

    const marks = {
        0: '0',
        60: '60+',
    };

    useEffect(() => {
        setLocalMin(start);
        setLocalMax(end);
    }, [start, end]);

    return (
        <div className={styles.sessionLengthInput}>
            <div className={styles.headerContainer}>
                <span className={styles.sessionLengthInputLabel}>
                    Length {!showAdvanced ? '(minutes)' : '(seconds)'}
                </span>
                <Button
                    trackingId="showAdvancedLengthInput"
                    type="text"
                    size="small"
                    onClick={() => {
                        toggleShowAdvanced();
                    }}
                >
                    Advanced
                </Button>
            </div>
            {showAdvanced ? (
                <AdvancedLengthInput
                    start={start}
                    end={end}
                    onChange={(min, max) => {
                        setLocalMin(min);
                        setLocalMax(max);
                    }}
                />
            ) : (
                <Slider
                    range
                    className={styles.slider}
                    tooltipPlacement={'bottom'}
                    getTooltipPopupContainer={(_) =>
                        document.querySelector('.ant-slider-step')!
                    }
                    disabled={false}
                    min={0}
                    max={60}
                    marks={marks}
                    value={[localMin, localMax]}
                    onChange={([min, max]) => {
                        setLocalMin(min);
                        setLocalMax(max);
                    }}
                />
            )}
            <div className={styles.buttonContainer}>
                <Button
                    type="primary"
                    trackingId="QueryBuilderSetLength"
                    className={styles.advancedLengthInput}
                    onClick={updateSearchParams}
                >
                    Ok
                </Button>
            </div>
        </div>
    );
};

const AdvancedLengthInput = ({ start, end, onChange }: LengthInputProps) => {
    const onStartingDurationChangeHandler = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        onChange((parseInt(e.target.value, 10) ?? 0) / 60, end);
    };

    const onEndingDurationChangeHandler = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        onChange(start, (parseInt(e.target.value, 10) ?? 0) / 60);
    };

    const debouncedStartingDurationChangeHandler = useMemo(
        () => debounce(onStartingDurationChangeHandler, 200),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        []
    );

    const debouncedEndingDurationChangeHandler = useMemo(
        () => debounce(onEndingDurationChangeHandler, 200),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        []
    );

    return (
        <div className={styles.advancedLengthInput}>
            <div className={styles.group}>
                <Input
                    type="number"
                    placeholder="Min"
                    defaultValue={start * 60}
                    onChange={(e: any) => {
                        e.persist();
                        debouncedStartingDurationChangeHandler(e);
                    }}
                />
            </div>
            <div className={styles.group}>
                <Input
                    type="number"
                    placeholder="Max"
                    defaultValue={end * 60}
                    onChange={(e: any) => {
                        e.persist();
                        debouncedEndingDurationChangeHandler(e);
                    }}
                />
            </div>
        </div>
    );
};
