import QueryBuilder from '@components/QueryBuilder/QueryBuilder'
import { useErrorSearchContext } from '@pages/Errors/ErrorSearchContext/ErrorSearchContext'

interface Props {
	readonly?: boolean
}

const ErrorQueryBuilder = (props: Props) => {
	const searchContext = useErrorSearchContext()
	return <QueryBuilder searchContext={searchContext} {...props} />
}

export default ErrorQueryBuilder
