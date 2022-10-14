module.exports = {
	params: ({ args }) => {
		const { name } = args
		const directoryNames = name.split('/')
		const componentName = directoryNames[directoryNames.length - 1]

		return { componentName }
	},
}
