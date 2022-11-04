import { makeVar, useReactiveVar } from '@apollo/client'

const setPlayerTime = makeVar<number>(0)

const usePlayerTime = () => {
	const playerTime = useReactiveVar(setPlayerTime)
	return [playerTime, setPlayerTime] as const
}

export default usePlayerTime
