import React from 'react';

export const ExpandedResourceContext = React.createContext<{
    expandedResource: undefined | PerformanceResourceTiming;
    setExpandedResource: (
        resource: undefined | PerformanceResourceTiming
    ) => void;
}>({
    expandedResource: undefined,
    setExpandedResource: (
        resource: PerformanceResourceTiming | undefined
    ) => {},
});
