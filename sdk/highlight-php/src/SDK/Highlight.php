<?php

declare(strict_types=1);

namespace Highlight\SDK;

use Highlight\SDK\Common\HighlightOptions;
use Highlight\SDK\Common\Severity;
use Highlight\SDK\Common\Record\HighlightRecord;
use Highlight\SDK\Common\Record\HighlightLogRecord;
use Highlight\SDK\Common\Record\HighlightErrorRecord;

use Highlight\SDK\Common\Record\HighlightRecordBuilder;
use Highlight\SDK\Exception\HighlightIllegalStateException;
use Highlight\SDK\Exception\HighlightInvalidRecordException;
use Highlight\SDK\HighlightOpenTelemetry;
use Highlight\SDK\HighlightTracer;
use Highlight\SDK\Common\HighlightHeader;

/**
 * The Highlight class is the main entry point for Highlight.
 * It provides methods to initialize the library and capture logs and errors.
 */
class Highlight
{
    private static ?Highlight $highlight = null;
    private HighlightOptions $options;
    private HighlightOpenTelemetry $openTelemetry;
    private HighlightTracer $tracer;
    private HighlightLogger $logger;

    private function __construct(HighlightOptions $options)
    {
        echo "Highlight is initializing..." . PHP_EOL;
        $this->options = $options;
        
        $this->openTelemetry = new HighlightOpenTelemetry($this);
        $this->tracer = new HighlightTracer($this);
        $this->logger = new HighlightLogger($this);

        echo "Highlight was initialized." . PHP_EOL;
    }

    public function captureRecord(HighlightRecord $record): void
    {
        if (!self::isInitialized()) {
            throw new HighlightIllegalStateException("Highlight state is not running");
        }

        if ($record instanceof HighlightLogRecord) {
            $this->logger->process($record);
        } elseif ($record instanceof HighlightErrorRecord) {
            $this->tracer->process($record);
        } else {
            throw new HighlightInvalidRecordException("Invalid record type", $record);
        }
    }

    /**
     * Check if highlight was initialized else throw a
     * {@code HighlightIllegalStateException} exception
     *
     * @throws HighlightIllegalStateException if Highlight is not initialized
     */
    private static function requireInitialization(): void
    {
        if (!self::isInitialized()) {
            throw new HighlightIllegalStateException("Highlight instance is not initialized");
        }
    }

    /**
     * Initializes Highlight with the provided options and the given projectId.
     *
     * @param string              $projectId the projectId to use
     * @param callable            $options   the options to use for initialization
     *
     * @throws HighlightIllegalStateException if Highlight is already initialized
     */
    public static function init(string $projectId, ?callable $options = null): void
    {
        $builder = HighlightOptions::builder($projectId);
        if ($options !== null) {
            $options($builder);
        }

        self::initWithOptions($builder->build());
    }

    /**
     * Initializes Highlight with the provided options.
     *
     * @param HighlightOptions $options the options to use for initialization
     *
     * @throws HighlightIllegalStateException if Highlight is already initialized
     */
    public static function initWithOptions(HighlightOptions $options): void
    {
        if (self::$highlight !== null) {
            throw new HighlightIllegalStateException("Highlight is already initialized");
        }

        self::$highlight = new Highlight($options);
    }

    /**
     * Returns true if Highlight is already initialized.
     *
     * @return bool true if Highlight is already initialized, false otherwise
     */
    public static function isInitialized(): bool
    {
        return self::$highlight !== null;
    }

    /**
     * Captures an exception and sends it to Highlight.
     *
     * @param \Throwable $throwable the throwable to capture
     *
     * @throws HighlightIllegalStateException  if Highlight is not initialized
     * @throws HighlightInvalidRecordException if the record is invalid
     */
    public static function captureException(\Throwable $throwable): void
    {
        self::captureExceptionWithSessionAndRequest($throwable);
    }

