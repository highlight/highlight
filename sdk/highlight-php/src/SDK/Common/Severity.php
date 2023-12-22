<?php

declare(strict_types=1);

namespace Highlight\SDK\Common;

/**
 * Represents the severity of a log message, along with its text and priority.
 * 
 * See: <a href=
 * "https://opentelemetry.io/docs/reference/specification/logs/data-model/#severity-fields">severity-fields</a>
 */
class Severity
{
    private string $text;
    private int $id;
    private Priority $priority;

    // ID values for the different severity levels.
    private const TRACE_ID = 1;
    private const DEBUG_ID = 5;
    private const INFO_ID = 9;
    private const WARN_ID = 13;
    private const ERROR_ID = 17;
    private const FATAL_ID = 21;

    // Predefined instances of Severity for each severity level.
    public static Severity $TRACE;
    public static Severity $DEBUG;
    public static Severity $INFO;
    public static Severity $WARN;
    public static Severity $ERROR;
    public static Severity $FATAL;

    public function __construct(string $text, int $id, Priority $priority)
    {
        $this->text = $text;
        $this->id = $id;
        $this->priority = $priority;
    }

    public static function trace(string $text = null, Priority $priority = null): Severity
    {
        if ($text === null) {
            $priority = $priority ?? Priority::LOW;
        }
        return new Severity($text, self::TRACE_ID, $priority);
    }

    public static function debug(string $text = null, Priority $priority = null): Severity
    {
        if ($text === null) {
            $priority = $priority ?? Priority::LOW;
        }
        return new Severity($text, self::DEBUG_ID, $priority);
    }

    public static function info(string $text = null, Priority $priority = null): Severity
    {
        if ($text === null) {
            $priority = $priority ?? Priority::LOW;
        }
        return new Severity($text, self::INFO_ID, $priority);
    }

    public static function warn(string $text = null, Priority $priority = null): Severity
    {
        if ($text === null) {
            $priority = $priority ?? Priority::LOW;
        }
        return new Severity($text, self::WARN_ID, $priority);
    }

    public static function error(string $text = null, Priority $priority = null): Severity
    {
        if ($text === null) {
            $priority = $priority ?? Priority::LOW;
        }
        return new Severity($text, self::ERROR_ID, $priority);
    }

    public static function fatal(string $text = null, Priority $priority = null): Severity
    {
        if ($text === null) {
            $priority = $priority ?? Priority::LOW;
        }
        return new Severity($text, self::FATAL_ID, $priority);
    }

    public function id(): int
    {
        return $this->id + $this->priority->difference();
    }

    public function text(): string
    {
        return $this->text;
    }

    public function name(): string
    {
        switch ($this->id) {
            case self::TRACE_ID:
                return "TRACE";
            case self::DEBUG_ID:
                return "DEBUG";
            case self::INFO_ID:
                return "INFO";
            case self::WARN_ID:
                return "WARN";
            case self::ERROR_ID:
                return "ERROR";
            case self::FATAL_ID:
                return "FATAL";
            default:
                throw new \InvalidArgumentException("Unexpected value: " . $this->id);
        }
    }

    public function shortName(): string
    {
        $name = $this->name();
        return $name . ($this->priority === Priority::LOW ? "" : $this->priority->difference());
    }
}
