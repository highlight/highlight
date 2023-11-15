import LoadingBox from '@components/LoadingBox'
import { useGetSessionTogglesQuery } from '@graph/hooks'
import {
	Box,
	Container,
	Heading,
	IconSolidCheveronRight,
	Stack,
	Tag,
	Text,
} from '@highlight-run/ui'
import moment from 'moment'
import React from 'react'

import { useProjectId } from '@/hooks/useProjectId'

export const TogglesPage: React.FC = () => {
	const { projectId } = useProjectId()
	const { data, loading } = useGetSessionTogglesQuery({
		variables: {
			project_id: projectId!,
		},
		skip: !projectId,
	})

	return (
		<Container display="flex" flexDirection="column" gap="24">
			<Box style={{ maxWidth: 560 }} my="40" mx="auto" width="full">
				<Stack gap="16" direction="column" width="full">
					<Heading mt="16" level="h4">
						Feature toggles
					</Heading>
					<Text weight="medium" size="small" color="default">
						Manage the feature toggles for your project.
					</Text>
				</Stack>

				<Box
					width="full"
					display="flex"
					flexDirection="column"
					height="full"
				>
					{loading && <LoadingBox />}
					{!loading &&
						(data?.session_toggles?.length ? (
							<Stack gap="6" pt="24">
								{data.session_toggles.map((toggle) => (
									<Box
										key={toggle.id}
										border="dividerWeak"
										width="full"
										display="flex"
										p="12"
										gap="16"
										background="raised"
										borderRadius="6"
									>
										<Stack width="full" gap="12">
											<Box
												display="flex"
												alignItems="center"
												justifyContent="space-between"
												gap="8"
											>
												<Box
													display="flex"
													alignItems="center"
													gap="4"
												>
													<Text
														weight="medium"
														size="small"
														color="strong"
													>
														{toggle.name}
													</Text>
												</Box>
												<Box></Box>
												<Box display="flex" gap="8">
													<Tag
														kind="primary"
														size="medium"
														shape="basic"
														emphasis="low"
														iconRight={
															<IconSolidCheveronRight />
														}
														// onClick={() =>
														// 	navigateToAlert(
														// 		record,
														// 	)
														// }
													>
														Configure
													</Tag>
													{/* <AlertEnableSwitch
														record={record}
													/> */}
												</Box>
											</Box>
											<Stack gap="8">
												<Text
													weight="medium"
													size="xSmall"
													color="weak"
												>
													{toggle.created_at ===
													toggle.updated_at ? (
														<>
															<b>Created:</b>{' '}
															{moment(
																toggle.created_at,
															).fromNow()}
														</>
													) : (
														<>
															<b>Updated:</b>{' '}
															{moment(
																toggle.updated_at,
															).fromNow()}
														</>
													)}
												</Text>
											</Stack>
										</Stack>
									</Box>
								))}
							</Stack>
						) : (
							<div>No toggles found</div>
						))}
				</Box>
			</Box>
		</Container>
	)
}
