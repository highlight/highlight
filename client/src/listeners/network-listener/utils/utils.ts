import { RequestResponsePair } from './models';

export const matchPerformanceTimingsWithRequestResponsePair = (
    performanceTimings: any[],
    requestResponsePairs: RequestResponsePair[]
) => {
    const groupedPerformanceTimings = performanceTimings.reduce(
        (previous, performanceTiming) => {
            if (performanceTiming.initiatorType === 'xmlhttprequest') {
                return {
                    ...previous,
                    xhr: [...previous.xhr, performanceTiming],
                };
            } else {
                return {
                    ...previous,
                    others: [...previous.others, performanceTiming],
                };
            }
        },
        { xhr: [], others: [] }
    );

    /**
     * We offset the starting because performanceTimings starts recording
     * immediately and requestResponsePairs only start recording when Highlight
     * is loaded. Because of this requestResponsePairs will not always have the
     * first few requests made when a page loads.
     */
    const startingIndex =
        groupedPerformanceTimings.xhr.length - requestResponsePairs.length;
    for (let i = startingIndex; i < groupedPerformanceTimings.xhr.length; i++) {
        groupedPerformanceTimings.xhr[i].requestResponsePair =
            requestResponsePairs[i];
    }

    return [
        ...groupedPerformanceTimings.xhr,
        ...groupedPerformanceTimings.others,
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
export const highlightNetworkResourceFilter = (name: string) =>
    name
        .toLocaleLowerCase()
        .includes(process.env.PUBLIC_GRAPH_URI ?? 'highlight.run') ||
    name.toLocaleLowerCase().includes('highlight.run');
