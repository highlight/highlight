// eslint-disable-next-line no-restricted-imports
import { Tabs as AntDesignTabs, TabsProps } from 'antd';
import React from 'react';
const { TabPane } = AntDesignTabs;
import useLocalStorage from '@rehooks/local-storage';
import classNames from 'classnames';

import styles from './Tabs.module.scss';

export interface TabItem {
    title: string;
    panelContent: React.ReactNode;
}

type Props = Pick<TabsProps, 'animated' | 'tabBarExtraContent' | 'centered'> & {
    tabs: TabItem[];
    /** A unique value to distinguish this tab with other tabs. */
    id: string;
    /** Whether the tab contents has the default padding. */
    noPadding?: boolean;
};

const Tabs = ({
    tabs,
    id,
    noPadding = false,
    tabBarExtraContent,
    ...props
}: Props) => {
    const [activeTab, setActiveTab] = useLocalStorage(
        `tabs-${id || 'unknown'}-active-tab`,
        tabs[0].title || '0'
    );

    return (
        <AntDesignTabs
            activeKey={activeTab}
            defaultActiveKey={activeTab}
            onChange={(activeKey) => {
                setActiveTab(activeKey);
            }}
            tabBarExtraContent={
                tabBarExtraContent ? (
                    <div className={styles.extraContentContainer}>
                        {tabBarExtraContent}
                    </div>
                ) : null
            }
            className={styles.tabs}
            {...props}
        >
            {tabs.map(({ panelContent, title }) => (
                <TabPane
                    key={title}
                    tab={title}
                    className={classNames(styles.tabPane, {
                        [styles.withPadding]: !noPadding,
                    })}
                >
                    {panelContent}
                </TabPane>
            ))}
        </AntDesignTabs>
    );
};

export default Tabs;
