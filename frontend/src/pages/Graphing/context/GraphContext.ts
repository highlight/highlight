import { createContext } from '@util/context/context'
import React from 'react'

export type GraphData = { [graphID: string]: any[] }

export interface GraphContext {
	graphData: React.RefObject<GraphData>
	setGraphData: React.Dispatch<React.SetStateAction<GraphData>>
	errors: string[]
	setErrors: React.Dispatch<React.SetStateAction<string[]>>
}

export const [useGraphContext, GraphContextProvider] =
	createContext<GraphContext>('GraphContext')
