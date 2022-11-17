import QueryBuilder from '@components/QueryBuilder/QueryBuilder'
import { useErrorSearchContext } from '@pages/Errors/ErrorSearchContext/ErrorSearchContext'

const ErrorQueryBuilder = () => {
	const searchContext = useErrorSearchContext()
	return <QueryBuilder searchContext={searchContext} />
}

export default ErrorQueryBuilder
