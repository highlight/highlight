import { LoadingOutlined } from '@ant-design/icons';
import SvgSearchIcon from '@icons/SearchIcon';
import { Spin } from 'antd';
import classNames from 'classnames';
import React from 'react';

import styles from './DropdownIndicator.module.scss';

export const DropdownIndicator = React.memo(
    ({ isLoading, height }: { isLoading: boolean; height?: number }) => {
        const style: { height: number | undefined } = { height: undefined };
        if (height) {
            style.height = height;
        }
        return isLoading ? (
            <div
                className={classNames(
                    styles.loadingIconContainer,
                    styles.dropdownIndicator,
                    styles.spinner
                )}
                style={style}
            >
                <Spin
                    indicator={
                        <LoadingOutlined className={styles.loadingIcon} />
                    }
                />
            </div>
        ) : (
            <SvgSearchIcon
                className={classNames(
                    styles.searchIcon,
                    styles.dropdownIndicator
                )}
                style={style}
            />
        );
    }
);
