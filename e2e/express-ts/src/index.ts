import { startExpress } from './express'
import { startApollo } from './apollo'
import { startPino } from './pino'

startExpress().then(startApollo).then(startPino)

process.on('SIGINT', function () {
	process.exit()
})
