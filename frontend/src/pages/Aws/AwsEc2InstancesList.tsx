import React, { useState } from 'react'
import { Box, Stack, Text } from '@highlight-run/ui/components'
import { toast } from '@components/Toaster'
import {
	useGetAwsEc2InstancesQuery,
	useSyncAwsEc2InstancesMutation,
	useUpdateAwsEc2InstanceMutation,
} from '@/graph/generated/hooks'
import { Button } from '@/components/Button'
import { useProjectId } from '@/hooks/useProjectId'
import Switch from '@/components/Switch/Switch'

export const AwsEc2InstancesList: React.FC = () => {
	const { projectId } = useProjectId()
	const [syncing, setSyncing] = useState(false)

	const { data, loading, refetch } = useGetAwsEc2InstancesQuery({
		variables: { project_id: projectId },
	})

	const [updateInstance] = useUpdateAwsEc2InstanceMutation({
		onCompleted: () => {
			toast.success('Successfully updated EC2 instance')
			refetch()
		},
		onError: (error) => {
			toast.error(`Failed to update instance: ${error.message}`)
		},
	})

	const [syncInstances] = useSyncAwsEc2InstancesMutation({
		onCompleted: () => {
			setSyncing(false)
			refetch()
			toast.success('Successfully synced EC2 instances')
		},
		onError: (error) => {
			setSyncing(false)
			toast.error(`Failed to sync: ${error.message}`)
		},
	})

	const handleSync = async () => {
		setSyncing(true)
		await syncInstances({
			variables: { project_id: projectId },
		})
	}

	const handleMetricsToggle = async (
		instanceId: string,
		enabled: boolean,
	) => {
		await updateInstance({
			variables: {
				input: {
					instance_id: instanceId,
					metrics_enabled: enabled,
				},
			},
		})
	}

	return (
		<div className="space-y-4">
			<div className="mb-4 flex items-center justify-between">
				<h2 className="text-xl font-semibold">EC2 Instances</h2>
				<Button
					kind="primary"
					onClick={handleSync}
					loading={syncing}
					trackingId="aws-settings_sync-ec2-instances"
				>
					Sync Instances
				</Button>
			</div>

			{loading ? (
				<Text align="center">Loading...</Text>
			) : data?.aws_ec2_instances?.length ? (
				<Stack direction="column" gap="16">
					{data.aws_ec2_instances.map((instance) => (
						<Box
							key={instance.instance_id}
							p="16"
							borderRadius="8"
							border="dividerWeak"
						>
							<Stack
								direction="row"
								justify="space-between"
								align="center"
							>
								<Stack direction="column" gap="8">
									<Text weight="bold">
										{instance.name || 'Unnamed Instance'}
									</Text>
									<Stack direction="row" gap="16">
										<Text color="moderate">
											ID: {instance.instance_id}
										</Text>
										<span
											className={`inline-flex items-center rounded-full px-2 py-1 text-xs ${
												instance.state === 'running'
													? 'bg-green-100 text-green-800'
													: 'bg-gray-100 text-gray-800'
											}`}
										>
											{instance.state}
										</span>
									</Stack>
								</Stack>
								<Stack direction="row" gap="8" align="center">
									<Text color="moderate">
										Collect Metrics
									</Text>
									<Switch
										trackingId="aws-settings_toggle-ec2-metrics"
										checked={instance.metrics_enabled}
										onChange={(checked) =>
											handleMetricsToggle(
												instance.instance_id,
												checked,
											)
										}
									/>
								</Stack>
							</Stack>
						</Box>
					))}
				</Stack>
			) : (
				<Text align="center">No instances found</Text>
			)}
		</div>
	)
}
