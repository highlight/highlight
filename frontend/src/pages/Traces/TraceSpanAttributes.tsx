import JsonViewer from '@/components/JsonViewer/JsonViewer'
import { FlameGraphSpan } from '@/pages/Traces/utils'

type Props = { span: FlameGraphSpan }

export const TraceSpanAttributes: React.FC<Props> = ({ span }) => {
	const attributes = { ...span }

	// Drop any attributes we don't want to display
	delete attributes.__typename
	delete attributes.children

	return <JsonViewer src={attributes} collapsed={false} />
}
