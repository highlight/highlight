import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
	const { name } = await request.json()

	try {
		const user = await prisma.user.create({
			data: { name },
		})
		return NextResponse.json(user)
	} catch (error) {
		return NextResponse.json(
			{ error: 'Failed to create user' },
			{ status: 500 },
		)
	}
}

export async function GET() {
	try {
		const users = await prisma.user.findMany()
		return NextResponse.json(users)
	} catch (error) {
		return NextResponse.json(
			{ error: 'Failed to fetch users' },
			{ status: 500 },
		)
	}
}

export async function DELETE(request: Request) {
	const { id } = await request.json()

	try {
		await prisma.user.delete({ where: { id } })
		return NextResponse.json({ message: 'User deleted' })
	} catch (error) {
		return NextResponse.json(
			{ error: 'Failed to delete user' },
			{ status: 500 },
		)
	}
}
