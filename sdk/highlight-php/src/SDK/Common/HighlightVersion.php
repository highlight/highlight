<?php

declare(strict_types=1);

namespace Highlight\SDK\Common;

/**
 * The HighlightVersion class provides static methods to retrieve information
 * about the current version of the Highlight SDK, the PHP environment, and the
 * operating system on which the SDK is running.
 */
class HighlightVersion
{
    // SDK version information
    private const SDK_NAME = "highlight-php-sdk";
    private const SDK_VERSION = "1.0";
    private const SDK_LANGUAGE = "php";

    // PHP version information
    private static $phpVersion;
    private static $phpOsName;
    private static $phpOsVersion;
    private static $phpOsArch;

    /**
     * Returns the name of the Highlight SDK.
     *
     * @return string the name of the SDK
     */
    public static function getSdkName(): string
    {
        return self::SDK_NAME;
    }

    /**
     * Returns the version of the Highlight SDK.
     *
     * @return string the version of the SDK
     */
    public static function getSdkVersion(): string
    {
        return self::SDK_VERSION;
    }

    /**
     * Returns the programming language used to implement the Highlight SDK.
     *
     * @return string the programming language of the SDK
     */
    public static function getSdkLanguage(): string
    {
        return self::SDK_LANGUAGE;
    }

    /**
     * Returns the version of PHP running the Highlight SDK.
     *
     * @return string the version of PHP
     */
    public static function getPhpVersion(): string
    {
        if (self::$phpVersion === null) {
            self::$phpVersion = phpversion();
        }
        return self::$phpVersion;
    }

    /**
     * Returns the name of the operating system on which PHP is running.
     *
     * @return string the operating system name
     */
    public static function getPhpOsName(): string
    {
        if (self::$phpOsName === null) {
            self::$phpOsName = php_uname("s");
        }
        return self::$phpOsName;
    }

    /**
     * Returns the version of the operating system on which PHP is running.
     *
     * @return string the operating system version
     */
    public static function getPhpOsVersion(): string
    {
        if (self::$phpOsVersion === null) {
            self::$phpOsVersion = php_uname("r");
        }
        return self::$phpOsVersion;
    }

    /**
     * Returns the architecture of the operating system on which PHP is running.
     *
     * @return string the operating system architecture
     */
    public static function getPhpOsArch(): string
    {
        if (self::$phpOsArch === null) {
            self::$phpOsArch = php_uname("m");
        }
        return self::$phpOsArch;
    }
}
