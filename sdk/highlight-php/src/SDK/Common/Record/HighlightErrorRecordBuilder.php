<?php

declare(strict_types=1);

namespace Highlight\SDK\Common\Record;

use InvalidArgumentException;

/**
 * Builder class for `HighlightErrorRecord`.
 */
class HighlightErrorRecordBuilder extends HighlightRecordBuilder
{
    private \Throwable $throwable;

    /**
     * Constructs a new instance of `Builder`.
     */
    public function __construct()
    {
        parent::__construct();
    }

    /**
     * Constructs a new instance of `Builder` based on an existing
     * `HighlightErrorRecord`.
     *
     * @param HighlightErrorRecord $record the existing `HighlightErrorRecord` to use as the basis
     *                                      for the new builder
     */
    public function fromRecord(HighlightErrorRecord $record): self
    {
        parent::__construct($record);
        $this->throwable = $record->getThrowable();
        return $this;
    }

    /**
     * Sets the throwable that caused the error.
     *
     * @param \Throwable $throwable the throwable that caused the error.
     * @return static this builder instance.
     */
    public function throwable(\Throwable $throwable): self
    {
        $this->throwable = $throwable;
        return $this;
    }

    /**
     * Builds a new `HighlightErrorRecord` instance.
     *
     * @return HighlightErrorRecord the new instance.
     */
    public function build(): HighlightErrorRecord
    {
        if (!isset($this->throwable)) {
            throw new InvalidArgumentException("Throwable cannot be null");
        }
        return new HighlightErrorRecord(parent::build(), $this->throwable);
    }
}

