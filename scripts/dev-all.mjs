#!/usr/bin/env node
// @ts-check
import chalk from 'chalk'
import { ChildProcess, spawn } from 'node:child_process'
import { on } from 'node:events'
import { dirname, join } from 'node:path'
import { createInterface } from 'node:readline'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const projectRoot = join(__dirname, '..')

const tasks = [
	{
		name: 'frontend',
		color: chalk.blueBright,
		command: 'yarn',
		args: ['frontend:start'],
	},
	{
		name: 'backend',
		color: chalk.green,
		command: 'make',
		args: ['start'],
		cwd: join(projectRoot, 'backend'),
	},
	{
		name: 'redis',
		color: chalk.red,
		command: 'redis-server',
	},
]

const children = tasks.map((task, i) => {
	const child = spawn(task.command, task.args, {
		stdio: 'pipe',
		cwd: task.cwd,
	})

	const reader = createInterface(child.stdout)
	reader.on('line', (line) => {
		console.info(task.color(`[${task.name}]`), line)
	})

	return child
})

const whenChildClosed = (/** @type {ChildProcess} */ child) => {
	child.kill()
	return on(child, 'close')
}

const cleanlyExit = async () => {
	await Promise.all(children.map(whenChildClosed))
	process.exit(0)
}

process.on('SIGINT', cleanlyExit)
process.on('SIGTERM', cleanlyExit)
