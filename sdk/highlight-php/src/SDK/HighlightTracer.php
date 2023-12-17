<?php

declare(strict_types=1);

namespace Highlight\SDK;

use Highlight\SDK\Common\HighlightAttributes;
use Highlight\SDK\Common\Record\HighlightErrorRecord;
use OpenTelemetry\API\Trace\TracerInterface;
use OpenTelemetry\Context\Context;

class HighlightTracer
{

    private TracerInterface $tracer;

    public function __construct(Highlight $highlight)
    {
        $highlightOpenTelemetry = $highlight->getOpenTelemetry();
		$this->tracer = $highlightOpenTelemetry->getTracerProvider()->getTracer('highlight-php'); 
    }

    public function process(HighlightErrorRecord $record)
    {
        $spanBuilder = $this->tracer->spanBuilder('highlight-ctx');

        $spanBuilder->setAttributes($record->getAttributes()->toArray())
            ->setStartTimestamp($record->getTimeOccurred()->getTimestamp())
            ->setParent(null);

        $span = $spanBuilder->startSpan();

        try {
            Context::storage()->attach($span->storeInContext(Context::getCurrent()));

            if ($record->hasUserSession()) {
                $span->setAttribute(HighlightAttributes::HIGHLIGHT_SESSION_ID, $record->getUserSession()->sessionId());
            }

            if ($record->hasRequestId()) {
                $span->setAttribute(HighlightAttributes::HIGHLIGHT_TRACE_ID, $record->getRequestId());
            }

            $span->recordException($record->getThrowable());

            // You can add additional logic here to handle exceptions, set status codes, and more.

        } finally {
            $span->end();
        }
    }
}
