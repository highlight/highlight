import { startExpress } from './express'
import { startApollo } from './apollo'
import { startPino } from './pino'

startExpress()
startApollo()
startPino()

process.on('SIGINT', function () {
	process.exit()
})
