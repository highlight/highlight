import Select from '@components/Select/Select'
import { useGetHeightListsQuery } from '@graph/hooks'
import { Form } from '@highlight-run/ui'
import { ContainerSelectionProps } from '@pages/IntegrationsPage/IssueTrackerIntegrations'
import useLocalStorage from '@rehooks/local-storage'
import { useParams } from '@util/react-router/useParams'
import { useEffect, useMemo } from 'react'

import * as style from '../style.css'

const HeightListSelector: React.FC<ContainerSelectionProps> = ({
	setSelectionId,
	disabled,
}) => {
	const { project_id } = useParams<{ project_id: string }>()
	const { data, loading } = useGetHeightListsQuery({
		variables: { project_id: project_id! },
		skip: !project_id,
	})

	const heightListOptions = useMemo(() => {
		return (
			data?.height_lists.map((list) => {
				return {
					value: list.id,
					id: list.id,
					displayValue: list.name,
				}
			}) || []
		)
	}, [data])

	const [selectedHeightListId, setHeightListId] = useLocalStorage(
		'highlight-height-default-list',
		'',
	)

	useEffect(() => {
		setSelectionId('' + selectedHeightListId)
	}, [selectedHeightListId, setSelectionId])

	useEffect(() => {
		if (selectedHeightListId === '' && heightListOptions.length > 0) {
			setHeightListId(heightListOptions[0].value)
		}
	}, [selectedHeightListId, heightListOptions, setHeightListId])

	return (
		<Form.NamedSection label="Height List" name="heightList">
			<Select
				aria-label="Height List"
				placeholder="Choose a list to create the task in"
				options={heightListOptions}
				onChange={setHeightListId}
				value={'' + selectedHeightListId}
				notFoundContent={<p>No lists found</p>}
				loading={loading}
				className={style.selectContainer}
				disabled={disabled}
			/>
		</Form.NamedSection>
	)
}

export default HeightListSelector
