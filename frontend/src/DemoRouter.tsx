import './App.scss';

import React, { useEffect, useState } from 'react';

import commonStyles from './Common.module.scss';
import { Header } from './components/Header/Header';
import { Sidebar } from './components/Sidebar/Sidebar';
import {
    SidebarContextProvider,
    SidebarState,
} from './components/Sidebar/SidebarContext';
import { DemoContext } from './DemoContext';
import Player from './pages/Player/PlayerPage';

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
                    staticSidebarState: SidebarState.Expanded,
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
