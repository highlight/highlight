import { GetAlertsPagePayloadQuery } from '@graph/operations';
import { createContext } from '@util/context/context';

interface AlertsContext {
    alertsPayload: GetAlertsPagePayloadQuery | undefined;
    setAlertsPayload: React.Dispatch<
        React.SetStateAction<GetAlertsPagePayloadQuery | undefined>
    >;
    loading: boolean;
    slackUrl: string;
}

export const [useAlertsContext, AlertsContextProvider] =
    createContext<AlertsContext>('Alerts');