    /**
     * Captures an exception and sends it to Highlight.
     *
     * @param \Throwable $throwable the throwable to capture
     * @param string     $sessionId the session ID associated with the record
     * @param string     $requestId the request ID associated with the record
     *
     * @throws HighlightIllegalStateException  if Highlight is not initialized
     * @throws HighlightInvalidRecordException if the record is invalid
     */
    public static function captureExceptionWithSessionAndRequest(
        \Throwable $throwable,
        ?string $sessionId = null,
        ?string $requestId = null
    ): void {
        self::requireInitialization();

        self::captureRecord(
            HighlightRecord::error()
                ->throwable($throwable)
                ->requestId($requestId)
                ->userSession($sessionId)
                ->build()
        );
    }

    /**
     * Captures an exception and sends it to Highlight.
     *
     * @param \Throwable $throwable the throwable to capture
     * @param string     $sessionId the session ID associated with the record
     * @param string     $requestId the request ID associated with the record
     *
     * @throws HighlightIllegalStateException  if Highlight is not initialized
     * @throws HighlightInvalidRecordException if the record is invalid
     */
    public static function captureExceptionWithHighlightHeader(
        \Throwable $throwable,
        HighlightHeader $header
    ): void {
        self::requireInitialization();

        self::captureRecord(
            HighlightRecord::error()
                ->throwable($throwable)
                ->requestHeader($header)
                ->build()
        );
    }

    /**
     * Captures a log and sends it to Highlight.
     *
     * @param Severity $severity the severity of the log
     * @param string   $message  the message to log
     *
     * @throws HighlightIllegalStateException  if Highlight is not initialized
     * @throws HighlightInvalidRecordException if the record is invalid
     */
    public static function captureLog(Severity $severity, string $message): void
    {
        self::captureLogWithSessionAndRequest($severity, $message);
    }

    /**
     * Captures a log and sends it to Highlight.
     *
     * @param Severity $severity  the severity of the log
     * @param string   $message   the message to log
     * @param string   $sessionId the session ID associated with the record
     * @param string   $requestId the request ID associated with the record
     *
     * @throws HighlightIllegalStateException  if Highlight is not initialized
     * @throws HighlightInvalidRecordException if the record is invalid
     */
    public static function captureLogWithSessionAndRequest(
        Severity $severity,
        string $message,
        ?string $sessionId = null,
        ?string $requestId = null
    ): void {
        self::requireInitialization();

        self::captureRecord(
            HighlightRecord::log()
                ->severity($severity)
                ->message($message)
                ->requestId($requestId)
                ->userSession($sessionId)
                ->build()
        );
    }

    /**
     * Captures a record using a record builder and sends it to Highlight.
     *
     * @param HighlightRecord\Builder $builder the builder to use for the record
     *
     * @throws HighlightIllegalStateException  if Highlight is not initialized
     * @throws HighlightInvalidRecordException if the record is invalid
     */
    public static function captureRecordFromBuilder(HighlightRecordBuilder $builder): void
    {
        self::requireInitialization();

        self::captureRecord($builder->build());
    }

    /**
     * Captures a record and sends it to Highlight.
     *
     * @param HighlightRecord $record the record to capture
     *
     * @throws HighlightIllegalStateException  if Highlight is not initialized
     * @throws HighlightInvalidRecordException if the record is invalid
     */
    public static function capture(HighlightRecord $record): void
    {
        self::requireInitialization();

        self::$highlight->captureRecord($record);
    }

    /**
     * Returns the options.
     *
     * @return HighlightOptions the options
     */
    public function getOptions(): HighlightOptions
    {
        return $this->options;
    }

    /**
     * Returns the {@code HighlightOpenTelemetry}
     *
     * @return \Highlight\SDK\HighlightOpenTelemetry the {@code HighlightOpenTelemetry} instance
     */
    public function getOpenTelemetry(): HighlightOpenTelemetry
    {
        return $this->openTelemetry;
    }

    /**
     * Returns the {@code HighlightTracer}
     *
     * @return \Highlight\SDK\HighlightTracer the {@code HighlightTracer} instance
     */
    public function getTracer(): HighlightTracer
    {
        return $this->tracer;
    }

    /**
     * Returns the {@code HighlightLogger} instance.
     *
     * @return HighlightLogger the {@code HighlightLogger} instance
     */
    public function getLogger(): HighlightLogger
    {
        return $this->logger;
    }
}

