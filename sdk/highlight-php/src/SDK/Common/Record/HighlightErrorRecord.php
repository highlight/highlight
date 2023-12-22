<?php

declare(strict_types=1);

namespace Highlight\SDK\Common\Record;

/**
 * Represents an error record.
 *
 * An error record is a specific type of `HighlightRecord` that contains
 * information about a thrown exception.
 */
final class HighlightErrorRecord extends HighlightRecord
{
    private \Throwable $throwable;

    /**
     * Constructs a new `HighlightErrorRecord` with the specified throwable
     * based on `HighlightRecord`.
     *
     * @param HighlightRecord $record the record
     * @param \Throwable $throwable the throwable of the error record
     */
    public function __construct(HighlightRecord $record, \Throwable $throwable)
    {
        parent::__construct($record->timeOccurred, $record->attributes, $record->userSession, $record->requestId);
        $this->throwable = $throwable;
    }

    /**
     * Returns the throwable associated with the record.
     *
     * @return \Throwable the throwable associated with the record
     */
    public function getThrowable(): \Throwable
    {
        return $this->throwable;
    }
}
