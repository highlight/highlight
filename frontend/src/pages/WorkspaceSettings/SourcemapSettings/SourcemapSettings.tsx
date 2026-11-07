import CopyText from '@components/CopyText/CopyText'
import LoadingBox from '@components/LoadingBox'
import {
	useGetProjectQuery,
	useGetSourcemapFilesLazyQuery,
	useGetSourcemapVersionsQuery,
} from '@graph/hooks'
import {
	Box,
	Select,
	SelectOption,
	Stack,
	Table,
	Text,
} from '@highlight-run/ui/components'
import { useParams } from '@util/react-router/useParams'
import { debounce } from 'lodash'
import React, { useEffect, useMemo } from 'react'

import BorderBox from '@/components/BorderBox/BorderBox'
import BoxLabel from '@/components/BoxLabel/BoxLabel'

import styles from './SourcemapSettings.module.css'

const resolveEmptySourcemapDescription = (
	hasQuery: boolean,
	needToSelectVersion: boolean,
): string => {
	if (hasQuery) {
		return 'No sourcemap files match your search.'
	}
	if (needToSelectVersion) {
		return 'We have sourcemaps for multiple versions of your app. Please select a version to see your sourcemaps.'
	}
	return "We don't have any sourcemap files for your project. Once you upload some you will be able to view them here."
}

const filterSourcemapFileKeys = (
	files: Array<{ key?: string | null }> | undefined,
	query: string,
): (string | undefined)[] => {
	const fileKeys = (files ?? []).map((file) => file.key ?? undefined)
	if (!query.length) {
		return fileKeys
	}
	return fileKeys.filter((key) => Boolean(key && key.includes(query)))
}

const trimSourcemapVersions = (
	rawVersions: string[] | undefined,
	projectId: string | undefined,
): string[] => {
	if (!rawVersions) {
		return []
	}
	return rawVersions.map((v) =>
		v.replace(`${projectId}/`, '').replace('/', ''),
	)
}

type SourcemapApiKeySectionProps = {
	secret?: string | null
}

const SourcemapApiKeySection: React.FC<SourcemapApiKeySectionProps> = ({
	secret,
}) => {
	if (!secret) {
		return null
	}
	return (
		<Stack gap="8">
			<BoxLabel
				label="Sourcemaps"
				info={
					<>
						Sourcemaps can be used to undo JavaScript minification
						in your error traces. You can learn more about them in{' '}
						<a
							href="https://docs.highlight.run/sourcemaps"
							target="_blank"
							rel="noreferrer"
						>
							our sourcemap docs
						</a>
						. Use the API key below to upload your sourcemaps to
						Highlight.
					</>
				}
			/>
			<CopyText
				text={secret}
				onCopyTooltipText="API key copied to your clipboard!"
			/>
		</Stack>
	)
}

type SourcemapFilesTableProps = {
	loading: boolean
	visibleFileKeys: (string | undefined)[]
	hasQuery: boolean
	needToSelectVersion: boolean
	onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

const SourcemapFilesTable: React.FC<SourcemapFilesTableProps> = ({
	loading,
	visibleFileKeys,
	hasQuery,
	needToSelectVersion,
	onSearchChange,
}) => {
	const renderRows = () => {
		if (loading) {
			return (
				<Table.FullRow>
					<LoadingBox />
				</Table.FullRow>
			)
		}
		if (!visibleFileKeys.length) {
			return (
				<Table.FullRow>
					<Text size="small" color="weak">
						{resolveEmptySourcemapDescription(
							hasQuery,
							needToSelectVersion,
						)}
					</Text>
				</Table.FullRow>
			)
		}
		return visibleFileKeys.map((fileKey) => (
			<Table.Row key={fileKey} gridColumns={['1fr']}>
				<Table.Cell>
					<div className={styles.listRow}>{fileKey}</div>
				</Table.Cell>
			</Table.Row>
		))
	}

	return (
		<Table>
			<Table.Search
				placeholder="Search for a file"
				handleChange={onSearchChange}
			/>
			<Table.Head>
				<Table.Row gridColumns={['1fr']}>
					<Table.Header>Sourcemap</Table.Header>
				</Table.Row>
			</Table.Head>
			<Table.Body>{renderRows()}</Table.Body>
		</Table>
	)
}

const SourcemapSettings = () => {
	const { project_id } = useParams<{ project_id: string }>()
	const [query, setQuery] = React.useState<string>('')
	const [versions, setVersions] = React.useState<string[]>([])
	const [selectedVersion, setSelectedVersion] = React.useState<string>()

	const { data: projectData } = useGetProjectQuery({
		variables: { id: project_id! },
		skip: !project_id,
	})

	const [getSourcemapFilesQuery, { data, loading }] =
		useGetSourcemapFilesLazyQuery({
			variables: { project_id: project_id! },
		})

	const { loading: versionsLoading } = useGetSourcemapVersionsQuery({
		variables: { project_id: project_id! },
		skip: !project_id,
		onCompleted: (d) => {
			setVersions(trimSourcemapVersions(d.sourcemap_versions, project_id))
		},
	})

	const needToSelectVersion = versions.length > 1 && !selectedVersion
	const canFetchFiles = !versionsLoading && !needToSelectVersion

	useEffect(() => {
		if (!canFetchFiles || !project_id) {
			return
		}
		getSourcemapFilesQuery({
			variables: {
				project_id,
				version: selectedVersion,
			},
		})
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [canFetchFiles, selectedVersion])

	const visibleFileKeys = filterSourcemapFileKeys(
		data?.sourcemap_files,
		query,
	)

	const handleSearchChange = useMemo(
		() =>
			debounce((e: React.ChangeEvent<HTMLInputElement>) => {
				setQuery(e.target.value)
			}, 300),
		[],
	)

	const versionOptions: SelectOption[] = versions.map((v) => ({
		id: v,
		name: v,
		value: v,
	}))

	return (
		<BorderBox>
			<Stack gap="8">
				<SourcemapApiKeySection secret={projectData?.project?.secret} />
				<Box borderTop="dividerWeak" />
				<BoxLabel info="Below is a list of sourcemap files we have for your project." />
				{versions.length > 1 && (
					<Select
						aria-label="Sourcemap app version"
						className={styles.versionSelect}
						placeholder="Select a version of your app"
						filterable
						options={versionOptions}
						value={selectedVersion}
						onValueChange={(option: SelectOption) =>
							setSelectedVersion(String(option.value))
						}
					/>
				)}
				<SourcemapFilesTable
					loading={loading}
					visibleFileKeys={visibleFileKeys}
					hasQuery={query.length > 0}
					needToSelectVersion={needToSelectVersion}
					onSearchChange={handleSearchChange}
				/>
			</Stack>
		</BorderBox>
	)
}

export default SourcemapSettings
