alter table logs
    add column ResourceAttributes Map(LowCardinality(String), String) CODEC (ZSTD(1));

alter table logs add index idx_res_attr_key mapKeys(ResourceAttributes) TYPE bloom_filter GRANULARITY 1;

alter table logs add index idx_res_attr_value mapValues(ResourceAttributes) TYPE bloom_filter GRANULARITY 1;
