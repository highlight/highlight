<?php

namespace Highlight\SDK\Exception;

class HighlightIllegalStateException extends \RuntimeException
{
    public function __construct($message)
    {
        parent::__construct($message);
    }
}

?>
