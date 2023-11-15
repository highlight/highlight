<?php

declare(strict_types=1);

namespace Highlight\SDK\Common;

/**
 * The HighlightSessionId defines a method to retrieve a sessionId which
 * represents the current session.
 */
interface HighlightSessionId
{
    /**
     * Returns the current sessionId.
     *
     * @return string the sessionId as a string
     */
    public function sessionId(): string;
}
