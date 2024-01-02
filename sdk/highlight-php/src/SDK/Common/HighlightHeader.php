<?php

declare(strict_types=1);

namespace Highlight\SDK\Common;

class HighlightHeader
{
    public const X_HIGHLIGHT_REQUEST = 'x-highlight-request';
    private string $sessionId;
    private string $requestId;

    public function __construct($sessionId, $requestId)
    {
        $this->sessionId = $sessionId;
        $this->requestId = $requestId;
    }

    public static function parse($header): HighlightHeader
    {
        $split = explode('/', $header);
        if (count($split) == 2) {
            return new HighlightHeader($split[0], $split[1]);
        }
        return null;
    }

    public function sessionId(): string
    {
        return $this->sessionId;
    }

    public function requestId(): string
    {
        return $this->requestId;
    }

    public function __toString()
    {
        return 'HighlightHeader[' .
            'sessionId=' . $this->sessionId . ', ' .
            'requestId=' . $this->requestId . ']';
    }
}

