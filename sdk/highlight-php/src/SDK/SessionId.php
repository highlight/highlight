<?php

declare(strict_types=1);

namespace Highlight\SDK;

class SessionId
{

    private string $bytes;

    private function __construct($bytes)
    {
        $this->bytes = $bytes;
    }

    public static function get(): self
    {
        return new SessionId('' . self::createMachineIdentifier() . '' . self::createProcessIdentifier());
    }

    private static function createMachineIdentifier(): int
    {
        try {
            $machinePiece = crc32(php_uname('n'));
        } catch (\Exception $e) {
            $machinePiece = mt_rand();
        }
    
        $machinePiece &= 0xFFFFFF;
        return $machinePiece;
    }

    private static function createProcessIdentifier(): int
    {
        $processId = 0;
    
        $processName = php_uname('n');
        if (strpos($processName, '@') !== false) {
            $processId = (int) explode('@', $processName, 2)[0];
        } else {
            $processId = (int) crc32($processName);
        }
    
        return (int) $processId;
    }

    public function __toString(): string
    {
        return $this->bytes;
    }
}
