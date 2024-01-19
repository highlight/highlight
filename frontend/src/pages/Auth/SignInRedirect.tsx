import { Navigate } from 'react-router-dom'

import { SIGN_IN_ROUTE } from '@/pages/Auth/AuthRouter'
import { authRedirect } from '@/pages/Auth/utils'

export const SignInRedirect: React.FC = () => {
	if (!authRedirect.get()) {
		// Store the original path so we can redirect back to it later.
		const dest = window.location.href.replace(window.location.origin, '')

		// Perform the comparison on pathname rather than dest because we want to
		// include the search string in the redirect.
		if (window.location.pathname !== '/') {
			authRedirect.set(dest)
		}
	}

	return <Navigate to={SIGN_IN_ROUTE} replace />
}
