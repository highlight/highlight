import React, { useState } from 'react';
// eslint-disable-next-line no-restricted-imports
import { Tabs as AntDesignTabs, TabsProps } from 'antd';
const { TabPane } = AntDesignTabs;
import styles from './Tabs.module.scss';

type Props = Pick<TabsProps, 'animated'> & {
    tabs: {
        title: string;
        panelContent: React.ReactNode;
    }[];
};

const Tabs = ({ tabs, ...props }: Props) => {
    const [activeTab, setActiveTab] = useState(tabs[0].title || '0');

    return (
        <AntDesignTabs
            defaultActiveKey={activeTab}
            onChange={(activeKey) => {
                setActiveTab(activeKey);
            }}
            centered
            animated={{ inkBar: true, tabPane: true }}
            {...props}
        >
            {tabs.map(({ panelContent, title }) => (
                <TabPane key={title} tab={title} className={styles.tabPane}>
                    {panelContent}
                </TabPane>
            ))}
        </AntDesignTabs>
    );
};

export default Tabs;
