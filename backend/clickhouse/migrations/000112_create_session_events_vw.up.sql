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
    sessions.Identified,
    sessions.Identifier,
    sessions.FirstTime,
    sessions.City,
    sessions.State,
    sessions.Country,
    sessions.OSName,
    sessions.OSVersion,
    sessions.BrowserName,
    sessions.BrowserVersion,
    sessions.IP,
    sessions.Processed,
    sessions.HasComments,
    sessions.HasRageClicks,
    sessions.HasErrors,
    sessions.Length,
    sessions.ActiveLength,
    sessions.Environment,
    sessions.AppVersion,
    sessions.PagesVisited,
    sessions.Excluded
FROM session_events
INNER JOIN sessions
    ON sessions.ProjectID = session_events.ProjectID
    AND sessions.CreatedAt = session_events.SessionCreatedAt
    AND sessions.ID = session_events.SessionID
