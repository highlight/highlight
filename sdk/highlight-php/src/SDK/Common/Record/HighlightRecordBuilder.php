<?php

declare(strict_types=1);

namespace Highlight\SDK\Common\Record;

use DateTimeImmutable;
use Highlight\SDK\Common\HighlightSessionId;
use Highlight\SDK\Common\HighlightHeader;
use OpenTelemetry\SDK\Common\Attribute\Attributes;
use OpenTelemetry\SDK\Common\Attribute\AttributesBuilder;
use OpenTelemetry\SDK\Common\Attribute\AttributesFactory;

/**
 * A builder class for creating instances of `HighlightRecord`.
 */
abstract class HighlightRecordBuilder
{
    protected DateTimeImmutable $timeOccurred;
    protected AttributesBuilder $attributesBuilder;
    protected ?HighlightSessionId $userSession;
    protected ?string $requestId;

    /**
     * Constructs a new instance of `Builder`.
     */
    protected function __construct(?HighlightRecord $record = null)
    {
        if (isset($record)) {
            $this->timeOccurred = $record->getTimeOccurred();
            $this->attributesBuilder = (new AttributesFactory())->builder($record->getAttributes()->toArray());
            $this->userSession = $record->getUserSession();
            $this->requestId = $record->getRequestId();
        } else {
            $this->timeOccurred = new DateTimeImmutable();
            $this->attributesBuilder = Attributes::factory()->builder([]);
            $this->userSession = null;
            $this->requestId = null;
        }
    }

    /**
     * Sets the time the record occurred.
     *
     * @param DateTimeImmutable $timeOccurred the time the record occurred
     * @return this `Builder` instance
     */
    public function timeOccurred(DateTimeImmutable $timeOccurred): self
    {
        $this->timeOccurred = $timeOccurred;
        return $this;
    }

    /**
     * Sets the user session and request id associated with the record.
     *
     * @param HighlightHeader $header associated with the record.
     * @return this `Builder` instance
     */
    public function requestHeader(HighlightHeader $header): self
    {
        $this->userSessionString($header->sessionId());
        $this->requestId($header->requestId());
        return $this;
    }

    /**
     * Sets the user session associated with the record using a session ID string.
     *
     * @param string|null $sessionId the session ID string to use as the user session ID
     * @return this `Builder` instance
     */
    public function userSessionString(?string $sessionId): self
    {
        $this->userSession($sessionId !== null && !empty($sessionId) ? new HighlightSession($sessionId) : null);
        return $this;
    }

    /**
     * Sets the user session associated with the record.
     *
     * @param HighlightSessionId|null $userSession the user session associated with the record
     * @return this `Builder` instance
     */
    public function userSession(?HighlightSessionId $userSession): self
    {
        $this->userSession = $userSession;
        return $this;
    }

    /**
     * Sets the request ID associated with the record.
     *
     * @param string|null $requestId the request ID associated with the record
     * @return this `Builder` instance
     */
    public function requestId(?string $requestId): self
    {
        $this->requestId = $requestId !== null && !empty($requestId) ? $requestId : null;
        return $this;
    }

    /**
     * Applies the specified closure to the attributes builder.
     *
     * @param callable $function the closure to apply to the attributes builder
     * @return this `Builder` instance
     */
    public function attributes(callable $function): self
    {
        $function($this->attributesBuilder);
        return $this;
    }

    /**
     * Builds a new instance of `HighlightRecord` using the values specified
     * in the builder.
     *
     * @return HighlightRecord a new instance of `HighlightRecord`
     */
    public function build(): HighlightRecord
    {
        return new HighlightRecord(
            $this->timeOccurred ?? new DateTimeImmutable(),
            $this->attributesBuilder->build(), 
            $this->userSession ?? null,
            $this->requestId ?? ""
        );
    }
}
