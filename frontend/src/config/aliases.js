const aliases = (prefix = `src`) => ({
	'@components': `${prefix}/components`,
	'@icons': `${prefix}/static`,
	'@util': `${prefix}/util`,
	'@hooks': `${prefix}/hooks`,
	'@pages': `${prefix}/pages`,
	'@routers': `${prefix}/routers`,
	'@graph': `${prefix}/graph/generated`,
	'@authentication': `${prefix}/authentication`,
	'@context': `${prefix}/context`,
	'@lottie': `${prefix}/lottie`,
})

module.exports = aliases
