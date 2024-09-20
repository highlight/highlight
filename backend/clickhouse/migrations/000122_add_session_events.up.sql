CREATE TABLE session_replay_events
(
    SessionSecureID String,
    PayloadID       Int32,
    EventType       Int8,
    EventTimestamp  DateTime64(6),
    EventSid        Int32,
    EventData       String,
    Expires         DateTime
) ENGINE = MergeTree
      ORDER BY (SessionSecureID, PayloadID)
      TTL Expires;
