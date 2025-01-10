CREATE TABLE session_replay_events
(
    SessionSecureID String,
    EventSid        Int64,
    EventType       Int8,
    EventTimestamp  DateTime64(3),
    EventData       String,
    Expires         DateTime
) ENGINE = ReplacingMergeTree
      ORDER BY (SessionSecureID, EventSid)
      TTL Expires;
