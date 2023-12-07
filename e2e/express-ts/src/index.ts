import { startExpress } from './express'
import { startApollo } from './apollo'

startExpress()
startApollo()

process.on('SIGINT', function () {
	process.exit()
})
