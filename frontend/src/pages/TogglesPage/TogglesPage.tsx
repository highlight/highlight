import { Button } from '@components/Button'
import LoadingBox from '@components/LoadingBox'
import { useGetSessionTogglesQuery } from '@graph/hooks'
import {
	Box,
	Container,
	Heading,
	IconSolidPlus,
	Stack,
	Text,
} from '@highlight-run/ui'
import React from 'react'

import { useProjectId } from '@/hooks/useProjectId'
import { ToggleRowForm } from '@/pages/TogglesPage/ToggleRowForm'

import { ToggleRow } from './ToggleRow'

export const TogglesPage: React.FC = () => {
	const { projectId } = useProjectId()
	const { data, loading } = useGetSessionTogglesQuery({
		variables: {
			project_id: projectId!,
		},
		skip: !projectId,
	})
	const [createToggle, setCreateToggle] = React.useState(false)

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
					pt="24"
				>
					<Box
						display="flex"
						justifyContent="space-between"
						alignItems="center"
						width="full"
						pb="8"
					>
						<Text weight="bold" size="small" color="strong">
							All toggles
						</Text>
						<Button
							size="small"
							kind="primary"
							emphasis="high"
							trackingId="create-toggle-button"
							iconRight={<IconSolidPlus />}
							onClick={() => setCreateToggle(true)}
							disabled={createToggle}
						>
							Create toggle
						</Button>
					</Box>
					<Stack gap="6">
						{createToggle && (
							<ToggleRowForm
								onSubmit={() => setCreateToggle(false)}
								isCreate
							/>
						)}
						{loading && <LoadingBox />}
						{!loading &&
							(data?.session_toggles?.length ? (
								<>
									{data.session_toggles.map((toggle) => (
										<ToggleRow
											key={toggle.id}
											toggle={toggle}
										/>
									))}
								</>
							) : (
								<div>No toggles found</div>
							))}
					</Stack>
				</Box>
			</Box>
		</Container>
	)
}
