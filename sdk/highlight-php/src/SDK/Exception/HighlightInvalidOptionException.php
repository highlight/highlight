<?php

namespace Highlight\SDK\Exception;

class HighlightInvalidOptionException extends \InvalidArgumentException
{
    public function __construct($message)
    {
        parent::__construct($message);
    }
}

?>
