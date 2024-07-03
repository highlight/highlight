DROP VIEW IF EXISTS sessions_joined_vw;
CREATE VIEW IF NOT EXISTS sessions_joined_vw AS
select ProjectID as ProjectId,
       CreatedAt as Timestamp,
       mapFromArrays(
               arrayMap(x->splitByChar('_', x, 2) [2], FieldKeys),
               arrayMap(
                       (k, kv)->substring(kv, length(k) + 2),
                       arrayZip(FieldKeys, FieldKeyValues)
               )
       ) as SessionAttributes,
       arrayMap((kv) -> (
                     arrayStringConcat(arraySlice(splitByChar('_', kv), 2, length(splitByChar('_', kv)) - 2), '_'),
                     splitByChar('_', kv)[length(splitByChar('_', kv))]
       ), FieldKeyValues) as SessionAttributePairs,
       *
from sessions FINAL SETTINGS splitby_max_substrings_includes_remaining_string = 1;
