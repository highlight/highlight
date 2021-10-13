import { CircularSpinner } from '@components/Loading/Loading';
import { ConfigProvider, Table as AntDesignTable, TableProps } from 'antd';
import React from 'react';

import styles from './Table.module.scss';

type Props = Pick<
    TableProps<any>,
    'columns' | 'dataSource' | 'loading' | 'pagination' | 'showHeader' | 'onRow'
> & {
    renderEmptyComponent?: React.ReactNode;
};

const Table = ({ renderEmptyComponent, ...props }: Props) => {
    return (
        <ConfigProvider
            renderEmpty={() => {
                if (props.loading) {
                    return null;
                }
                return renderEmptyComponent || null;
            }}
        >
            <AntDesignTable
                {...props}
                className={styles.table}
                loading={
                    props.loading ? { indicator: <CircularSpinner /> } : false
                }
            />
        </ConfigProvider>
    );
};

export default Table;
