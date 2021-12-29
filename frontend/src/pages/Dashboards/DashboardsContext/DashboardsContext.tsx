import { createContext } from '@util/context/context';

interface DashboardsContext {
    dashboards: any[];
    setDashboards: any;
}

export const [
    useDashboardsContext,
    DashboardsContextProvider,
] = createContext<DashboardsContext>('Dashboards');
