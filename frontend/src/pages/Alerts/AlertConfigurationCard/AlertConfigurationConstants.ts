const SECONDS_PER_MINUTE = 60
const MINUTES_PER_HOUR = 60
const HOURS_PER_DAY = 24
const DAYS_PER_WEEK = 7

export const DEFAULT_FREQUENCY = `${SECONDS_PER_MINUTE * MINUTES_PER_HOUR}` // 3600 seconds/1 hour
export const DEFAULT_LOOKBACK_PERIOD = '30' // 30 minutes

export const FREQUENCIES = [
	{
		displayValue: '1 second',
		value: '1',
		id: '1s',
	},
	{
		displayValue: '5 seconds',
		value: '5',
		id: '5s',
	},
	{
		displayValue: '15 seconds',
		value: '15',
		id: '15s',
	},
	{
		displayValue: '30 seconds',
		value: '30',
		id: '30s',
	},
	{
		displayValue: '1 minute',
		value: `${SECONDS_PER_MINUTE}`,
		id: '1m',
	},
	{
		displayValue: '5 minutes',
		value: `${SECONDS_PER_MINUTE * 5}`,
		id: '5m',
	},
	{
		displayValue: '15 minutes',
		value: `${SECONDS_PER_MINUTE * 15}`,
		id: '15m',
	},
	{
		displayValue: '30 minutes',
		value: `${SECONDS_PER_MINUTE * 30}`,
		id: '30m',
	},
	{
		displayValue: '1 hour',
		value: `${SECONDS_PER_MINUTE * MINUTES_PER_HOUR}`,
		id: '1h',
	},
	{
		displayValue: '3 hours',
		value: `${SECONDS_PER_MINUTE * MINUTES_PER_HOUR * 3}`,
		id: '3h',
	},
	{
		displayValue: '12 hours',
		value: `${SECONDS_PER_MINUTE * MINUTES_PER_HOUR * 12}`,
		id: '12h',
	},
	{
		displayValue: '1 day',
		value: `${SECONDS_PER_MINUTE * MINUTES_PER_HOUR * HOURS_PER_DAY}`,
		id: '1d',
	},
	{
		displayValue: '3 days',
		value: `${SECONDS_PER_MINUTE * MINUTES_PER_HOUR * HOURS_PER_DAY * 3}`,
		id: '3d',
	},
	{
		displayValue: '1 week',
		value: `${
			SECONDS_PER_MINUTE *
			MINUTES_PER_HOUR *
			HOURS_PER_DAY *
			DAYS_PER_WEEK
		}`,
		id: '7d',
	},
]

export const LOOKBACK_PERIODS = [
	{
		displayValue: '5 minutes',
		value: '5',
		id: '5m',
	},
	{
		displayValue: '10 minutes',
		value: '10',
		id: '10m',
	},
	{
		displayValue: '30 minutes',
		value: '30',
		id: '30m',
	},
	{
		displayValue: '60 minutes',
		value: '60',
		id: '60m',
	},
	{
		displayValue: '3 hours',
		value: `${MINUTES_PER_HOUR * 3}`,
		id: '3h',
	},
	{
		displayValue: '12 hours',
		value: `${MINUTES_PER_HOUR * 12}`,
		id: '12h',
	},
	{
		displayValue: '24 hours',
		value: `${MINUTES_PER_HOUR * 24}`,
		id: '24h',
	},
]
