<?php

declare(strict_types=1);

namespace Highlight\SDK;

use Highlight\SDK\Common\HighlightSessionId;
use Highlight\SDK\Common\Severity;
use Highlight\SDK\Common\Record\HighlightRecord;
use Highlight\SDK\Common\Record\HighlightLogRecord;
use Highlight\SDK\Common\Record\HighlightErrorRecord;
use Highlight\SDK\Common\Record\HighlightRecordBuilder;
use Highlight\SDK\Exception\HighlightInvalidRecordException;

class HighlightSession implements HighlightSessionId
{
    private string $sessionId;

    public function __construct(string $sessionId)
    {
        $this->sessionId = $sessionId;
    }

    /**
     * Returns the current sessionId.
     *
     * @return string the sessionId as a string
     */
    public function sessionId(): string
    {
        return $this->sessionId;
    }

    public function captureRecordFromBuilder(HighlightRecordBuilder $builder): void
    {
        $builder->userSession($this);

        Highlight::capture($builder->build());
    }

    public function captureRecord(HighlightRecord $record): void
    {
        if ($record instanceof HighlightLogRecord) {
            $this->captureRecordFromBuilder(HighlightRecord::logFromRecord($record));

        } elseif ($record instanceof HighlightErrorRecord) {
            $this->captureRecordFromBuilder(HighlightRecord::errorFromRecord($record));

        } else {
            throw new HighlightInvalidRecordException("Invalid record type", $record);
        }
    }

    public function captureException(\Throwable $error): void
    {
        $errorRecordBuilder = HighlightRecord::error();
        $errorRecordBuilder->throwable($error);
        $this->captureRecordFromBuilder($errorRecordBuilder);
    }

    public function captureLog(Severity $severity, string $message = null): void
    {
        $logRecordBuilder = HighlightRecord::log();
        $logRecordBuilder->severity($severity);
        if ($message !== null) {
            $logRecordBuilder->message($message);
        }
        $this->captureRecordFromBuilder($logRecordBuilder);
    }

    public function __toString(): string
    {
        return 'HighlightSession[' .
            'sessionId=' . $this->sessionId . ']';
    }
}
