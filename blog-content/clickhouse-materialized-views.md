---
title: 'Using Materialized Views in ClickHouse (vs. Postgres)'
createdAt: 2024-01-23T00:00:00.000Z
readingTime: 9
authorFirstName: Vadim
authorLastName: Korolik
authorTitle: CTO @ Highlight 
authorTwitter: ''
authorWebsite: ''
authorLinkedIn: 'https://www.linkedin.com/in/vkorolik/'
authorGithub: 'https://github.com/Vadman97'
authorPFP: 'https://www.highlight.io/_next/image?url=https%3A%2F%2Flh3.googleusercontent.com%2Fa-%2FAOh14Gh1k7XsVMGxHMLJZ7qesyddqn1y4EKjfbodEYiY%3Ds96-c&w=3840&q=75'
tags: Launch Week 4
---

```hint
Highlight.io is an open source observability solution. We record sessions, traces, errors and logs to help engineers debug and maintain their web applications. 

You could be one of those engineers; check us out on [GitHub](https://github.com/highlight/highlight).
```

## Introduction: The Use Case

Our team recently adopted ClickHouse to store and query high-volume observability data. The implementation was straightforward for the intended aggregate querying, but solving other access patterns was more complex. For example, we needed to aggregate traces over a large time range to get average duration values, but at the same time find and load a single trace by ID. In ClickHouse, a table only has one primary index that could optimally query data. Thankfully, there's just the tool for the job...

## At a High-level: ClickHouse vs Postgres

PostgreSQL (Postgres) is a versatile SQL database, known for its reliability and used for various applications. It's an Online Transaction Processing (OLTP) database, providing real-time, exact results. ClickHouse, on the other hand, specializes in Online Analytical Processing (OLAP), making it better for fast, complex data analysis. In short, ClickHouse performs better at collecting aggregate results from a large dataset, while PostgreSQL exceeds at finding single records based on a known query pattern.

## What is a Materialized View?

Both databases provide Materialized Views as a way to transform data into a different structure that can be queried in a performant way. Think of it as a Pivot in Excel or other table-viewing tools. Rather than having to process the data into a different format every time a query is made, a Materialized View remembers the transformation and applies it periodically so that the query can be made quickly against the processed form. There are notable differences between PostgreSQL and ClickHouse Materialized Views (MVs), but the use case for MVs in both is similar.

Read more for a deep dive into an actual use case for setting up a series of ClickHouse Materialized Views.

## Deep-dive: Ingesting Traces from an Example LLM App

At Highlight, we recently launched a new tracing product that records code execution from your application to help debug issues or troubleshoot performance problems. The query engine in our app allows reporting and searching across structured attributes sent with traces.  Each trace has a given duration in seconds but can also carry arbitrary numeric properties. Let’s say our trace measures the performance of AI inference for a large language model, and we report the input size in tokens as the `tokens:123` numeric property.

```python
from transformers import AutoModelForCausalLM, AutoTokenizer
from highlight_io import H

# Set up OpenTelemetry export with Highlight
H = H(
    "<YOUR_HIGHLIGHT_PROJECT_ID>",
    service_name="llm-inference", service_version="14",
    instrument_logging=True
)

def generate_text(input_str: str):
  # Wrap the code in a span to record inference execution duration
  with H.trace() as span:
        # Load the tokenizer and model
      model = AutoModelForCausalLM.from_pretrained(
          "TinyLlama/TinyLlama-1.1B-Chat-v1.0", 
					torch_dtype="auto", trust_remote_code=True
      )
      tokenizer = AutoTokenizer.from_pretrained(
          "TinyLlama/TinyLlama-1.1B-Chat-v1.0", 
					trust_remote_code=True
      )

      # Tokenize the input text
      inputs = tokenizer(input_str, return_tensors="pt")

      # Generate text using the model
      output = model.generate(**inputs, max_length=500)

      # Decode and print the generated text
      generated_text = tokenizer.decode(output[0], skip_special_tokens=True)
      span.set_attributes({
				"input": input_text, "output": generated_text, "num_tokens": len(inputs)
			})
      return generated_text

# Example usage
input_text = "The future of AI is"
print(generate_text(input_text))
```

The sample code below runs inference using a popular HuggingFace model. The critical code path is wrapped with a contextmanager that starts and stops a span to time the duration of execution while reporting useful attributes that can help us debug the root cause of potential problems. Here, we’re reporting the `input` text, the `output` text, and the `num_tokens` sent to the model during inference.

## Building a ClickHouse query for Trace Search

Now that we’ve started recording traces, we need a way to find interesting ones. In Highlight, we store each of these trace spans as a row in a ClickHouse table and provide the ability to visualize that data via time-series aggregations to identify trends or learn useful correlations.

