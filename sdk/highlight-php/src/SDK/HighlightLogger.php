<?php

namespace Highlight\SDK;

use Highlight\SDK\Highlight;
use Highlight\SDK\Common\Record\HighlightLogRecord;
use Highlight\SDK\Common\HighlightAttributes;
use OpenTelemetry\API\Logs\LogRecord;
use OpenTelemetry\SDK\Logs\Logger;

class HighlightLogger {

    private Logger $logger;

    public function __construct(Highlight $highlight) {
        $openTelemetry = $highlight->getOpenTelemetry();
		$this->logger = $openTelemetry->getLogger("highlight-php");
    }

    public function process(HighlightLogRecord $record) {
        $severity = $record->getSeverity();
        $logRecord = new LogRecord($record->getMessage());

        $logRecord->setTimestamp($record->getTimeOccurred()->getTimestamp())
        ->setSeverityNumber($severity->id())
        ->setSeverityText($severity->text())
        ->setAttributes($record->getAttributes()->toArray());

        if ($record->hasUserSession()) {
            $logRecord->setAttribute(HighlightAttributes::HIGHLIGHT_SESSION_ID, $record->getUserSession()->sessionId());
        }

        if ($record->hasRequestId()) {
            $logRecord->setAttribute(HighlightAttributes::HIGHLIGHT_TRACE_ID, $record->getRequestId());
        }

        $this->logger->emit($logRecord);
    }
}
