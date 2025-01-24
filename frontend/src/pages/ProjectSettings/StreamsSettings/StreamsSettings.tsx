import { Badge, Form, Stack, Text } from '@highlight-run/ui/components'
import React, { useState } from 'react'
import { LinkButton } from '@/components/LinkButton'
import { useProjectId } from '@/hooks/useProjectId'

const AWS_REGIONS = [
	{ value: 'us-west-1', name: 'US West (California)' },
	{ value: 'us-west-2', name: 'US West (Oregon)' },
	{ value: 'us-east-1', name: 'US East (Virginia)' },
	{ value: 'us-east-2', name: 'US East (Ohio)' },
]

// NOTE: Can't use static.highlight.io alias - must be a full S3 URL.
const CLOUDFORMATION_URL =
	'https://console.aws.amazon.com/cloudformation/home?region=[REGION]#/stacks/quickcreate?templateURL=https://highlight-client-bundle.s3.us-east-2.amazonaws.com/cloudformation-templates/metric-stream.yaml'
const STACK_NAME = 'highlight-metrics-stream'

export const StreamsSettings: React.FC = () => {
	const [selectedRegion, setSelectedRegion] = useState<string>('us-east-2')
	const { projectId } = useProjectId()
	const url =
		CLOUDFORMATION_URL.replace('[REGION]', selectedRegion.toString()) +
		`&stackName=${STACK_NAME}&param_HighlightProjectID=${projectId}`

	return (
		<Stack gap="32">
			<Stack direction="row" gap="6" align="center">
				<Text size="large" weight="bold">
					Streams
				</Text>
				<Badge label="Beta" variant="green" />
			</Stack>

			<Form>
				<Stack gap="24">
					<Text size="medium" weight="bold">
						AWS Infrastructure Monitoring
					</Text>

					<Text color="moderate" size="medium">
						Select the AWS regions you want to monitor. This will
						create CloudFormation stacks that set up metrics
						streaming to Highlight in each selected region.
					</Text>

					<Form.Select
						name="regions"
						label="AWS Regions"
						placeholder="Select regions to monitor"
						options={AWS_REGIONS}
						onValueChange={(value) => {
							setSelectedRegion(value.value)
						}}
						value={selectedRegion}
					/>

					<LinkButton
						to={url}
						kind="primary"
						size="medium"
						emphasis="high"
						disabled={!selectedRegion}
						trackingId="launch-cloudformation-stacks"
					>
						Launch CloudFormation Stack
					</LinkButton>

					<Text color="moderate" size="small">
						You will be redirected to the AWS Console for each
						selected region. Make sure you are logged in to your AWS
						account before proceeding.
					</Text>
				</Stack>
			</Form>
		</Stack>
	)
}
