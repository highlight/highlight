import Select from '@components/Select/Select'
import { DiscordChannel } from '@graph/schemas'
import { Form } from 'antd'

import styles from './AlertConfigurationCard.module.css'

type Props = {
	options: DiscordChannel[]
	defaultName: string
	selectedChannels: DiscordChannel[]
	onChannelsChange: (channelsSelected: DiscordChannel[]) => void
}

const mapToSelectOptions = (channels: DiscordChannel[]) => {
	return channels.map((channel) => {
		return {
			displayValue: channel.name,
			value: channel.id,
			id: channel.id,
		}
	})
}

export const DiscordChannnelsSection = ({
	onChannelsChange,
	options,
	defaultName,
	selectedChannels,
}: Props) => {
	const handleChange = (channelIds: string[]) => {
		const channels = options.filter((option) => {
			return channelIds.includes(option.id)
		})
		onChannelsChange(channels)
	}

	return (
		<section>
			<h3>Discord Channels to Notify</h3>
			<p>
				Pick Discord channels or people to message when an alert is
				created.
			</p>
			<Form.Item shouldUpdate>
				{() => (
					<Select
						className={styles.channelSelect}
						options={mapToSelectOptions(options)}
						value={mapToSelectOptions(selectedChannels)}
						mode="multiple"
						placeholder={`Select a channel(s) or person(s) to send ${defaultName} to.`}
						onChange={handleChange}
					/>
				)}
			</Form.Item>
		</section>
	)
}
