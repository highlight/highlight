import React, { useState } from 'react'
import { Table, Text } from '@highlight-run/ui/components'
import { toast } from '@components/Toaster'
import {
	useGetAwsEc2InstancesQuery,
	useSyncAwsEc2InstancesMutation,
} from '@/graph/generated/hooks'
import { Button } from '@/components/Button'

export const AwsEc2InstancesList: React.FC<{ credentialsId: string }> = ({
	credentialsId,
}) => {
	const [syncing, setSyncing] = useState(false)

	const { data, loading, refetch } = useGetAwsEc2InstancesQuery({
		variables: { credentials_id: String(credentialsId) },
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
			variables: { credentials_id: String(credentialsId) },
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

			<Table>
				<Table.Header>
					<Table.Row>
						<Table.Header>Name</Table.Header>
						<Table.Header>Instance ID</Table.Header>
						<Table.Header>Type</Table.Header>
						<Table.Header>State</Table.Header>
						<Table.Header>Private IP</Table.Header>
						<Table.Header>Public IP</Table.Header>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{loading ? (
						<Table.Row>
							<Table.Cell colSpan={6}>
								<Text align="center">Loading...</Text>
							</Table.Cell>
						</Table.Row>
					) : data?.aws_ec2_instances?.length ? (
						data.aws_ec2_instances.map((instance) => (
							<Table.Row key={instance.instance_id}>
								<Table.Cell>{instance.name}</Table.Cell>
								<Table.Cell>{instance.instance_id}</Table.Cell>
								<Table.Cell>{instance.state}</Table.Cell>
								<Table.Cell>
									<span
										className={`inline-flex items-center rounded-full px-2 py-1 text-xs ${
											instance.state === 'running'
												? 'bg-green-100 text-green-800'
												: 'bg-gray-100 text-gray-800'
										}`}
									>
										{instance.state}
									</span>
								</Table.Cell>
							</Table.Row>
						))
					) : (
						<Table.Row>
							<Table.Cell colSpan={6}>
								<Text align="center">No instances found</Text>
							</Table.Cell>
						</Table.Row>
					)}
				</Table.Body>
			</Table>
		</div>
	)
}
