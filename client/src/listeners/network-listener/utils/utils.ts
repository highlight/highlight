import { RequestResponsePair } from './models';

export const HIGHLIGHT_REQUEST_HEADER = 'X-Highlight-Request'

const normalizeUrl = (url: string) => {
    // Remove trailing forward slashes
    return url.replace(/\/+$/, "");
}

export const matchPerformanceTimingsWithRequestResponsePair = (
    performanceTimings: any[],
    requestResponsePairs: RequestResponsePair[],
    type: 'xmlhttprequest' | 'fetch'
) => {
    // Request response pairs are sorted by end time; sort performance timings the same way
    performanceTimings.sort((a, b) => a.responseEnd - b.responseEnd);

    const groupedPerformanceTimings: {[type: string]: {[url: string]: any[]}} = performanceTimings.reduce(
        (previous, performanceTiming) => {
            const url = normalizeUrl(performanceTiming.name);
            if (performanceTiming.initiatorType === type) {
                previous[type][url] = [
                    ...(previous[type][url] || []),
                    performanceTiming
                ];
            } else {
                previous.others[url] = [
                    ...(previous.others[url] || []),
                    performanceTiming
                ];
            }
            return previous;
        },
        { xmlhttprequest: {}, others: {}, fetch: {} }
    );

    let groupedRequestResponsePairs: { [url: string]: RequestResponsePair[] } = {};
    groupedRequestResponsePairs = requestResponsePairs.reduce(
        (previous, requestResponsePair) => {
            const url = normalizeUrl(requestResponsePair.request.url);
            previous[url] = [
                ...(previous[url] || []),
                requestResponsePair
            ];
            return previous;
        },
        groupedRequestResponsePairs,
    );

    for (let url in groupedPerformanceTimings[type]) {
        const performanceTimingsForUrl = groupedPerformanceTimings[type][url];
        const requestResponsePairsForUrl = groupedRequestResponsePairs[url];
        if (!requestResponsePairsForUrl) {
            continue;
        }
        /**
         * We offset the starting because performanceTimings starts recording
         * immediately and requestResponsePairs only start recording when Highlight
         * is loaded. Because of this requestResponsePairs will not always have the
         * first few requests made when a page loads.
         */
        const offset =
            Math.max(performanceTimingsForUrl.length -
            requestResponsePairsForUrl.length, 0);
        for (
            let i = offset;
            i < performanceTimingsForUrl.length;
            i++
        ) {
            if (performanceTimingsForUrl[i]) {
                performanceTimingsForUrl[
                    i
                ].requestResponsePair = requestResponsePairsForUrl[i - offset];
            }
        }
    }

    performanceTimings = [];
    for (let type in groupedPerformanceTimings) {
        for (let url in groupedPerformanceTimings[type]) {
            performanceTimings = performanceTimings.concat(groupedPerformanceTimings[type][url]);
        }
    }

    return performanceTimings
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
    // Long enough to avoid collisions, not long enough to be unguessable
    return makeId(10);
}

export const getHighlightRequestHeader = (sessionSecureID: string, requestId: string) => {
    return sessionSecureID + "/" + requestId
}
