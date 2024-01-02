<?php

declare(strict_types=1);

namespace Highlight\SDK\Common\Record;

use DateTimeImmutable;
use Highlight\SDK\Common\HighlightSessionId;
use OpenTelemetry\SDK\Common\Attribute\Attributes;

/**
 * Represents a record.
 *
 * A `HighlightRecord` class contains information about a timestamp,
 * including attributes for its declarations, and a trace id. It can also
 * contain a session id.
 */
class HighlightRecord
{
    protected DateTimeImmutable $timeOccurred;
    protected Attributes $attributes;
    protected ?HighlightSessionId $userSession;
    protected ?string $requestId;

    /**
     * Constructs a new `HighlightRecord` instance.
     *
     * @param DateTimeImmutable $timeOccurred the instant when the record occurred
     * @param Attributes $attributes the attributes associated with the record
     * @param HighlightSessionId|null $userSession the user session associated with the record, may be null
     * @param string|null $requestId the ID of the request associated with the record, may be null
     */
    public function __construct(DateTimeImmutable $timeOccurred, Attributes $attributes, ?HighlightSessionId $userSession, ?string $requestId)
    {
        $this->timeOccurred = $timeOccurred;
        $this->attributes = $attributes;
        $this->userSession = $userSession;
        $this->requestId = $requestId;
    }

    /**
     * Returns the instant when the record occurred.
     *
     * @return DateTimeImmutable the instant when the record occurred
     */
    public function getTimeOccurred(): DateTimeImmutable
    {
        return $this->timeOccurred;
    }

    /**
     * Returns the attributes associated with the record.
     *
     * @return Attribute the attributes associated with the record
     */
    public function getAttributes(): Attributes
    {
        return $this->attributes;
    }

    /**
     * Returns the user session associated with the record.
     *
     * @return HighlightSessionId|null the user session associated with the record, may be null
     */
    public function getUserSession(): ?HighlightSessionId
    {
        return $this->userSession;
    }

    /**
     * Returns whether the record has a user session associated with it.
     *
     * @return bool true if the record has a user session, otherwise false
     */
    public function hasUserSession(): bool
    {
        return $this->userSession !== null && $this->userSession->sessionId() !== null;
    }

    /**
     * Returns the ID of the request associated with the record.
     *
     * @return string|null the ID of the request associated with the record, may be null
     */
    public function getRequestId(): ?string
    {
        return $this->requestId;
    }

    /**
     * Returns whether the record has an ID of the request associated with it.
     *
     * @return bool true if the record has an ID of the request, otherwise false
     */
    public function hasRequestId(): bool
    {
        return $this->requestId !== null;
    }



    // Static methods

    /**
     * Returns a builder for creating a new error record.
     *
     * @return HighlightErrorRecordBuilder A builder for creating a new error record.
     */
    public static function error(): HighlightErrorRecordBuilder
    {
        return new HighlightErrorRecordBuilder();
    }

    /**
     * Returns a builder for creating a new error record based on an existing record.
     *
     * @param HighlightErrorRecord $record The existing record to base the new record on.
     * @return HighlightErrorRecordBuilder A builder for creating a new error record based on an existing record.
     */
    public static function errorFromRecord(HighlightErrorRecord $record): HighlightErrorRecordBuilder
    {
        return (new HighlightErrorRecordBuilder())->fromRecord($record);
    }

    /**
     * Returns a builder for creating a new log record.
     *
     * @return HighlightLogRecordBuilder A builder for creating a new log record.
     */
    public static function log(): HighlightLogRecordBuilder
    {
        return new HighlightLogRecordBuilder();
    }

    /**
     * Returns a builder for creating a new log record based on an existing record.
     *
     * @param HighlightLogRecord $record The existing record to base the new record on.
     * @return HighlightLogRecordBuilder A builder for creating a new log record based on an existing record.
     */
    public static function logFromRecord(HighlightLogRecord $record): HighlightLogRecordBuilder
    {
        return (new HighlightLogRecordBuilder())->fromRecord($record);
    }
}
