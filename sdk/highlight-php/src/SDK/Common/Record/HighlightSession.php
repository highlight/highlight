<?php

declare(strict_types=1);

namespace Highlight\SDK\Common\Record;

use Highlight\SDK\Common\HighlightSessionId;


class HighlightSession implements HighlightSessionId
{
    private string $sessionId;

    public function __constructor(string $sessionId)
    {
        $this->sessionId = $sessionId;
    }

    public function sessionId(): string 
    {
        return $this->sessionId ?? "";
    }
}
