import moment from 'moment'

const now = moment()
export const getNow = () => now.clone()
