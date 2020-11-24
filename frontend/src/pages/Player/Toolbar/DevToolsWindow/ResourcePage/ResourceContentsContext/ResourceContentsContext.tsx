import React from 'react';
import { NetworkResourceTiming } from '../../../../../../util/shared-types';

export const ExpandedResourceContext = React.createContext<{
    expandedResource: undefined | NetworkResourceTiming;
    setExpandedResource: (resource: undefined | NetworkResourceTiming) => void;
}>({
    expandedResource: undefined,
    setExpandedResource: (resource: NetworkResourceTiming | undefined) => {},
});
