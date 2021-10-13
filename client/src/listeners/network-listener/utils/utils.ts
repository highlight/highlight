import { RequestResponsePair } from './models';

const KEY_MAPPINGS = {
    xmlhttprequest: 'xhr',
    fetch: 'fetch',
};

export const matchPerformanceTimingsWithRequestResponsePair = (
    performanceTimings: any[],
    requestResponsePairs: RequestResponsePair[],
    type: 'xmlhttprequest' | 'fetch'
) => {
    const groupedPerformanceTimings = performanceTimings.reduce(
        (previous, performanceTiming) => {
            if (performanceTiming.initiatorType === type) {
                return {
                    ...previous,
                    [KEY_MAPPINGS[type]]: [
                        ...previous[KEY_MAPPINGS[type]],
                        performanceTiming,
                    ],
                };
            } else {
                return {
                    ...previous,
                    others: [...previous.others, performanceTiming],
                };
            }
        },
        { xhr: [], others: [], fetch: [] }
    );

    /**
     * We offset the starting because performanceTimings starts recording
     * immediately and requestResponsePairs only start recording when Highlight
     * is loaded. Because of this requestResponsePairs will not always have the
     * first few requests made when a page loads.
     */
    const startingIndex =
        groupedPerformanceTimings[KEY_MAPPINGS[type]].length -
        requestResponsePairs.length;
    for (
        let i = startingIndex;
        i < groupedPerformanceTimings[KEY_MAPPINGS[type]].length;
        i++
    ) {
        // TODO: Fix this matching.
        if (groupedPerformanceTimings[KEY_MAPPINGS[type]][i]) {
            groupedPerformanceTimings[KEY_MAPPINGS[type]][
                i
            ].requestResponsePair = requestResponsePairs[i];
        }
    }

    return [
        ...groupedPerformanceTimings.xhr,
        ...groupedPerformanceTimings.others,
        ...groupedPerformanceTimings.fetch,
    ]
        .sort((a, b) => a.fetchStart - b.fetchStart)
        .map((performanceTiming) => {
            performanceTiming.toJSON = function () {
                return {
                    initiatorType: this.initiatorType,
                    startTime: this.startTime,
                    responseEnd: this.responseEnd,
                    name: this.name,
                    transferSize: this.transferSize,
                    encodedBodySize: this.encodedBodySize,
                    requestResponsePairs: this.requestResponsePair,
                };
            };
            return performanceTiming;
        });
};

/**
 * Returns true if the name is a Highlight network resource.
 * This is used to filter out Highlight requests/responses from showing up on end application's network resources.
 */
const isHighlightNetworkResourceFilter = (
    name: string,
    backendUrl: string
) =>
    name
        .toLocaleLowerCase()
        .includes(process.env.PUBLIC_GRAPH_URI ?? 'highlight.run') ||
    name.toLocaleLowerCase().includes('highlight.run') ||
    name.toLocaleLowerCase().includes(backendUrl);

export const shouldNetworkRequestBeRecorded = (url: string, highlightBackendUrl: string, tracingOrigins: string[]) => {
    return !isHighlightNetworkResourceFilter(url, highlightBackendUrl)
        || shouldNetworkRequestBeTraced(url, tracingOrigins);
}

export const shouldNetworkRequestBeTraced = (
    url: string,
    tracingOrigins: string[],
) => {
    let result = false;
    tracingOrigins.forEach((origin) => {
        if (url.includes(origin)) { // TODO: regex support
            result = true;
        }
    });
    return result;
}

function makeId(length: number) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * 
 charactersLength));
   }
   return result;
} 

export const createNetworkRequestId = () => {
    // Long enough to avoid collisions within a given session,
    // not long enough to be unguessable
    return makeId(5);
}
