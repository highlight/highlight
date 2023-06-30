import { Badge } from '@highlight-run/ui'

import { Maybe } from '@/graph/generated/schemas'

type Props = {
	version: Maybe<string> | undefined
}

const AppVersionCell = ({ version }: Props) => {
	return (
		<Badge size="medium" color="weak">
			{version}
		</Badge>
	)
}

export { AppVersionCell }
