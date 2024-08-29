DROP VIEW IF EXISTS session_events_vw;
CREATE VIEW IF NOT EXISTS session_events_vw AS
SELECT
    session_events.UUID,
    session_events.ProjectID as ProjectId,
    session_events.SessionID as SessionId,
    session_events.SessionCreatedAt,
    session_events.Timestamp,
    session_events.Event,
    session_events.Attributes,
    sessions.SecureID as SecureSessionId,
    sessions.BrowserName,
    sessions.BrowserVersion,
    sessions.City,
    sessions.Country,
    sessions.Environment,
    sessions.Excluded,
    sessions.FirstTime as FirstSession,
    sessions.Identified,
    sessions.Identifier,
    sessions.OSName,
    sessions.OSVersion,
    sessions.IP,
    sessions.Processed,
    sessions.ActiveLength as SessionActiveLength,
    sessions.Length as SessionLength,
    sessions.PagesVisited as SessionPagesVisited,
    sessions.AppVersion as ServiceVersion,
    sessions.State
FROM session_events
INNER JOIN sessions FINAL
    ON sessions.ProjectID = session_events.ProjectID
    AND sessions.CreatedAt = session_events.SessionCreatedAt
    AND sessions.ID = session_events.SessionID
