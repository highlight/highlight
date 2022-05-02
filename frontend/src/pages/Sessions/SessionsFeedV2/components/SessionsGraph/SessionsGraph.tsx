import { Session } from '@graph/schemas';
import React from 'react';
import { Bar, ComposedChart, ResponsiveContainer, ReferenceLine, Tooltip } from 'recharts';

const SessionsGraph = ({ sessions }: { sessions: Session[] }) => {
    const [startIdx, setStartIdx] = React.useState<number>(0);
    const [endIdx, setEndIdx] = React.useState<number>(sessions.length);
    return (
        <ResponsiveContainer width="100%" height={20}>
            <ComposedChart
                data={sessions}
                height={200}
                margin={{
                    top: 4,
                    right: 0,
                    left: 0,
                    bottom: 2,
                }}
            >
                <defs>
		    <Tooltip />
                    <ReferenceLine x={startIdx} stroke="grey" />
                    <ReferenceLine x={endIdx} stroke="grey" />
                    <Bar dataKey={'event_counts'} fill="blue" />
                </defs>
            </ComposedChart>
        </ResponsiveContainer>
    );
};

export default SessionsGraph;
