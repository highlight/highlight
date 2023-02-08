import Button from '@components/Button/Button/Button'
import Select from '@components/Select/Select'
import { getTagBackgroundColor } from '@components/Tag/Tag'
import { useGetCommentTagsForProjectQuery } from '@graph/hooks'
import SvgCloseIcon from '@icons/CloseIcon'
import { useParams } from '@util/react-router/useParams'
import { SelectProps } from 'antd'
import React from 'react'

import styles from './SessionCommentTagSelect.module.scss'

type Props = Pick<
	SelectProps<any>,
	'onChange' | 'className' | 'placeholder' | 'allowClear' | 'value'
> & {
	tagClosable?: boolean
}

const SessionCommentTagSelect = ({
	onChange,
	className,
	placeholder,
	allowClear,
	value,
	tagClosable = true,
}: Props) => {
	const { project_id } = useParams<{
		project_id: string
	}>()
	const { data: commentTagsData, loading } = useGetCommentTagsForProjectQuery(
		{
			variables: { project_id },
			fetchPolicy: 'network-only',
		},
	)

	return (
		<Select
			loading={loading}
			className={clsx(styles.tagSelect, className)}
			aria-label="Comment tags"
			value={value}
			allowClear={allowClear}
			defaultActiveFirstOption
			placeholder={placeholder}
			mode="tags"
			options={(
				commentTagsData?.session_comment_tags_for_project || []
			).map((tag) => ({
				displayValue: tag.name,
				id: tag.id,
				value: tag.name,
			}))}
			onChange={onChange}
			notFoundContent={
				<p>
					You can create tags by typing the tag name then pressing
					enter.
				</p>
			}
			tagRender={(props) => (
				<CustomTag {...props} tagClosable={tagClosable} />
			)}
		/>
	)
}

export default SessionCommentTagSelect

type CustomTagProps = {
	label: React.ReactNode
	value: any
	disabled: boolean
	onClose: (event?: React.MouseEvent<HTMLElement, MouseEvent>) => void
	closable: boolean
} & Pick<Props, 'tagClosable'>

const CustomTag = ({ onClose, label, value, tagClosable }: CustomTagProps) => {
	return (
		<div
			className={styles.customTag}
			style={{ backgroundColor: getTagBackgroundColor(value) }}
		>
			<span>{label}</span>
			{tagClosable && (
				<Button
					onClick={(e) => {
						onClose(e)
					}}
					trackingId="NewCommentTagClose"
					iconButton
					type="text"
					size="small"
				>
					<SvgCloseIcon />
				</Button>
			)}
		</div>
	)
}
