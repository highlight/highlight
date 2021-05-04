import React from 'react';
// eslint-disable-next-line no-restricted-imports
import { Tabs as AntDesignTabs, TabsProps } from 'antd';
const { TabPane } = AntDesignTabs;
import styles from './Tabs.module.scss';
import useLocalStorage from '@rehooks/local-storage';

type Props = Pick<TabsProps, 'animated'> & {
    tabs: {
        title: string;
        panelContent: React.ReactNode;
    }[];
    key: string;
};

const Tabs = ({ tabs, key, ...props }: Props) => {
    const [activeTab, setActiveTab] = useLocalStorage(
        `tabs-${key}-active-tab`,
        tabs[0].title || '0'
    );

    return (
        <AntDesignTabs
            defaultActiveKey={activeTab}
            onChange={(activeKey) => {
                setActiveTab(activeKey);
            }}
            centered
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
