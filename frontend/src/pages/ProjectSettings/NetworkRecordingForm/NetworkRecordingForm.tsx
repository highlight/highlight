import { FieldsBox } from '@components/FieldsBox/FieldsBox'
import InfoTooltip from '@components/InfoTooltip/InfoTooltip'
import { LoadingBar } from '@components/Loading/Loading'
import Select from '@components/Select/Select'
import { useParams } from '@util/react-router/useParams'

import { useProjectSettingsContext } from '@/pages/ProjectSettings/ProjectSettingsContext/ProjectSettingsContext'

import styles from './NetworkRecordingForm.module.scss'

export const NetworkRecordingForm = () => {
	const { project_id } = useParams<{ project_id: string }>()
	const {
		allProjectSettings: data,
		loading,
		setAllProjectSettings,
	} = useProjectSettingsContext()

	if (loading) {
		return <LoadingBar />
	}

	return (
		<FieldsBox id="network">
			<h3>Network Recording Settings</h3>
			<form key={project_id}>
				<p>
					Adjust how we process your network requests at the project
					level.
				</p>
				<div className={styles.fieldRow}>
					<label className={styles.fieldKey}>
						Recorded Domains
						<InfoTooltip
							title="Record aggregate metrics for network requests that are sent to these domains."
							size="medium"
							className={styles.tooltip}
						/>
					</label>
					<Select
						mode="tags"
						placeholder="api.highlight.run"
						notFoundContent={null}
						value={data?.projectSettings?.backend_domains ?? []}
						onChange={(domains: string[]) => {
							setAllProjectSettings((currentProjectSettings) =>
								currentProjectSettings?.projectSettings
									? {
											projectSettings: {
												...currentProjectSettings.projectSettings,
												backend_domains: domains,
											},
									  }
									: currentProjectSettings,
							)
						}}
					/>
				</div>
			</form>
		</FieldsBox>
	)
}
