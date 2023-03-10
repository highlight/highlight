import { GetLogAlertsPagePayloadQuery } from '@graph/operations'
import { createContext } from '@util/context/context'

interface LogAlertsContext {
	alertsPayload: GetLogAlertsPagePayloadQuery | undefined
	loading: boolean
	slackUrl: string
}

export const [useLogAlertsContext, LogAlertsContextProvider] =
	createContext<LogAlertsContext>('Alerts')
