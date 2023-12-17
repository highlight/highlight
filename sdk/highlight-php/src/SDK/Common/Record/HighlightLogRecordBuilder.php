<?php

declare(strict_types=1);

namespace Highlight\SDK\Common\Record;

use Highlight\SDK\Common\Severity;
use InvalidArgumentException;


/**
 * Builder class for `HighlightLogRecord`.
 */
class HighlightLogRecordBuilder extends HighlightRecordBuilder
{
    private Severity $severity;
    private ?string $message;

    /**
     * Constructs a new instance of `Builder`.
     */
    public function __construct()
    {
        parent::__construct();
    }

    /**
     * Constructs a new instance of `Builder` based on an existing
     * `HighlightLogRecord`.
     *
     * @param HighlightLogRecord $record the existing `HighlightLogRecord` to use as the basis for
     *                                   the new builder
     */
    public function fromRecord(HighlightLogRecord $record): self
    {
        parent::__construct($record);
        $this->severity = $record->getSeverity();
        $this->message = $record->getMessage();
        return $this;
    }

    /**
     * Sets the severity of the log record.
     *
     * @param Severity $severity the severity of the log record.
     * @return static this builder instance.
     */
    public function severity(Severity $severity): self
    {
        $this->severity = $severity;
        return $this;
    }

    /**
     * Sets the message of the log record.
     *
     * @param string $message the message of the log record.
     * @return static this builder instance.
     */
    public function message(string $message): self
    {
        $this->message = $message;
        return $this;
    }

    /**
     * Builds a new `HighlightLogRecord` instance.
     *
     * @return HighlightLogRecord the new instance.
     */
    public function build(): HighlightLogRecord
    {
        if (!isset($this->severity)) {
            throw new InvalidArgumentException("Severity cannot be null");
        }
        $this->message = $this->message ?? $this->severity->text();

        return new HighlightLogRecord(parent::build(), $this->severity, $this->message);
    }
}
