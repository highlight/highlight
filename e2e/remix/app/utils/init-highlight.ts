import { CONSTANTS } from '~/constants'
import { H } from '@highlight-run/node'

export function initHighlight() {
	H.init({ projectID: CONSTANTS.HIGHLIGHT_PROJECT_ID })
}
