import { H, NodeOptions } from '@highlight-run/node'

type NextContext = {
	params: Promise<Record<string, string>>
}
type NextHandler = (request: Request, context: NextContext) => Promise<Response>

export function Highlight(options: NodeOptions) {
	const NodeH = H.init(options)

	return (originalHandler: NextHandler) =>
		async (request: Request, context: NextContext) => {
			if (!NodeH) throw new Error('Highlight not initialized')

			return await H.runWithHeaders<Promise<Response>>(
				`${request.method?.toUpperCase()} - ${request.url}`,
				request.headers as any,
				async () => originalHandler(request, context),
			)
		}
}
