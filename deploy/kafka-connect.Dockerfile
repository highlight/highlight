FROM confluentinc/cp-kafka-connect:latest

RUN curl "https://highlight-client-bundle.s3.us-east-2.amazonaws.com/assets/clickhouse-kafka-connect-v1.1.0-confluent.jar" --output /home/appuser/clickhouse-kafka-connect-v1.1.0.jar

RUN echo  \
  connector.class=com.clickhouse.kafka.connect.ClickHouseSinkConnector \
  topic2TableMap=prod_v6_traces=traces \
  tasks.max=10 \
  topics=prod_v6_traces \
  clickhouseSettings=date_time_input_format=best_effort \
  ssl=true \
  security.protocol=SSL \
  hostname=nhhbsqapco.us-east-2.aws.clickhouse.cloud \
  database=default \
  password=TODO \
  ssl.truststore.location=/tmp/kafka.client.truststore.jks \
  port=8443 \
  value.converter.schemas.enable=false \
  value.converter=org.apache.kafka.connect.json.JsonConverter \
  exactlyOnce=true \
  username=default \
  schemas.enable=false \
  \
  key.converter=org.apache.kafka.connect.storage.StringConverter \
  value.converter=org.apache.kafka.connect.storage.StringConverter \
  consumer.max.poll.records=1000000 \
  consumer.max.partition.fetch.bytes=419430400 \
  consumer.fetch.max.wait.ms=60000 \
  consumer.fetch.min.bytes=20971520 \
  consumer.request.timeout.ms=180000 \
  consumer.session.timeout.ms=60000 \
 > /home/appuser/properties.json

ARG BOOTSTRAP_SERVERS=TODO
ARG SECURITY_PROTOCOL=SASL_SSL
ARG SASL_MECHANISM=SCRAM-SHA-512
ARG SASL_JAAS_CONFIG='sasl.jaas.config=org.apache.kafka.common.security.scram.ScramLoginModule required username="prod" password="TODO"';

ENV CONNECT_BOOTSTRAP_SERVERS=${BOOTSTRAP_SERVERS}
ENV CONNECT_SECURITY_PROTOCOL=${SECURITY_PROTOCOL}
ENV CONNECT_CONSUMER_SECURITY_PROTOCOL=${SECURITY_PROTOCOL}
ENV CONNECT_PRODUCER_SECURITY_PROTOCOL=${SECURITY_PROTOCOL}
ENV CONNECT_SASL_MECHANISM=${SASL_MECHANISM}
ENV CONNECT_CONSUMER_SASL_MECHANISM=${SASL_MECHANISM}
ENV CONNECT_PRODUCER_SASL_MECHANISM=${SASL_MECHANISM}
ENV CONNECT_SASL_JAAS_CONFIG=${SASL_JAAS_CONFIG}
ENV CONNECT_CONSUMER_SASL_JAAS_CONFIG=${SASL_JAAS_CONFIG}
ENV CONNECT_PRODUCER_SASL_JAAS_CONFIG=${SASL_JAAS_CONFIG}
ENV CONNECT_CONSUMER_OVERRIDE_MAX_POLL_RECORDS=1000000
ENV CONNECT_CONSUMER_MAX_POLL_RECORDS=1000000
ENV CONNECT_GROUP_ID=traces-connector
ENV CONNECT_CONFIG_STORAGE_TOPIC=traces-connector-configs
ENV CONNECT_CONFIG_STORAGE_REPLICATION_FACTOR=3
ENV CONNECT_OFFSET_FLUSH_INTERVAL_MS=10000
ENV CONNECT_OFFSET_STORAGE_TOPIC=traces-connector-offsets
ENV CONNECT_OFFSET_STORAGE_REPLICATION_FACTOR=3
ENV CONNECT_STATUS_STORAGE_TOPIC=traces-connector-status
ENV CONNECT_STATUS_STORAGE_REPLICATION_FACTOR=3
ENV CONNECT_KEY_CONVERTER=org.apache.kafka.connect.storage.StringConverter
ENV CONNECT_VALUE_CONVERTER=org.apache.kafka.connect.json.JsonConverter
ENV CLASSPATH=/usr/share/java/monitoring-interceptors/monitoring-interceptors-7.3.0.jar
ENV CONNECT_PLUGIN_PATH="/usr/share/java,/usr/share/confluent-hub-components,/home/appuser"
ENV CONNECT_LOG4J_LOGGERS=org.apache.zookeeper=ERROR,org.I0Itec.zkclient=ERROR,org.reflections=ERROR,com.clickhouse=ERROR
