<?php

declare(strict_types=1);

namespace Highlight\SDK;

use Highlight\SDK\Common\HighlightAttributes;
use Highlight\SDK\HighlightRoute;
use Highlight\SDK\Highlight;
use Highlight\SDK\SessionId;
use Highlight\SDK\Common\HighlightVersion;

use OpenTelemetry\SDK\Trace\TracerProvider;
use OpenTelemetry\SDK\Trace\TracerProviderBuilder;
use OpenTelemetry\SDK\Trace\SpanProcessor\BatchSpanProcessor;
use OpenTelemetry\SDK\Trace\Sampler\AlwaysOnSampler;
use OpenTelemetry\SDK\Logs\Logger;
use OpenTelemetry\SDK\Logs\LoggerProvider;
use OpenTelemetry\SDK\Logs\Processor\BatchLogRecordProcessor;

use OpenTelemetry\Context\Propagation\TextMapPropagatorInterface;
use OpenTelemetry\Context\Propagation\NoopTextMapPropagator;

use OpenTelemetry\Contrib\Otlp\SpanExporter;
use OpenTelemetry\Contrib\Otlp\LogsExporter;
use OpenTelemetry\Contrib\Otlp\OtlpHttpTransportFactory;
use OpenTelemetry\SDK\Common\Time\ClockFactory;
use OpenTelemetry\SDK\Common\Util\ShutdownHandler;

use OpenTelemetry\SDK\Resource\ResourceInfo;
use OpenTelemetry\SDK\Common\Attribute\AttributesFactory;
use OpenTelemetry\SDK\Logs\LoggerProviderBuilder;
use OpenTelemetry\SemConv\ResourceAttributes;


/**
 * In the Java SDK, the HighlightOpenTelemetry class implements the io.opentelemetry.api.OpenTelemetry interface
 * but the closest PHP equivalent is perhaps OpenTelemetry\SDK\SdkBuilder.php.
 * 
 * This class is therefore loosely modeled on OpenTelemetry\SDK\SdkBuilder
 * @see https://github.com/open-telemetry/opentelemetry-php/blob/main/src/SDK/SdkBuilder.php 
 */
class HighlightOpenTelemetry
{
    private TracerProvider $tracerProvider;
    private LoggerProvider $loggerProvider;

    // Common params to the Tracer and Logger
    private static string $format = 'application/json';
    private static array $headers = [];
    private static string $compression = 'gzip';
    private static float $timeout = 30.;
    private static int $exportTimeoutMillis = 30000;
    private static int $scheduleDelayMillis = 1000;
    private static int $maxExportBatchSize = 128;
    private static int $maxQueueSize = 1024;

    public function __construct(Highlight $highlight)
    {
        $options = $highlight->getOptions();

        $attributes = [
            HighlightAttributes::HIGHLIGHT_PROJECT_ID => $options->getProjectId(),
            ResourceAttributes::DEPLOYMENT_ENVIRONMENT => $options->getEnvironment(),
            ResourceAttributes::SERVICE_INSTANCE_ID => SessionId::get()->__toString(),
            ResourceAttributes::SERVICE_VERSION => $options->getVersion(),
            ResourceAttributes::SERVICE_NAME => $options->getServiceName()    
        ];

        if ($options->isMetricEnabled()) {
            $attributes[ResourceAttributes::TELEMETRY_SDK_NAME] = HighlightVersion::getSdkName();
            $attributes[ResourceAttributes::TELEMETRY_SDK_VERSION] = HighlightVersion::getSdkVersion();
            $attributes[ResourceAttributes::TELEMETRY_SDK_LANGUAGE] = HighlightVersion::getSdkLanguage();
            
            $attributes[ResourceAttributes::TELEMETRY_DISTRO_NAME] = 'highlight-opentelemetry-php-sdk';
            $attributes[ResourceAttributes::TELEMETRY_DISTRO_VERSION] = phpversion('opentelemetry');

            $attributes[HighlightAttributes::TELEMETRY_PHP_VERSION] = HighlightVersion::getPhpVersion();
            $attributes[HighlightAttributes::TELEMETRY_PHP_VENDOR] = HighlightVersion::getPhpOsName();
            $attributes[HighlightAttributes::TELEMETRY_PHP_VERSION_DATE] = HighlightVersion::getPhpOsVersion();
            $attributes[ResourceAttributes::OS_NAME] = HighlightVersion::getPhpOsName();
            $attributes[ResourceAttributes::OS_VERSION] = HighlightVersion::getPhpOsVersion();
            $attributes[ResourceAttributes::OS_TYPE] = HighlightVersion::getPhpOsArch();
        }

        foreach ($options->getDefaultAttributes() as $key => $value) {
            $attributes[$key] = $value;
        }
        $attributesFactory = new AttributesFactory();
        $attributesBuilder = $attributesFactory->builder($attributes);
        $resource = ResourceInfo::create($attributesBuilder->build());

        // Tracer
        $transport = (new OtlpHttpTransportFactory())->create(
            HighlightRoute::buildTraceRoute($options->getBackendUrl()), 
            self::$format, 
            self::$headers, 
            self::$compression, 
            self::$timeout);
        $exporter = new SpanExporter($transport);
        $spanProcessor = new BatchSpanProcessor(
            $exporter, 
            ClockFactory::getDefault(), 
            self::$maxQueueSize,
            self::$scheduleDelayMillis,
            self::$exportTimeoutMillis,
            self::$maxExportBatchSize);

        $this->tracerProvider = (new TracerProviderBuilder())
            ->addSpanProcessor($spanProcessor)
            ->setResource($resource)->setSampler(new AlwaysOnSampler())->build();


        // Log
        $transport = (new OtlpHttpTransportFactory())->create(
            HighlightRoute::buildLogRoute($options->getBackendUrl()), 
            self::$format, 
            self::$headers, 
            self::$compression, 
            self::$timeout);
        $exporter = new LogsExporter($transport);
        $logProcessor = new BatchLogRecordProcessor(
            $exporter,
            ClockFactory::getDefault(),
            self::$maxQueueSize,
            self::$scheduleDelayMillis,
            self::$exportTimeoutMillis,
            self::$maxExportBatchSize);

        $this->loggerProvider = (new LoggerProviderBuilder())
            ->addLogRecordProcessor($logProcessor)
            ->setResource($resource)->build();

        ShutdownHandler::register([$this->tracerProvider, 'shutdown']);
        ShutdownHandler::register([$this->loggerProvider, 'shutdown']);
    }

    public function getLogger(string $instrumentationScopeName): Logger
    {
        return $this->loggerProvider->getLogger($instrumentationScopeName);
    }

    public function getTracerProvider(): TracerProvider
    {
        return $this->tracerProvider;
    }

    public function getLoggerProvider(): LoggerProvider
    {
        return $this->loggerProvider;
    }
    
    public function getPropagators(): TextMapPropagatorInterface
    {
        return NoopTextMapPropagator::getInstance();
    }

    public function shutdown(): bool
    {
        return ($this->tracerProvider->shutdown() && $this->loggerProvider->shutdown());
    }
}
