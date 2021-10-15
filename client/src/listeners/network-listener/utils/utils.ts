import { RequestResponsePair } from './models';

export const matchPerformanceTimingsWithRequestResponsePair = (
    performanceTimings: any[],
    requestResponsePairs: RequestResponsePair[],
    type: 'xmlhttprequest' | 'fetch'
) => {
    // Request response pairs are sorted by end time; sort performance timings the same way
    performanceTimings.sort((a, b) => a.responseEnd - b.responseEnd);
    const groupedPerformanceTimings = performanceTimings.reduce(
        (previous, performanceTiming) => {
            if (performanceTiming.initiatorType === type) {
                previous[type] = [
                    ...previous[type],
                    performanceTiming,
                ];
            } else {
                previous.others = [...previous.others, performanceTiming];
            }
            return previous;
        },
        { xmlhttprequest: [], others: [], fetch: [] }
    );

    /**
     * We offset the starting because performanceTimings starts recording
     * immediately and requestResponsePairs only start recording when Highlight
     * is loaded. Because of this requestResponsePairs will not always have the
     * first few requests made when a page loads.
     */
    const offset =
        groupedPerformanceTimings[type].length -
        requestResponsePairs.length;
    for (
        let i = offset;
        i < groupedPerformanceTimings[type].length;
        i++
    ) {
        if (groupedPerformanceTimings[type][i]) {
            groupedPerformanceTimings[type][
                i
            ].requestResponsePair = requestResponsePairs[i - offset];
        }
    }

    return [
        ...groupedPerformanceTimings.xmlhttprequest,
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
export const isHighlightNetworkResourceFilter = (
    name: string,
    backendUrl: string
) =>
    name
        .toLocaleLowerCase()
        .includes(process.env.PUBLIC_GRAPH_URI ?? 'highlight.run') ||
    name.toLocaleLowerCase().includes('highlight.run') ||
    name.toLocaleLowerCase().includes(backendUrl);
