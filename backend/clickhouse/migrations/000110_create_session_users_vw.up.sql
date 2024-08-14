DROP VIEW IF EXISTS session_users_vw;
CREATE VIEW IF NOT EXISTS session_users_vw AS
SELECT
  ID as SessionID,
  CreatedAt as Timestamp,
  SecureID as SessionSecureID,
  Identifier,
  ProjectID,
  City,
  State,
  Country,
  OSName,
  OSVersion,
  BrowserName,
  BrowserVersion,
  IP,
  Processed,
  HasRageClicks,
  HasErrors,
  HasComments,
  Length,
  ActiveLength,
  Environment,
  AppVersion,
  FirstTime,
  WithinBillingQuota,
  PagesVisited,
  mapFromArrays(
    arrayMap(x->splitByChar('_', x, 2) [2], FieldKeys),
    arrayMap(
      (k, kv)->substring(kv, length(k) + 2),
      arrayZip(FieldKeys, FieldKeyValues)
    )
  ) as SessionAttributes
FROM sessions
WHERE Identified = true
  AND Excluded = false;