CREATE TABLE IF NOT EXISTS logs_new AS logs ENGINE = ReplacingMergeTree PARTITION BY toDate(Timestamp)
ORDER BY (ProjectId, Timestamp, UUID) TTL Timestamp + toIntervalDay(30) SETTINGS ttl_only_drop_parts = 1,
    index_granularity = 8192,
    min_age_to_force_merge_seconds = 3600;
alter table logs_new attach partition '20240104'
from logs;
alter table logs_new attach partition '20240105'
from logs;
alter table logs_new attach partition '20240106'
from logs;
alter table logs_new attach partition '20240107'
from logs;
alter table logs_new attach partition '20240108'
from logs;
alter table logs_new attach partition '20240109'
from logs;
alter table logs_new attach partition '20240110'
from logs;
alter table logs_new attach partition '20240111'
from logs;
alter table logs_new attach partition '20240112'
from logs;
alter table logs_new attach partition '20240113'
from logs;
alter table logs_new attach partition '20240114'
from logs;
alter table logs_new attach partition '20240115'
from logs;
alter table logs_new attach partition '20240116'
from logs;
alter table logs_new attach partition '20240117'
from logs;
alter table logs_new attach partition '20240118'
from logs;
alter table logs_new attach partition '20240119'
from logs;
alter table logs_new attach partition '20240120'
from logs;
alter table logs_new attach partition '20240121'
from logs;
alter table logs_new attach partition '20240122'
from logs;
alter table logs_new attach partition '20240123'
from logs;
alter table logs_new attach partition '20240124'
from logs;
alter table logs_new attach partition '20240125'
from logs;
alter table logs_new attach partition '20240126'
from logs;
alter table logs_new attach partition '20240127'
from logs;
alter table logs_new attach partition '20240128'
from logs;
alter table logs_new attach partition '20240129'
from logs;
alter table logs_new attach partition '20240130'
from logs;
alter table logs_new attach partition '20240131'
from logs;
alter table logs_new attach partition '20240201'
from logs;
alter table logs_new attach partition '20240202'
from logs;
alter table logs_new attach partition '20240203'
from logs;
alter table logs_new attach partition '20240204'
from logs;
alter table logs_new attach partition '20240205'
from logs;
alter table logs_new attach partition '20240206'
from logs;
EXCHANGE TABLES logs
AND logs_new;