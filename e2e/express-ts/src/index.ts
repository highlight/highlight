import { startExpress } from './express'
import { startApollo } from './apollo'
import { startPino } from './pino'

startExpress().then(startApollo).then(startPino)
