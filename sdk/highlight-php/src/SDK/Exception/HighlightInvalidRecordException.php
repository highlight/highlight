<?php

namespace Highlight\SDK\Exception;

class HighlightInvalidRecordException extends \InvalidArgumentException
{
    private $record;

    public function __construct($message, $record)
    {
        parent::__construct($message);
        $this->record = $record;
    }

    public function getRecord()
    {
        return $this->record;
    }
}

?>
