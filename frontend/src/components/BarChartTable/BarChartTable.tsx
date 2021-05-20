import { ConfigProvider, Table } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import React from 'react';

import EmptyCardPlaceholder from '../../pages/Home/components/EmptyCardPlaceholder/EmptyCardPlaceholder';

interface Props {
    columns: ColumnsType<any>;
    data: any[];
    onClickHandler: (record: any) => void;
}

const BarChartTable = ({ columns, data, onClickHandler }: Props) => {
    return (
        <ConfigProvider renderEmpty={EmptyCardPlaceholder}>
            <Table
                scroll={{ y: 250 }}
                showHeader={false}
                columns={columns}
                dataSource={data}
                pagination={false}
                onRow={(record) => ({
                    onClick: () => {
                        onClickHandler(record);
                    },
                })}
            />
        </ConfigProvider>
    );
};

export default BarChartTable;
