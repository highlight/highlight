import {
	useGetProjectQuery,
	useGetSourcemapFilesLazyQuery,
	useGetSourcemapVersionsQuery,
} from '@graph/hooks'
import {
	Box,
	Callout,
	Form,
	Heading,
	Select,
	Stack,
	Table,
	Text,
} from '@highlight-run/ui/components'
import { useParams } from '@util/react-router/useParams'
import { debounce } from 'lodash'
import React, { useEffect, useMemo, useState } from 'react'

import BorderBox from '@/components/BorderBox/BorderBox'
import CopyText from '@components/CopyText/CopyText'
import { LoadingBar } from '@components/Loading/Loading'

export const SourcemapSettings = () => {
	const { project_id } = useParams<{ project_id: string }>()
	const [query, setQuery] = useState<string>('')
	const [versions, setVersions] = useState<string[]>([])
	const [selectedVersion, setSelectedVersion] = useState<string | undefined>()

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

	const { loading: versionsLoading } = useGetSourcemapVersionsQuery({
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

	const needToSelectVersion = versions.length > 1 && !selectedVersion

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
	}, [versionsLoading, selectedVersion, project_id, needToSelectVersion, getSourcemapFilesQuery])

	const fileKeys = data?.sourcemap_files?.map((file) => file.key) || []

	const visibleFileKeys = useMemo(() => {
		return query.length
			? fileKeys.filter((key) => key && key.indexOf(query) > -1)
			: fileKeys
	}, [fileKeys, query])

	const filterResults = debounce((query: string) => {
		setQuery(query)
	}, 300)

	return (
		<Box background="white" border="dividerWeak" borderRadius="8" p="24">
			<Stack gap="24">
				{projectData?.project?.secret && (
					<Stack gap="12">
						<Heading level="h4">Sourcemaps</Heading>
						<Text color="moderate">
							Sourcemaps can be used to undo JavaScript
							minification in your error traces. You can learn
							more about them in{' '}
							<a
								href="https://docs.highlight.run/sourcemaps"
								target="_blank"
								rel="noreferrer"
							>
								our sourcemap docs
							</a>
							. Use the API key below to upload your sourcemaps to
							Highlight.
						</Text>
						<CopyText
							text={projectData.project.secret}
							onCopyTooltipText="API key copied to your clipboard!"
						/>
					</Stack>
				)}

				<Stack gap="16">
					<Box borderTop="dividerWeak" style={{ marginLeft: -24, marginRight: -24 }} />

					<Text color="moderate">
						Below is a list of sourcemap files we have for your
						project.
					</Text>

					<Box
						border="dividerWeak"
						borderRadius="8"
						background="white"
						p="16"
					>
						<Stack gap="16">
							<Box
								display="flex"
								justifyContent="space-between"
								alignItems="center"
								gap="16"
							>
								{versions.length > 1 && (
									<Box style={{ width: 250 }}>
										<Select
											aria-label="Sourcemap app version"
											placeholder="Select a version of your app"
											options={versions.map((v) => ({
												name: v,
												value: v,
											}))}
											onValueChange={(v: any) => {
												setSelectedVersion(v?.value)
											}}
											value={
												selectedVersion
													? {
															name: selectedVersion,
															value: selectedVersion,
													  }
													: undefined
											}
										/>
									</Box>
								)}
								<Box flexGrow={1}>
									<Form>
										<Form.Input
											name="search"
											placeholder="Search for a file"
											onChange={(
												e: React.ChangeEvent<HTMLInputElement>,
											) =>
												filterResults(e.target.value)
											}
											disabled={
												versionsLoading || loading
											}
										/>
									</Form>
								</Box>
							</Box>

							{loading ? (
								<LoadingBar />
							) : (
								<Table>
									<Table.Head>
										<Table.Row>
											<Table.Header>
												Sourcemap
											</Table.Header>
										</Table.Row>
									</Table.Head>
									<Table.Body>
										{visibleFileKeys.length > 0 ? (
											visibleFileKeys.map((key) => (
												<Table.Row key={key}>
													<Table.Cell>
														<Text
															family="monospace"
															size="small"
															break="all"
														>
															{key}
														</Text>
													</Table.Cell>
												</Table.Row>
											))
										) : (
											<Table.Row>
												<Table.Cell>
													<Box
														py="24"
														textAlign="center"
													>
														<Text color="moderate">
															{query
																? 'No sourcemap files match your search.'
																: needToSelectVersion
																? 'We have sourcemaps for multiple versions of your app. Please select a version to see your sourcemaps.'
																: "We don't have any sourcemap files for your project. Once you upload some you will be able to view them here."}
														</Text>
													</Box>
												</Table.Cell>
											</Table.Row>
										)}
									</Table.Body>
								</Table>
							)}
						</Stack>
					</Box>
				</Stack>
			</Stack>
		</Box>

	)
}

export default SourcemapSettings
