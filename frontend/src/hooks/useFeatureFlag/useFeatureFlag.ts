import { useAuthContext } from '@authentication/AuthContext'
import { useGetProjectQuery } from '@graph/hooks'
import analytics from '@util/analytics'
import { isOnPrem } from '@util/onPrem/onPremUtils'
import { useParams } from '@util/react-router/useParams'
import { useEffect, useState } from 'react'

interface Config {
	percent: number
	project?: boolean
	workspace?: boolean
	projectOverride?: Set<string>
	workspaceOverride?: Set<string>
}

export enum Feature {
	AiQueryBuilder,
	MetricAlerts,
	Metrics,
}

// configures the criteria and percentage of population for which the feature is active.
// can configure to rollout by project, workspace, or admin
export const FeatureConfig: { [key: number]: Config } = {
	[Feature.AiQueryBuilder]: {
		workspace: true,
		percent: 100,
	},
	[Feature.MetricAlerts]: {
		workspace: true,
		percent: 100,
	},
	[Feature.Metrics]: {
		workspace: true,
		percent: 100,
	},
} as const

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

export const isFeatureOn = async function (
	feature: Feature,
	projectId?: string,
	workspaceId?: string,
	adminId?: string,
) {
	const config = FeatureConfig[feature]
	if (
		projectId &&
		config.projectOverride &&
		config.projectOverride.has(projectId)
	) {
		return true
	}
	if (
		workspaceId &&
		config.workspaceOverride &&
		config.workspaceOverride.has(workspaceId)
	) {
		return true
	}
	if (config.percent >= 100) {
		return true
	}
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

// use to roll out a feature to a subset of users. keep override undefined to use default logic
const useFeatureFlag = (feature: Feature, override?: boolean) => {
	const { admin } = useAuthContext()
	const { project_id } = useParams<{
		project_id: string
	}>()
	const { data: project } = useGetProjectQuery({
		variables: { id: project_id! },
		skip: !project_id,
	})

	const [isOn, setIsOn] = useState<boolean>(!isOnPrem && !!override)

	useEffect(() => {
		isFeatureOn(
			feature,
			project?.project?.id,
			project?.project?.workspace?.id,
			admin?.id,
		).then((_isOn) => {
			const on = override ?? _isOn
			setIsOn(on)
			analytics.track(Feature[feature], {
				[`FeatureFlag-${Feature[feature]}-on`]: on,
			})
		})
	}, [
		admin?.id,
		feature,
		override,
		project?.project?.id,
		project?.project?.workspace?.id,
	])

	return isOn
}

export default useFeatureFlag
