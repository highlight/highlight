import { Button } from '@/components/Button'
import { Box, Stack, Text } from '@highlight-run/ui/components'
import { Header } from '@pages/Setup/Header'
import React from 'react'

const CLOUDFORMATION_URL =
	'https://us-west-2.console.aws.amazon.com/cloudformation/home?region=us-west-2#/stacks/quickcreate?stackName=highlight-metrics-stream&templateURL=https://highlight-demo-video.s3.us-west-2.amazonaws.com/cloudformation-templates/metric-stream.yaml'

export const InfrastructureSetup: React.FC = () => {
	return (
		<Box>
			<Box style={{ maxWidth: 560 }} my="40" mx="auto">
				<Header
					title="Deploy with AWS CloudFormation"
					subtitle="Launch a CloudFormation stack to set up AWS metrics streaming."
				/>

				<Stack gap="24">
					<Box>
						<Text color="moderate" size="medium">
							Click the button below to launch the AWS
							CloudFormation template. This will create a new
							stack in your AWS account that sets up metrics
							streaming to Highlight.
						</Text>
					</Box>

					<Box>
						<Button
							kind="primary"
							size="medium"
							emphasis="high"
							onClick={() =>
								window.open(CLOUDFORMATION_URL, '_blank')
							}
							trackingId="launch-cloudformation"
						>
							Launch CloudFormation Stack
						</Button>
					</Box>

					<Box>
						<Text color="moderate" size="small">
							Note: You will be redirected to the AWS Console.
							Make sure you are logged in to your AWS account
							before proceeding.
						</Text>
					</Box>
				</Stack>
			</Box>
		</Box>
	)
}
