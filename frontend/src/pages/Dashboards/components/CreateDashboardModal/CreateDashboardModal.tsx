import Button from '@components/Button/Button/Button'
import { CardFormActionsContainer } from '@components/Card/Card'
import Input from '@components/Input/Input'
import Modal from '@components/Modal/Modal'
import ModalBody from '@components/ModalBody/ModalBody'
import SvgPlusIcon from '@icons/PlusIcon'
import alertStyles from '@pages/Alerts/Alerts.module.scss'
import { useDashboardsContext } from '@pages/Dashboards/DashboardsContext/DashboardsContext'
import { DEFAULT_METRICS_LAYOUT } from '@pages/Dashboards/Metrics'
import { useParams } from '@util/react-router/useParams'
import { Form } from 'antd'
import { H } from 'highlight.run'
import React, { useState } from 'react'
import { useHistory } from 'react-router-dom'

import styles from './CreateDashboardModal.module.scss'

const CreateDashboardModal = () => {
	const { project_id } = useParams<{ project_id: string }>()
	const history = useHistory()
	const { updateDashboard } = useDashboardsContext()
	const [showModal, setShowModal] = useState(false)
	const [newDashboard, setNewDashboard] = useState<string>('')

	const onCreateNewDashboard = () => {
		if (!newDashboard) return
		updateDashboard({
			name: newDashboard,
			metrics: [],
			layout: JSON.stringify(DEFAULT_METRICS_LAYOUT),
		}).then((r) => {
			const newId = r.data?.upsertDashboard || ''
			history.push(`/${project_id}/dashboards/${newId}`)
		})
	}

	return (
		<>
			<Modal
				onCancel={() => {
					setShowModal(false)
				}}
				visible={showModal}
				title={'Create a New Dashboard'}
				width="800px"
			>
				<ModalBody>
					<Form
						onFinish={() => {
							onCreateNewDashboard()
							setShowModal(false)
						}}
					>
						<section className={styles.section}>
							<h3>Dashboard Title</h3>
							<Input
								placeholder="API Performance"
								name="Dashboard Title"
								value={newDashboard}
								onChange={(e) => {
									setNewDashboard(e.target.value)
								}}
								autoFocus
							/>
						</section>

						<CardFormActionsContainer>
							<div className={styles.submitRow}>
								<Button
									type={'primary'}
									style={{
										width: 105,
									}}
									icon={
										<SvgPlusIcon
											style={{
												marginBottom: 2,
												marginRight:
													'var(--size-xSmall)',
											}}
										/>
									}
									trackingId={'CreateDashboard'}
									htmlType="submit"
								>
									Create
								</Button>
							</div>
						</CardFormActionsContainer>
					</Form>
				</ModalBody>
			</Modal>
			<Button
				trackingId={'NewDashboard'}
				className={alertStyles.callToAction}
				onClick={() => {
					setShowModal(true)
					H.track(`CreateDashboardModal-Open`)
				}}
			>
				New Dashboard
			</Button>
		</>
	)
}

export default CreateDashboardModal
