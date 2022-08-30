import { FetchResult } from '@apollo/client';
import { UpsertDashboardMutation } from '@graph/operations';
import * as Types from '@graph/schemas';
import {
    DashboardDefinition,
    DashboardMetricConfigInput,
    Maybe,
} from '@graph/schemas';
import { createContext } from '@util/context/context';

interface DashboardsContext {
    allAdmins: Maybe<
        { __typename?: 'Admin' } & Pick<
            Types.Admin,
            'id' | 'name' | 'email' | 'photo_url'
        >
    >[];
    dashboards: Maybe<DashboardDefinition>[];
    updateDashboard: ({
        id,
        name,
        metrics,
        layout,
    }: {
        id?: string;
        name: string;
        metrics: DashboardMetricConfigInput[];
        layout?: string;
    }) => Promise<FetchResult<UpsertDashboardMutation>>;
}

export const [
    useDashboardsContext,
    DashboardsContextProvider,
] = createContext<DashboardsContext>('Dashboards');
