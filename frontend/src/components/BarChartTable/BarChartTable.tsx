import { ConfigProvider, Table } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import React from 'react';

import EmptyCardPlaceholder from '../../pages/Home/components/EmptyCardPlaceholder/EmptyCardPlaceholder';

interface Props {
    columns: ColumnsType<any>;
    data: any[];
    onClickHandler: (record: any) => void;
    /** The string shown to the user when the table has no data. */
    noDataMessage?: string | React.ReactNode;
}

const BarChartTable = ({
    columns,
    data,
    onClickHandler,
    noDataMessage,
}: Props) => {
    return (
        <ConfigProvider
            renderEmpty={() => <EmptyCardPlaceholder message={noDataMessage} />}
        >
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
