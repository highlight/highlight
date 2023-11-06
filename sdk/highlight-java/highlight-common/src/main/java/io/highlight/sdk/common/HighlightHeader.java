package io.highlight.sdk.common;

public final class HighlightHeader {

    public static final String X_HIGHLIGHT_REQUEST = "x-highlight-request";
    private final String sessionId;
    private final String requestId;

    public HighlightHeader(String sessionId, String requestId) {
        this.sessionId = sessionId;
        this.requestId = requestId;
    }

    public static HighlightHeader parse(String header) {
        String[] split = header.split("/");
        if (split.length == 2) {
            return new HighlightHeader(split[0], split[1]);
        }
        return null;
    }

    public String sessionId() {
        return sessionId;
    }

    public String requestId() {
        return requestId;
    }

    @java.lang.Override
    public boolean equals(java.lang.Object obj) {
        if (obj == this) return true;
        if (obj == null || obj.getClass() != this.getClass()) return false;
        var that = (HighlightHeader) obj;
        return java.util.Objects.equals(this.sessionId, that.sessionId) &&
                java.util.Objects.equals(this.requestId, that.requestId);
    }

    @java.lang.Override
    public int hashCode() {
        return java.util.Objects.hash(sessionId, requestId);
    }

    @java.lang.Override
    public String toString() {
        return "HighlightHeader[" +
                "sessionId=" + sessionId + ", " +
                "requestId=" + requestId + ']';
    }

}