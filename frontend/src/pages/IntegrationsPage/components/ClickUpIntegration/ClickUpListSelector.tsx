import Select from '@components/Select/Select'
import { useGetClickUpFoldersQuery } from '@graph/hooks'
import { Form } from '@highlight-run/ui/components'
import { ContainerSelectionProps } from '@pages/IntegrationsPage/IssueTrackerIntegrations'
import useLocalStorage from '@rehooks/local-storage'
import { useParams } from '@util/react-router/useParams'
import { useEffect, useMemo } from 'react'

import * as style from '../style.css'

const ClickUpListSelector: React.FC<ContainerSelectionProps> = ({
	setSelectionId,
	disabled,
}) => {
	const { project_id } = useParams<{ project_id: string }>()
	const { data, loading } = useGetClickUpFoldersQuery({
		variables: { project_id: project_id! },
		skip: !project_id,
	})

	const clickUpListOptions = useMemo(() => {
		const folderLists =
			data?.clickup_folders.flatMap((f) =>
				f.lists.map((l) => ({
					value: l.id,
					id: l.id,
					displayValue: `${f.name} > ${l.name}`,
				})),
			) || []
		const folderlessLists =
			data?.clickup_folderless_lists.map((l) => ({
				value: l.id,
				id: l.id,
				displayValue: `${l.name}`,
			})) || []
		return folderLists.concat(folderlessLists)
	}, [data])

	const [selectedClickUpListId, setClickUpListId] = useLocalStorage(
		'highlight-clickup-default-list',
		'',
	)

	useEffect(() => {
		setSelectionId('' + selectedClickUpListId)
	}, [selectedClickUpListId, setSelectionId])

	useEffect(() => {
		if (selectedClickUpListId === '' && clickUpListOptions.length > 0) {
			setClickUpListId(clickUpListOptions[0].value)
		}
	}, [selectedClickUpListId, clickUpListOptions, setClickUpListId])

	return (
		<Form.NamedSection label="ClickUp List" name="clickupList">
			<Select
				aria-label="ClickUp List"
				placeholder="Choose a list to create the task in"
				options={clickUpListOptions}
				onChange={setClickUpListId}
				value={'' + selectedClickUpListId}
				notFoundContent={<p>No lists found</p>}
				loading={loading}
				className={style.selectContainer}
				disabled={disabled}
			/>
		</Form.NamedSection>
	)
}

export default ClickUpListSelector
