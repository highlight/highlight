import Card from '@components/Card/Card'
import CopyText from '@components/CopyText/CopyText'
import Input from '@components/Input/Input'
import ProgressBarTable from '@components/ProgressBarTable/ProgressBarTable'
import Select from '@components/Select/Select'
import {
	useGetProjectQuery,
	useGetSourcemapFilesLazyQuery,
	useGetSourcemapVersionsQuery,
} from '@graph/hooks'
import { Box, Stack } from '@highlight-run/ui/components'
import { useParams } from '@util/react-router/useParams'
import { debounce } from 'lodash'
import React, { useEffect } from 'react'

import BorderBox from '@/components/BorderBox/BorderBox'
import BoxLabel from '@/components/BoxLabel/BoxLabel'

import styles from './SourcemapSettings.module.css'

const SourcemapSettings = () => {
	const { project_id } = useParams<{ project_id: string }>()
	const [query, setQuery] = React.useState<string>('')
	const [versions, setVersions] = React.useState<string[]>([])
	const [selectedVersion, setSelectedVersion] = React.useState<string>()

	const { data: projectData } = useGetProjectQuery({
		variables: {
			id: project_id!,
		},
		skip: !project_id,
	})

	const [getSourcemapFilesQuery, { data, loading }] =
		useGetSourcemapFilesLazyQuery({
			variables: {
				project_id: project_id!,
			},
		})

	const { data: versionsData, loading: versionsLoading } =
		useGetSourcemapVersionsQuery({
			variables: {
				project_id: project_id!,
			},
			skip: !project_id,
			onCompleted: (data) => {
				const trimmedVersions = data?.sourcemap_versions?.map((v) =>
					v.replace(`${project_id}/`, '').replace('/', ''),
				)

				setVersions(trimmedVersions || [])
			},
		})

	const needToSelectVersion =
		(versionsData?.sourcemap_versions.length || 0) > 1 && !selectedVersion

	useEffect(() => {
		if (versionsLoading || needToSelectVersion || !project_id) {
			return
		}

		getSourcemapFilesQuery({
			variables: {
				project_id,
				version: selectedVersion,
			},
		})
		// Only needs to be triggered when loading is complete or the selected
		// version changes. We don't update when needToSelectVersion changes
		// because we can't reset data.sourcemap_files.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [versionsLoading, selectedVersion])

	const fileKeys = data?.sourcemap_files?.map((file) => file.key) || []

	const visibleFileKeys = query.length
		? fileKeys.filter((key) => key && key.indexOf(query) > -1)
		: fileKeys

	const filterResults = debounce((query: string) => {
		setQuery(query)
	}, 300)

	return (
		<BorderBox>
			<Stack gap="8">
				{projectData?.project?.secret && (
					<Stack gap="8">
						<BoxLabel
							label="Sourcemaps"
							info={
								<>
									Sourcemaps can be used to undo JavaScript
									minification in your error traces. You can
									learn more about them in{' '}
									<a
										href="https://docs.highlight.run/sourcemaps"
										target="_blank"
										rel="noreferrer"
									>
										our sourcemap docs
									</a>
									. Use the API key below to upload your
									sourcemaps to Highlight.
								</>
							}
						/>
						<CopyText
							text={projectData.project.secret}
							onCopyTooltipText="API key copied to your clipboard!"
						/>
					</Stack>
				)}

				<Box borderTop="dividerWeak" />

				<BoxLabel info="Below is a list of sourcemap files we have for your project." />

				<Card
					className={styles.list}
					title={
						<div className={styles.listHeader}>
							{versions.length > 1 && (
								<div>
									<Select
										aria-label="Sourcemap app version"
										className={styles.versionSelect}
										placeholder="Select a version of your app"
										options={versions.map((v) => ({
											id: v,
											value: v,
											displayValue: v,
										}))}
										onChange={setSelectedVersion}
										value={selectedVersion}
										notFoundContent={
											<p>No sourcemaps found</p>
										}
									/>
								</div>
							)}
							<Input
								allowClear
								style={{ width: '100%' }}
								placeholder="Search for a file"
								onChange={(e) => filterResults(e.target.value)}
								size="small"
								disabled={versionsLoading || loading}
							/>
						</div>
					}
				>
					<ProgressBarTable
						loading={loading}
						columns={[
							{
								title: 'Sourcemap',
								dataIndex: 'key',
								key: 'key',
								width: '100%',
								render: (key) => (
									<div className={styles.listRow}>{key}</div>
								),
							},
						]}
						data={visibleFileKeys?.map((file) => ({
							key: file,
							file: file,
						}))}
						onClickHandler={() => {}}
						noDataMessage={
							query ? (
								<p>No sourcemap files match your search.</p>
							) : needToSelectVersion ? (
								<p>
									We have sourcemaps for multiple versions of
									your app. Please select a version to see
									your sourcemaps.
								</p>
							) : (
								<p>
									We don't have any sourcemap files for your
									project. Once you upload some you will be
									able to view them here.
								</p>
							)
						}
						noDataTitle={
							query.length
								? 'Nothing to see here'
								: needToSelectVersion
									? 'Select a version'
									: 'No sourcemap data yet 😔'
						}
					/>
				</Card>
			</Stack>
		</BorderBox>
	)
}

export default SourcemapSettings
