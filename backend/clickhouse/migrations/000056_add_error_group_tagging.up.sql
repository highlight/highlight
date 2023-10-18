alter table error_groups
    add column ErrorTagID Nullable(Int64);

alter table error_groups
    add column ErrorTagTitle Nullable(String);

alter table error_groups
    add column ErrorTagDescription Nullable(String);
