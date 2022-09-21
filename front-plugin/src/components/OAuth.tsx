import React from 'react'
import { Button } from '@frontapp/ui-kit'
import { useHighlightContext } from '../providers/highlightContext'

const OAuth = () => {
	const { loading, admin, logout, externalAuth } = useHighlightContext()
	if (loading) {
		return null
	}
	return (
		<div className={'flex flex-col'}>
			<div className={'flex flex-row justify-end items-center p-3'}>
				{admin ? (
					<Button
						onClick={() => {
							logout!()
						}}
					>
						Logout
					</Button>
				) : (
					<Button
						onClick={() => {
							externalAuth!()
						}}
					>
						Login
					</Button>
				)}
				{admin?.admin?.photo_url && (
					<div className={'flex justify-end p-3'}>
						<img
							className={'rounded-lg w-8 h-8'}
							src={admin?.admin?.photo_url}
							alt={`${admin.admin.name}'s profile`}
						/>
					</div>
				)}
			</div>
		</div>
	)
}

export default OAuth
