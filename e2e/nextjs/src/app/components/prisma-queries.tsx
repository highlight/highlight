'use client'

import { Button } from '@/app/components/button'
import { prisma } from '@/lib/prisma'
import { useEffect, useState } from 'react'

interface User {
	id: number
	name: string
}

export const PrismaQueries = () => {
	const [users, setUsers] = useState<User[]>([])

	const handleCreateUser = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault()

		const formData = new FormData(e.target as HTMLFormElement)
		const name = formData.get('name')

		try {
			const response = await fetch('/api/prisma-test', {
				method: 'POST',
				body: JSON.stringify({ name }),
				headers: {
					'Content-Type': 'application/json',
				},
			})

			if (!response.ok) throw new Error('Failed to create user')

			handleFetchUsers()
			;(e.target as HTMLFormElement).reset()
		} catch (error) {
			alert(`Failed to create user: ${error}`)
		}
	}

	const handleFetchUsers = async () => {
		try {
			const response = await fetch('/api/prisma-test')
			if (!response.ok) throw new Error('Failed to fetch users')
			const data = await response.json()
			setUsers(data)
		} catch (error) {
			alert(`Failed to fetch users: ${error}`)
		}
	}

	const handleDeleteUser = async (id: number) => {
		try {
			await fetch(`/api/prisma-test`, {
				method: 'DELETE',
				body: JSON.stringify({ id }),
			})

			handleFetchUsers()
		} catch (error) {
			alert(`Failed to delete user: ${error}`)
		}
	}

	useEffect(() => {
		handleFetchUsers()
	}, [])

	return (
		<div
			style={{
				display: 'flex',
				flexDirection: 'column',
				gap: '10px',
				padding: '2rem',
				width: '20rem',
			}}
		>
			<form
				onSubmit={handleCreateUser}
				style={{
					display: 'flex',
					flexDirection: 'column',
					gap: '10px',
				}}
			>
				<label style={{ display: 'flex', flexDirection: 'column' }}>
					Name:
					<input
						type="text"
						name="name"
						required
						style={{ borderRadius: '5px', padding: '5px' }}
					/>
				</label>
				<Button type="submit">Create User</Button>
			</form>

			{users.length > 0 ? (
				<ul>
					{users.map((user: any, index: number) => (
						<li key={index}>
							{user.name}
							<button
								onClick={() => handleDeleteUser(user.id)}
								style={{
									display: 'inline-block',
									background: 'transparent',
									border: 0,
									padding: 0,
									margin: 0,
									cursor: 'pointer',
									color: 'red',
									marginLeft: '10px',
								}}
							>
								Delete
							</button>
						</li>
					))}
				</ul>
			) : (
				<p>No users found</p>
			)}
		</div>
	)
}
