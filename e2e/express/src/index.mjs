/* const express = require('express')
const highlight = require('@highlight-run/node')
const H = highlight.H */

import express from 'express'
import { H } from '@highlight-run/node'

H.init({ projectID: '1' })

const app = express()
const port = 3001

app.get('/', (req, res) => {
	res.send('Hello World!')
})

app.listen(port, () => {
	console.log(`Example app listening on port ${port}`)
})

process.on('SIGINT', function () {
	process.exit()
})
