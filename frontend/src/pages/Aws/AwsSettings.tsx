import { useState, useEffect } from 'react'
import { Box, Form, Stack, Text } from '@highlight-run/ui/components'
import { Button } from '@components/Button'
import { toast } from '@components/Toaster'
import { AwsEc2InstancesList } from './AwsEc2InstancesList'
import {
	useCreateAwsCredentialsMutation,
	useGetAwsCredentialsQuery,
} from '@/graph/generated/hooks'
import { useProjectId } from '@/hooks/useProjectId'

export const AwsSettings: React.FC = () => {
	const { projectId } = useProjectId()
	// TODO: Remove
	const [selectedCredentialsId, setSelectedCredentialsId] =
		useState<string>('')

	const formStore = Form.useStore({
		defaultValues: {
			region: 'us-east-2',
			accessKeyId: '',
			secretAccessKey: '',
		},
	})

	const [createAwsCredentials, { loading }] =
		useCreateAwsCredentialsMutation()

	const { data: credentialsData } = useGetAwsCredentialsQuery({
		variables: { project_id: projectId },
	})

	useEffect(() => {
		if (credentialsData?.aws_credentials?.[0]?.id) {
			setSelectedCredentialsId(credentialsData.aws_credentials[0].id)
		}
	}, [credentialsData])

	formStore.useSubmit(async (formState) => {
		if (!formState.valid) {
			toast.error('Please fill out all required fields')
			return
		}

		try {
			const response = await createAwsCredentials({
				variables: {
					input: {
						region: formState.values.region,
						access_key_id: formState.values.accessKeyId,
						secret_access_key: formState.values.secretAccessKey,
						project_id: projectId,
					},
				},
			})

			if (response.data?.create_aws_credentials?.id) {
				setSelectedCredentialsId(
					response.data.create_aws_credentials.id,
				)
				toast.success('AWS credentials saved successfully')
				formStore.reset()
			}
		} catch (error: any) {
			toast.error(`Failed to save credentials: ${error.message}`)
		}
	})

	return (
		<Box p="20">
			{!selectedCredentialsId ? (
				<Form store={formStore}>
					<Stack gap="12">
						<Text size="large" weight="bold">
							AWS Credentials
						</Text>

						<Form.Select
							name={formStore.names.region}
							options={['us-east-1', 'us-east-2', 'us-west-1']}
							label="AWS Region"
							required
						/>

						<Form.Input
							name={formStore.names.accessKeyId}
							label="Access Key ID"
							required
						/>

						<Form.Input
							name={formStore.names.secretAccessKey}
							label="Secret Access Key"
							type="password"
							required
						/>

						<Button
							type="submit"
							loading={loading}
							trackingId="save-aws-credentials"
						>
							Save Credentials
						</Button>
					</Stack>
				</Form>
			) : (
				<Stack gap="12">
					<Text size="large" weight="bold">
						AWS Instances
					</Text>
					<AwsEc2InstancesList />
				</Stack>
			)}
		</Box>
	)
}
