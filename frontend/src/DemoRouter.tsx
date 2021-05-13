import React, { useEffect, useState } from 'react';
import './App.scss';

import commonStyles from './Common.module.scss';
import {
    SidebarContextProvider,
    SidebarState,
} from './components/Sidebar/SidebarContext';
import { Sidebar } from './components/Sidebar/Sidebar';
import { Header } from './components/Header/Header';
import { Player } from './pages/Player/PlayerPage';
import { DemoContext } from './DemoContext';

const DemoRouter = () => {
    const [sidebarState, setSidebarState] = useState<SidebarState>(
        SidebarState.Collapsed
    );

    const toggleSidebar = () => {
        let nextState;

        switch (sidebarState) {
            case SidebarState.Collapsed:
                nextState = SidebarState.Expanded;
                break;
            case SidebarState.Expanded:
                nextState = SidebarState.Collapsed;
                break;
            default:
            case SidebarState.TemporarilyExpanded:
                nextState = SidebarState.Collapsed;
                break;
        }

        setSidebarState(nextState);
    };

    useEffect(() => {
        window.Intercom('update', {
            hide_default_launcher: true,
        });
        return () => {
            window.Intercom('update', {
                hide_default_launcher: false,
            });
        };
    }, []);

    return (
        <DemoContext.Provider value={{ demo: true }}>
            <SidebarContextProvider
                value={{
                    state: sidebarState,
                    setState: setSidebarState,
                    toggleSidebar,
                }}
            >
                <Header />
                <div className={commonStyles.bodyWrapper}>
                    <Sidebar />
                    <Player />
                </div>
            </SidebarContextProvider>
        </DemoContext.Provider>
    );
};

export default DemoRouter;
