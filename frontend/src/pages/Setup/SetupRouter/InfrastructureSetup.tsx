import { useProjectId } from '@/hooks/useProjectId'
import { Box, Stack, Text, Form } from '@highlight-run/ui/components'
import { Header } from '@pages/Setup/Header'
import React, { useState } from 'react'

import { LinkButton } from '@/components/LinkButton'
const AWS_REGIONS = [
	{ value: 'us-west-1', name: 'US West (California)' },
	{ value: 'us-west-2', name: 'US West (Oregon)' },
	{ value: 'us-east-1', name: 'US East (Virginia)' },
	{ value: 'us-east-2', name: 'US East (Ohio)' },
]

const CLOUDFORMATION_URL =
	'https://console.aws.amazon.com/cloudformation/home?region=[REGION]#/stacks/quickcreate?templateURL=https://highlight-demo-video.s3.us-west-2.amazonaws.com/cloudformation-templates/metric-stream.yaml'

// const OTEL_ENDPOINT = 'http://otel.highlight.io:4318/v1/metrics'
const OTEL_ENDPOINT =
	'https://c916-174-102-176-170.ngrok-free.app/v1/metrics/firehose'

// TODO: Update
const STACK_NAME = 'highlight-metrics-stream-local-test'

export const InfrastructureSetup: React.FC = () => {
	const [selectedRegion, setSelectedRegion] = useState<string>('us-east-2')
	const { projectId } = useProjectId()
	const url =
		CLOUDFORMATION_URL.replace('[REGION]', selectedRegion.toString()) +
		`&stackName=${STACK_NAME}&param_HighlightProjectID=${projectId}&param_OTeLEndpoint=${encodeURIComponent(OTEL_ENDPOINT)}`
	return (
		<Form>
			<Box style={{ maxWidth: 560 }} my="40" mx="auto">
				<Header
					title="Infrastructure Monitoring Setup"
					subtitle="Monitor your AWS infrastructure metrics with Highlight"
				/>

				<Stack gap="24">
					<Box>
						<Text color="moderate" size="medium">
							Select the AWS regions you want to monitor. This
							will create CloudFormation stacks that set up
							metrics streaming to Highlight in each selected
							region.
						</Text>
					</Box>

					<Box>
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
					</Box>

					<Box>
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
					</Box>

					<Box>
						<Text color="moderate" size="small">
							Note: You will be redirected to the AWS Console for
							each selected region. Make sure you are logged in to
							your AWS account before proceeding.
						</Text>
					</Box>
				</Stack>
			</Box>
		</Form>
	)
}
