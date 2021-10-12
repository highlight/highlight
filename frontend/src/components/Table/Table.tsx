import { Table as AntDesignTable, TableProps } from 'antd';
import React from 'react';

import styles from './Table.module.scss';

type Props = Pick<
    TableProps<any>,
    'columns' | 'dataSource' | 'loading' | 'pagination' | 'showHeader' | 'onRow'
>;

const Table = (props: Props) => {
    return <AntDesignTable {...props} className={styles.table} />;
};

export default Table;
