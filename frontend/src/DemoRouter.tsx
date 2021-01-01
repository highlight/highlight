import React, { useState } from 'react';
import './App.scss';

import commonStyles from './Common.module.scss';
import { SidebarContext } from './components/Sidebar/SidebarContext';
import { Sidebar } from './components/Sidebar/Sidebar';
import { Header } from './components/Header/Header';
import { Player } from './pages/Player/PlayerPage';
import { DemoContext } from './DemoContext';

export const DemoRouter = () => {
    const [openSidebar, setOpenSidebar] = useState(false);
    return (
        <DemoContext.Provider value={{ demo: true }}>
            <SidebarContext.Provider value={{ openSidebar, setOpenSidebar }}>
                <Header />
                <div className={commonStyles.bodyWrapper}>
                    <Sidebar />
                    <Player />
                </div>
            </SidebarContext.Provider>
        </DemoContext.Provider>
    );
};