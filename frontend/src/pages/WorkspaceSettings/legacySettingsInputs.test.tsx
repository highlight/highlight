import { readFileSync } from 'node:fs'
import React, { act } from 'react'
import { createRoot, Root } from 'react-dom/client'
import { vi } from 'vitest'
;(
	globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }
).IS_REACT_ACT_ENVIRONMENT = true

const readSource = (path: string) =>
	readFileSync(new URL(path, import.meta.url), 'utf8')

const mocks = vi.hoisted(() => ({
	routeParams: { project_id: 'project-1' } as Record<string, string>,
	editProject: vi.fn(() => Promise.resolve()),
	editWorkspace: vi.fn(() => Promise.resolve()),
	deleteProject: vi.fn(),
}))

vi.mock('@util/react-router/useParams', () => ({
	useParams: () => mocks.routeParams,
}))

vi.mock('@graph/hooks', () => ({
	useEditProjectMutation: () => [
		mocks.editProject,
		{
			loading: false,
		},
	],
	useEditWorkspaceMutation: () => [
		mocks.editWorkspace,
		{
			loading: false,
		},
	],
	useGetProjectQuery: () => ({
		loading: false,
		data: {
			project: {
				name: 'Apollo',
				billing_email: 'billing@example.com',
			},
		},
	}),
	useDeleteProjectMutation: () => [
		mocks.deleteProject,
		{
			loading: false,
			data: undefined,
		},
	],
}))

vi.mock('@graph/operations', () => ({
	namedOperations: {
		Query: {
			GetProjects: 'GetProjects',
			GetProject: 'GetProject',
		},
	},
}))

vi.mock('@components/Toaster', () => ({
	toast: {
		success: vi.fn(),
	},
}))

vi.mock('@util/analytics', () => ({
	default: {
		track: vi.fn(),
	},
}))

vi.mock('@/authentication/AuthContext', () => ({
	useAuthContext: () => ({
		workspaceRole: 'ADMIN',
	}),
}))

vi.mock('@/graph/generated/schemas', () => ({
	AdminRole: {
		Admin: 'ADMIN',
	},
}))

vi.mock('react-router-dom', () => ({
	Navigate: () => null,
	useLocation: () => ({
		hash: '',
		pathname: '/',
		search: '',
	}),
}))

import { DangerForm } from '../ProjectSettings/DangerForm/DangerForm'
import { FieldsForm } from './FieldsForm/FieldsForm'

const roots: Root[] = []

const renderComponent = async (component: React.ReactElement) => {
	const container = document.createElement('div')
	document.body.appendChild(container)
	const root = createRoot(container)
	roots.push(root)

	await act(async () => {
		root.render(component)
	})

	return container
}

const updateInput = async (input: HTMLInputElement, value: string) => {
	const valueSetter = Object.getOwnPropertyDescriptor(
		HTMLInputElement.prototype,
		'value',
	)?.set

	valueSetter?.call(input, value)

	await act(async () => {
		input.dispatchEvent(new Event('input', { bubbles: true }))
	})
}

const submitForm = async (form: HTMLFormElement | null) => {
	expect(form).not.toBeNull()

	await act(async () => {
		form?.dispatchEvent(
			new Event('submit', { bubbles: true, cancelable: true }),
		)
	})
}

const getButtonByText = (container: HTMLElement, text: string) => {
	const button = Array.from(container.querySelectorAll('button')).find(
		(candidate) => candidate.textContent === text,
	)

	expect(button).toBeDefined()

	return button as HTMLButtonElement
}

beforeEach(() => {
	mocks.routeParams = { project_id: 'project-1' }
	mocks.editProject.mockClear()
	mocks.editWorkspace.mockClear()
	mocks.deleteProject.mockClear()
})

afterEach(() => {
	roots.splice(0).forEach((root) => {
		act(() => {
			root.unmount()
		})
	})
	document.body.innerHTML = ''
})

describe('settings forms legacy UI migration', () => {
	it('keeps FieldsForm off the Ant Design-backed legacy wrappers', () => {
		const source = readSource('./FieldsForm/FieldsForm.tsx')

		expect(source).not.toContain('@components/Input/Input')
		expect(source).not.toContain('components/Button/Button/Button')
		expect(source).toContain('@highlight-run/ui/components')
	})

	it('submits edited project fields through the existing mutation', async () => {
		const container = await renderComponent(
			<FieldsForm
				defaultName="Apollo"
				defaultEmail="billing@example.com"
			/>,
		)

		const nameInput =
			container.querySelector<HTMLInputElement>('input[name="name"]')
		const emailInput = container.querySelector<HTMLInputElement>(
			'input[name="email"]',
		)
		expect(nameInput).not.toBeNull()
		expect(emailInput).not.toBeNull()

		await updateInput(nameInput!, 'Hermes')
		await updateInput(emailInput!, 'finance@example.com')
		await submitForm(container.querySelector('form'))

		expect(mocks.editProject).toHaveBeenCalledWith({
			variables: {
				id: 'project-1',
				name: 'Hermes',
				billing_email: 'finance@example.com',
			},
		})
	})

	it('keeps workspace fields disabled when editing is forbidden', async () => {
		mocks.routeParams = { workspace_id: 'workspace-1' }

		const container = await renderComponent(
			<FieldsForm defaultName="Workspace" disabled />,
		)
		const nameInput =
			container.querySelector<HTMLInputElement>('input[name="name"]')
		const emailInput = container.querySelector<HTMLInputElement>(
			'input[name="email"]',
		)

		expect(nameInput).not.toBeNull()
		expect(nameInput?.disabled).toBe(true)
		expect(emailInput).toBeNull()
		expect(getButtonByText(container, 'Save changes').disabled).toBe(true)
	})

	it('keeps DangerForm off the Ant Design-backed legacy wrappers', () => {
		const source = readSource(
			'../ProjectSettings/DangerForm/DangerForm.tsx',
		)

		expect(source).not.toContain('@components/Input/Input')
		expect(source).not.toContain('components/Button/Button/Button')
		expect(source).toContain('@highlight-run/ui/components')
	})

	it('requires the project name before delete can submit', async () => {
		const container = await renderComponent(<DangerForm />)

		const confirmationInput =
			container.querySelector<HTMLInputElement>('input[name="text"]')
		const deleteButton = getButtonByText(container, 'Delete')

		expect(confirmationInput).not.toBeNull()
		expect(deleteButton.disabled).toBe(true)

		await updateInput(confirmationInput!, 'Apollo')
		expect(deleteButton.disabled).toBe(false)

		await submitForm(deleteButton.closest('form'))

		expect(mocks.deleteProject).toHaveBeenCalledWith({
			variables: {
				id: 'project-1',
			},
		})
	})
})
