import { startApollo } from './apollo'
import { startExpress } from './express'
import { startPino } from './pino'

startExpress().then(startApollo).then(startPino)
