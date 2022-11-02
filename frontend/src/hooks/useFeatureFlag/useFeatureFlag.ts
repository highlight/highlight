import { useAuthContext } from '@authentication/AuthContext'
import { useGetProjectQuery } from '@graph/hooks'
import { useParams } from '@util/react-router/useParams'
import { H } from 'highlight.run'
import { useEffect, useState } from 'react'

interface Config {
	project?: boolean
	workspace?: boolean
	percent: number
}

export enum Feature {
	HistogramTimelineV2,
}

// configures the criteria and percentage of population for which the feature is active.
// can configure to rollout by project, workspace, or admin
export const FeatureConfig: { [key: number]: Config } = {
	[Feature.HistogramTimelineV2]: {
		workspace: true,
		percent: 25,
	},
}

const isActive = async function (
	feature: Feature,
	key: string,
	percent: number,
) {
	const text = `${Feature[feature]}-${key}`
	const textAsBuffer = new TextEncoder().encode(text)
	const hashBuffer = await window.crypto.subtle.digest(
		'SHA-256',
		textAsBuffer,
	)
	const hashArray = Array.from(new Uint8Array(hashBuffer))
	const digest = hashArray.reduce((a, b) => a + b, 0)

	return digest % Math.ceil(100 / percent) === 0
}

const isFeatureOn = async function (
	feature: Feature,
	projectId?: string,
	workspaceId?: string,
	adminId?: string,
) {
	const config = FeatureConfig[feature]
	return isActive(
		feature,
		(config.project
			? projectId
			: config.workspace
			? workspaceId
			: adminId) ?? 'demo',
		config.percent,
	)
}

// use to roll out a feature to a subset of users.
const useFeature = (feature: Feature, override?: boolean) => {
	const { admin } = useAuthContext()
	const { project_id } = useParams<{
		project_id: string
	}>()
	const { data: project } = useGetProjectQuery({
		variables: { id: project_id },
		skip: !project_id,
	})

	const [isOn, setIsOn] = useState<boolean>(!!override)

	useEffect(() => {
		isFeatureOn(
			feature,
			project?.project?.id,
			project?.workspace?.id,
			admin?.id,
		).then((_isOn) => {
			const on = override ?? _isOn
			setIsOn(on)
			H.track(`Feature-${Feature[feature]}`, { on })
		})
	}, [
		admin?.id,
		feature,
		override,
		project?.project?.id,
		project?.workspace?.id,
	])

	return isOn
}

export default useFeature