For example, lets say we wanted to search for cases where the inference was slow to see if the size of our input (and the number of input tokens) had an effect on the inference duration. To write a ClickHouse query for that, we first would need to understand the traces schema (or how they are stored in the database). The table DDL looks something like this (see it [here](https://github.com/highlight/highlight/blob/77d7ad357d921d9826e52ca2cfcf87ea7e684303/backend/clickhouse/migrations/000013_create_traces_table.up.sql) in our repo).

```sql
CREATE TABLE traces
(
    Timestamp           DateTime64(9),
    UUID                UUID,
    TraceId             String,
    SpanId              String,
    /* ... ommitted for brevity ... */
    ServiceName         LowCardinality(String),
    ServiceVersion      String,
    TraceAttributes     Map(LowCardinality(String), String)
)
ENGINE = ReplicatedMergeTree('/clickhouse/tables/{uuid}/{shard}', '{replica}')
PARTITION BY toDate(Timestamp)
ORDER BY (ProjectId, Timestamp, UUID); 
```

While the attributes that are present on all traces are stored as top-level columns, traces can have arbitrary custom attributes that can differ. The column `TraceAttributes` is a map that can store all of these values without having to worry about their types. In our ingest that writes data to the table, we format all `TraceAttributes` as strings where the key stores the name of the attribute. This allows us to mix different potential trace attributes within the same table regardless of their data type (where more complex values can be stored as their JSON string representation).

However, this presents a challenge when searching. The Highlight UI auto-completes attribute keys that can be used for searching, but having to scan over the entire table to gather the distinct keys is slow. We also can’t quickly determine which keys have at least one numeric value since we’d need to look at all values in the table to determine that.

This is where materialized views come to the rescue. Let’s create the materialized view for this table that will recall which trace attributes are numeric for quick key recommendation in our UI:

```sql
CREATE MATERIALIZED VIEW trace_keys_mv
		TO trace_keys (
			   ProjectId Int32,
			   Key LowCardinality(String),
			   Day DateTime,
			   Count UInt64,
			   Type String
		)
AS
SELECT ProjectId,
		arrayJoin(TraceAttributes).1 AS Key,
		toStartOfDay(Timestamp)      AS Day,
		countDistinct(UUID)          AS Count,
		if(isNull(toFloat64OrNull(
				arrayJoin(TraceAttributes).2
		)), 'String', 'Numeric')     AS Type
FROM traces
GROUP BY ProjectId,
     arrayJoin(TraceAttributes).1,
     Day,
     isNull(toFloat64OrNull(arrayJoin(TraceAttributes).2));
```

We define a new table `trace_keys_mv` which is based on the contents of `traces` . The new MV has 5 columns populated based on the `SELECT` query written in the second half of the statement above. In ClickHouse, the materialized view definition looks like a normal `SELECT` query, but it runs asynchronously when data is inserted into the source `traces` table. The `SELECT` statement defines the filters, aggregation, and other logic that transforms the data from the source table before it is written into the destination table. The result is a table with data that is processed into our desired form. Since data is written as it is inserted into the source table, it can be queried instantly from the materialized view:

![traces list](/images/blog/clickhouse-materialized-views/traces.png)

The only downside is that each materialized view created consumes additional CPU, memory, and disk on the ClickHouse cluster, since inserted data must be processed and written into the new form.

## A Materialized View for Fast Row Lookup

In PostgreSQL, searching for a single row can be optimized with an index. If you have more than one query pattern, you can create multiple indexes on combinations of columns used. In ClickHouse on the other hand, you only have one primary key for the table that has significant query performance. Thankfully, we can use materialized views to create other versions of the table with a different partitioning scheme, allowing us to efficiently query in other ways. For example, the following materialized view creates a copy of our `traces` table `ORDER BY (ProjectId, TraceId)` rather than `ORDER BY (ProjectId, Timestamp, UUID)`.

```sql
CREATE TABLE IF NOT EXISTS traces_by_id (
    `Timestamp` DateTime64(9),
    `UUID` UUID,
    `TraceId` String,
    `SpanId` String
    -- ... --
) ENGINE = MergeTree
ORDER BY (ProjectId, TraceId) TTL toDateTime(Timestamp) + toIntervalDay(30);
CREATE MATERIALIZED VIEW IF NOT EXISTS traces_by_id_mv TO traces_by_id (
    `Timestamp` DateTime64(9),
    `UUID` UUID,
    `TraceId` String,
    `SpanId` String,

    -- ... --
) AS
SELECT *
FROM traces;
```

While the `traces` table provides efficient lookup of traces for a given time range (sorted by time), the `traces_by_id` table offers fast lookup of a trace for a given `TraceId`. We rely on this in the highlight traces UI to build a flame graph, where we query for all spans for a given trace:

![highlight trace lookup](/images/blog/clickhouse-materialized-views/highlight.png)

These two examples scratch the surface of how we use ClickHouse materialized views at Highlight. If you’d like to learn more or look at the code more closely, check out our [table definitions](https://github.com/highlight/highlight/tree/77d7ad357d921d9826e52ca2cfcf87ea7e684303/backend/clickhouse/migrations) and [source code](https://github.com/highlight/highlight/blob/77d7ad357d921d9826e52ca2cfcf87ea7e684303/backend/clickhouse/traces.go#L120) in our Apache 2.0 licensed GitHub repository. Thanks!

![grafana trace metrics](/images/blog/clickhouse-materialized-views/grafana.png)
