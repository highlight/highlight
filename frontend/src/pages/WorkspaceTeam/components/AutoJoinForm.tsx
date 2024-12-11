import Checkbox from 'antd/es/checkbox'
import React from 'react'

import Tooltip from '@/components/Tooltip/Tooltip'
import {
	AutoJoinCheckboxProps,
	AutoJoinTooltipProps,
	BaseAutoJoinForm,
} from '@/pages/WorkspaceTeam/components/BaseAutoJoinForm'

export const AutoJoinForm: React.FC = () => {
	const checkbox: React.FC<AutoJoinCheckboxProps> = ({
		onChange,
		...props
	}) => <Checkbox onChange={(e) => onChange(e.target.checked)} {...props} />

	const tooltip: React.FC<AutoJoinTooltipProps> = (props) => (
		<Tooltip align={{ offset: [0, 6] }} mouseEnterDelay={0} {...props} />
	)

	return <BaseAutoJoinForm checkbox={checkbox} tooltip={tooltip} />
}
