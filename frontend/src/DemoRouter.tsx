import React, { useState, useEffect } from 'react';
import './App.css';

import commonStyles from './Common.module.css';
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