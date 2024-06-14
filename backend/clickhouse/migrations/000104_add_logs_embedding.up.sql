ALTER TABLE logs
ADD COLUMN IF NOT EXISTS Embedding Array(Float32);
ALTER TABLE logs
ADD COLUMN IF NOT EXISTS EmbeddingModel LowCardinality(String);
ALTER TABLE logs
ADD COLUMN IF NOT EXISTS LogGroupId Int64;
ALTER TABLE logs_sampling
ADD COLUMN IF NOT EXISTS Embedding Array(Float32);
ALTER TABLE logs_sampling
ADD COLUMN IF NOT EXISTS EmbeddingModel LowCardinality(String);
ALTER TABLE logs_sampling
ADD COLUMN IF NOT EXISTS LogGroupId Int64;