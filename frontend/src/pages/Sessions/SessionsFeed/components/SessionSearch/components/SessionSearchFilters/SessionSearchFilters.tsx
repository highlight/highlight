import { Checkbox } from 'antd';
import React from 'react';

import Button from '../../../../../../../components/Button/Button/Button';
import Popover from '../../../../../../../components/Popover/Popover';
import useSelectedSessionSearchFilters from '../../../../../../../persistedStorage/useSelectedSessionSearchFilters';
import SvgChevronDownIcon from '../../../../../../../static/ChevronDownIcon';
import styles from './SessionSearchFilters.module.scss';

const SessionSearchFilters = () => {
    const {
        selectedSearchFilters,
        setSelectedSearchFilters,
    } = useSelectedSessionSearchFilters();

    const activeSettingsCount = selectedSearchFilters.length;

    const onSelectChangeHandler = (selectedFilters: any) => {
        setSelectedSearchFilters(selectedFilters);
    };

    return (
        <Popover
            placement="bottomLeft"
            content={
                <div className={styles.filterOptionsContainer}>
                    <Checkbox.Group
                        defaultValue={selectedSearchFilters}
                        onChange={onSelectChangeHandler}
                    >
                        <div className={styles.checkboxContainer}>
                            {SessionSearchFilterOptions.map((filterOption) => (
                                <div key={filterOption.toString()}>
                                    <Checkbox value={filterOption}>
                                        {filterOption}
                                    </Checkbox>
                                </div>
                            ))}
                        </div>
                    </Checkbox.Group>
                </div>
            }
        >
            <Button trackingId="SessionSearchFilters" type="text" small>
                {activeSettingsCount === SessionSearchFilterOptions.length
                    ? 'All properties'
                    : `${activeSettingsCount} ${
                          activeSettingsCount === 1 ? 'property' : 'properties'
                      }`}
                <SvgChevronDownIcon className={styles.icon} />
            </Button>
        </Popover>
    );
};

export default SessionSearchFilters;

export const SessionSearchFilterOptions = [
    'Track Properties',
    'User Properties',
    'Visited URLs',
    'Referrers',
] as const;
