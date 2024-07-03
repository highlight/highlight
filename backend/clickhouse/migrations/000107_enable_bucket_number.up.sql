alter table traces
modify setting allow_experimental_block_number_column = true;
alter table logs
modify setting allow_experimental_block_number_column = true;