<?php

declare(strict_types=1);

namespace Highlight\SDK\Common\Record;

use Highlight\SDK\Common\Severity;

/**
 * Represents a log record.
 *
 * A log record is a specific type of `HighlightRecord` that contains
 * information about a log message, including the severity of the message.
 */
final class HighlightLogRecord extends HighlightRecord
{
    private Severity $severity;
    private string $message;

    /**
     * Constructs a new `HighlightLogRecord` with the specified severity and
     * message based on `HighlightRecord`.
     *
     * @param HighlightRecord $record the record
     * @param Severity $severity the severity of the log record
     * @param string $message the message of the log record
     */
    public function __construct(HighlightRecord $record, Severity $severity, string $message)
    {
        parent::__construct($record->timeOccurred, $record->attributes, $record->userSession, $record->requestId);
        $this->severity = $severity;
        $this->message = $message;
    }

    /**
     * Returns the severity level associated with the log.
     *
     * @return Severity the severity level associated with the log
     */
    public function getSeverity(): Severity
    {
        return $this->severity;
    }

    /**
     * Returns the log message associated with the record.
     *
     * @return string the log message associated with the record
     */
    public function getMessage(): string
    {
        return $this->message;
    }
}