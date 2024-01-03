<?php

namespace Highlight\SDK\Common;

/**
 * This class defines the attribute keys used in the Highlight SDK.
 */
final class HighlightAttributes
{
    /**
     * The attribute key for the Highlight project ID.
     */
    public const HIGHLIGHT_PROJECT_ID = 'highlight.project_id';

    /**
     * The attribute key for the Highlight session ID.
     */
    public const HIGHLIGHT_SESSION_ID = 'highlight.session_id';

    /**
     * The attribute key for the Highlight trace ID.
     */
    public const HIGHLIGHT_TRACE_ID = 'highlight.trace_id';

    /**
     * The attribute key for the log severity.
     */
    public const LOG_SEVERITY = 'log.severity';

    /**
     * The attribute key for the PHP version.
     */
    public const TELEMETRY_PHP_VERSION = 'telemetry.php.version';

    /**
     * The attribute key for the PHP vendor.
     */
    public const TELEMETRY_PHP_VENDOR = 'telemetry.php.vendor';

    /**
     * The attribute key for the PHP vendor date.
     */
    public const TELEMETRY_PHP_VERSION_DATE = 'telemetry.php.date';

    /**
     * Non-accessible constructor because this class just provides static fields.
     */
    private function __construct()
    {
    }
}
