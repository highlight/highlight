const SECONDS_PER_MINUTE = 60
const MINUTES_PER_HOUR = 60
const HOURS_PER_DAY = 24
const DAYS_PER_WEEK = 7

const SECONDS_PER_HOUR = SECONDS_PER_MINUTE * MINUTES_PER_HOUR
const SECONDS_PER_DAY = SECONDS_PER_HOUR * HOURS_PER_DAY
const SECONDS_PER_WEEK = SECONDS_PER_DAY * DAYS_PER_WEEK

export const DEFAULT_FREQUENCY = `${SECONDS_PER_MINUTE * 30}` // 1800 seconds (30 minutes)
export const DEFAULT_LOOKBACK_PERIOD = '30' // 30 minutes

export const FREQUENCIES = [
	{
		name: '1 second',
		value: '1',
		id: '1s',
	},
	{
		name: '5 seconds',
		value: '5',
		id: '5s',
	},
	{
		name: '15 seconds',
		value: '15',
		id: '15s',
	},
	{
		name: '30 seconds',
		value: '30',
		id: '30s',
	},
	{
		name: '1 minute',
		value: `${SECONDS_PER_MINUTE}`,
		id: '1m',
	},
	{
		name: '5 minutes',
		value: `${SECONDS_PER_MINUTE * 5}`,
		id: '5m',
	},
	{
		name: '15 minutes',
		value: `${SECONDS_PER_MINUTE * 15}`,
		id: '15m',
	},
	{
		name: '30 minutes',
		value: `${SECONDS_PER_MINUTE * 30}`,
		id: '30m',
	},
	{
		name: '1 hour',
		value: `${SECONDS_PER_HOUR}`,
		id: '1h',
	},
	{
		name: '3 hours',
		value: `${SECONDS_PER_HOUR * 3}`,
		id: '3h',
	},
	{
		name: '12 hours',
		value: `${SECONDS_PER_HOUR * 12}`,
		id: '12h',
	},
	{
		name: '1 day',
		value: `${SECONDS_PER_DAY}`,
		id: '1d',
	},
	{
		name: '3 days',
		value: `${SECONDS_PER_DAY * 3}`,
		id: '3d',
	},
	{
		name: '1 week',
		value: `${SECONDS_PER_WEEK}`,
		id: '7d',
	},
]

export const LOOKBACK_PERIODS = [
	{
		name: '5 minutes',
		value: '5',
		id: '5m',
	},
	{
		name: '10 minutes',
		value: '10',
		id: '10m',
	},
	{
		name: '30 minutes',
		value: '30',
		id: '30m',
	},
	{
		name: '60 minutes',
		value: '60',
		id: '60m',
	},
	{
		name: '3 hours',
		value: `${MINUTES_PER_HOUR * 3}`,
		id: '3h',
	},
	{
		name: '12 hours',
		value: `${MINUTES_PER_HOUR * 12}`,
		id: '12h',
	},
	{
		name: '24 hours',
		value: `${MINUTES_PER_HOUR * 24}`,
		id: '24h',
	},
]
