import { FetchResult } from '@apollo/client';
import { UpsertDashboardMutation } from '@graph/operations';
import * as Types from '@graph/schemas';
import {
    DashboardDefinition,
    DashboardMetricConfigInput,
    Maybe,
} from '@graph/schemas';
import { createContext } from '@util/context/context';
import moment from 'moment';

interface DashboardsContext {
    allAdmins: Maybe<
        { __typename?: 'Admin' } & Pick<
            Types.Admin,
            'id' | 'name' | 'email' | 'photo_url' | 'role'
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
    dateRange: { start_date: string; end_date: string } | undefined;
    setDateRange: (
        startDate: moment.MomentInput,
        endDate: moment.MomentInput
    ) => void;
    lookbackMinutes: number;
}

export const [
    useDashboardsContext,
    DashboardsContextProvider,
] = createContext<DashboardsContext>('Dashboards');
