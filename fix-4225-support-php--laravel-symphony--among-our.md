```php
<?php

# Brain solution for: Support PHP (Laravel+Symphony) among our SDKs
# Approach: Implement a PHP SDK leveraging OpenTelemetry for exception recording and log/trace instrumentation, with specific support for Laravel and Symphony frameworks.

namespace Highlight\SDK;

use OpenTelemetry\API\Common\Attributes;
use OpenTelemetry\API\Logs\Logger;
use OpenTelemetry\API\Logs\LoggerProvider;
use OpenTelemetry\API\Logs\LogRecord;
use OpenTelemetry\API\Logs\Severity;
use OpenTelemetry\API\Trace\Span;
use OpenTelemetry\API\Trace\SpanContextInterface;
use OpenTelemetry\API\Trace\SpanKind;
use OpenTelemetry\API\Trace\StatusCode;
use OpenTelemetry\API\Trace\TracerProvider;
use OpenTelemetry\Context\Context;
use OpenTelemetry\SDK\Common\Attribute\Attributes as SDKAttributes;
use OpenTelemetry\SDK\Common\Export\ExportResult;
use OpenTelemetry\SDK\Common\Time\ClockInterface;
use OpenTelemetry\SDK\Logs\LogRecordProcessorInterface;
use OpenTelemetry\SDK\Logs\ReadableLogRecord;
use OpenTelemetry\SDK\Logs\SpanId;
use OpenTelemetry\SDK\Logs\TraceId;
use OpenTelemetry\SDK\Resource\ResourceInfo;
use OpenTelemetry\SDK\Trace\SpanProcessorInterface;
use OpenTelemetry\SDK\Trace\Tracer;
use Throwable;

/**
 * Highlight PHP SDK.
 */
class Highlight
{
    private static ?Tracer $tracer = null;
    private static ?Logger $logger = null;
    private static ?TracerProvider $tracerProvider = null;
    private static ?LoggerProvider $loggerProvider = null;
    private static ?string $serviceName = null;
    private static ?string $serviceVersion = null;
    private static bool $initialized = false;

    /**
     * Initializes the Highlight SDK.
     *
     * @param array<string, mixed> $config Configuration options.
     *   - 'service_name': The name of the service.
     *   - 'service_version': The version of the service.
     *   - 'endpoint': The OTLP endpoint to send data to.
     *   - 'api_key': Your Highlight API key.
     *   - 'console_logs': Whether to automatically collect console logs (default: true).
     */
    public static function init(array $config = []): void
    {
        if (self::$initialized) {
            return;
        }

        self::$serviceName = $config['service_name'] ?? 'php-service';
        self::$serviceVersion = $config['service_version'] ?? 'unknown';

        // Initialize OpenTelemetry TracerProvider
        self::$tracerProvider = new \OpenTelemetry\SDK\Trace\TracerProvider(
            null, // No specific SpanProcessor set here, will be configured by framework integrations
            null, // No SpanExporter set here, will be configured by framework integrations
            ResourceInfo::create([
                SDKAttributes::SERVICE_NAME => self::$serviceName,
                SDKAttributes::SERVICE_VERSION => self::$serviceVersion,
            ])
        );
        self::$tracer = self::$tracerProvider->getTracer('highlight-php-sdk');

        // Initialize OpenTelemetry LoggerProvider
        self::$loggerProvider = new \OpenTelemetry\SDK\Logs\LoggerProvider(
            null, // No specific LogRecordProcessor set here
            null, // No LogRecordExporter set here
            ResourceInfo::create([
                SDKAttributes::SERVICE_NAME => self::$serviceName,
                SDKAttributes::SERVICE_VERSION => self::$serviceVersion,
            ])
        );
        self::$logger = self::$loggerProvider->getLogger('highlight-php-sdk');

        // Automatic console log collection for CLI environments
        if (($config['console_logs'] ?? true) && php_sapi_name() === 'cli') {
            self::instrumentCliLogs();
        }

        // Framework-specific instrumentation will be handled by separate integrations
        // For example, Laravel integration would set up its own SpanProcessors and LogRecordProcessors

        self::$initialized = true;
    }

    /**
     * Records an exception.
     *
     * @param Throwable $exception The exception to record.
     * @param array<string, mixed> $attributes Additional attributes to associate with the exception.
     * @return void
     */
    public static function recordException(Throwable $exception, array $attributes = []): void
    {
        if (!self::$initialized || !self::$tracer) {
            // SDK not initialized, or tracer not available. Log a warning or handle appropriately.
            error_log("Highlight SDK not initialized. Cannot record exception.");
            return;
        }

        $currentSpan = Span::getCurrent();
        $spanContext = $currentSpan->getContext();

        $exceptionAttributes = [
            Attributes::EXCEPTION_TYPE => get_class($exception),
            Attributes::EXCEPTION_MESSAGE => $exception->getMessage(),
            Attributes::EXCEPTION_STACKTRACE => $exception->getTraceAsString(),
            Attributes::EXCEPTION_ESCAPED => false, // Assuming exceptions are not escaped
        ];

        // Add any framework-specific attributes if available from the current span
        if ($spanContext instanceof SpanContextInterface) {
            $exceptionAttributes[Attributes::TRACE_ID] = $spanContext->getTraceId();
            $exceptionAttributes[Attributes::SPAN_ID] = $spanContext->getSpanId();
        }

        // Merge with user-provided attributes
        $exceptionAttributes = array_merge($exceptionAttributes, $attributes);

        // Create a new span for the exception if no active span, or record as an event on the current span
        if ($spanContext instanceof SpanContextInterface && $currentSpan->isRecording()) {
            $currentSpan->recordException($exception, $exceptionAttributes);
            $currentSpan->setStatus(StatusCode::ERROR, $exception->getMessage());
        } else {
            // If no active span, create a new one to capture the exception context
            $span = self::$tracer->spanBuilder('exception.record')
                ->setSpanKind(SpanKind::INTERNAL)
                ->setAttributes(SDKAttributes::new($exceptionAttributes))
                ->start();

            $span->recordException($exception, $exceptionAttributes);
            $span->setStatus(StatusCode::ERROR, $exception->getMessage());
            $span->end();
        }

        // Optionally, also record as a log if logger is available
        if (self::$logger) {
            $logAttributes = $exceptionAttributes;
            // Remove trace/span IDs from attributes if they are already part of the log record
            unset($logAttributes[Attributes::TRACE_ID], $logAttributes[Attributes::SPAN_ID]);

            $logRecord = new LogRecord(
                new \DateTimeImmutable(),
                self::$serviceName,
                Severity::ERROR,
                $exception->getMessage(),
                $spanContext instanceof SpanContextInterface ? $spanContext->getTraceId() : TraceId::generate(),
                $spanContext instanceof SpanContextInterface ? $spanContext->getSpanId() : SpanId::generate(),
                0, // Flags
                $logAttributes
            );
            self::$logger->emit($logRecord);
        }
    }

    /**
     * Instruments standard PHP error handling to capture errors as exceptions.
     * This is a basic implementation and might need refinement for specific frameworks.
     */
    private static function instrumentCliLogs(): void
    {
        // Capture errors and convert them to exceptions
        set_error_handler(function ($severity, $message, $file, $line) {
            // Only capture errors that are not suppressed by the error control operator
            if (!(error_reporting() & $severity)) {
                return false;
            }

            $exception = new \ErrorException($message, 0, $severity, $file, $line);
            self::recordException($exception, [
                'severity' => $severity,
                'file' => $file,
                'line' => $line,
            ]);
            // Do not execute the PHP error handler for this error
            return true;
        });

        // Capture uncaught exceptions
        set_exception_handler(function (Throwable $exception) {
            self::recordException($exception);
            // Re-throw the exception to allow default error handling to occur
            throw $exception;
        });
    }

    /**
     * Sets a custom SpanProcessor for the TracerProvider.
     * This is typically used by framework integrations.
     *
     * @param SpanProcessorInterface $spanProcessor
     */
    public static function setSpanProcessor(SpanProcessorInterface $spanProcessor): void
    {
        if (!self::$tracerProvider) {
            throw new \RuntimeException("Highlight SDK must be initialized before setting SpanProcessor.");
        }
        // This is a simplification. In a real SDK, you'd likely want to manage
        // multiple processors or replace existing ones carefully.
        // For this example, we assume a single processor is set.
        self::$tracerProvider = new \OpenTelemetry\SDK\Trace\TracerProvider(
            $spanProcessor,
            null, // Exporter will be configured separately or by the processor
            self::$tracerProvider->getResource()
        );
        self::$tracer = self::$tracerProvider->getTracer('highlight-php-sdk');
    }

    /**
     * Sets a custom LogRecordProcessor for the LoggerProvider.
     * This is typically used by framework integrations.
     *
     * @param LogRecordProcessorInterface $logRecordProcessor
     */
    public static function setLogRecordProcessor(LogRecordProcessorInterface $logRecordProcessor): void
    {
        if (!self::$loggerProvider) {
            throw new \RuntimeException("Highlight SDK must be initialized before setting LogRecordProcessor.");
        }
        // Similar to setSpanProcessor, this is a simplification.
        self::$loggerProvider = new \OpenTelemetry\SDK\Logs\LoggerProvider(
            $logRecordProcessor,
            null, // Exporter will be configured separately or by the processor
            self::$loggerProvider->getResource()
        );
        self::$logger = self::$loggerProvider->getLogger('highlight-php-sdk');
    }

    /**
     * Gets the current Tracer instance.
     *
     * @return Tracer
     */
    public static function getTracer(): Tracer
    {
        if (!self::$tracer) {
            throw new \RuntimeException("Highlight SDK not initialized.");
        }
        return self::$tracer;
    }

    /**
     * Gets the current Logger instance.
     *
     * @return Logger
     */
    public static function getLogger(): Logger
    {
        if (!self::$logger) {
            throw new \RuntimeException("Highlight SDK not initialized.");
        }
        return self::$logger;
    }

    /**
     * Shuts down the SDK, flushing any pending data.
     */
    public static function shutdown(): void
    {
        if (self::$tracerProvider) {
            self::$tracerProvider->shutdown();
        }
        if (self::$loggerProvider) {
            self::$loggerProvider->shutdown();
        }
        self::$initialized = false;
    }
}
```