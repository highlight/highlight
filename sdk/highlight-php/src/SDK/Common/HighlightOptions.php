<?php

declare(strict_types=1);

namespace Highlight\SDK\Common;

use OpenTelemetry\SDK\Common\Attribute\Attributes;

/**
 * Represents the options for highlighting in a project, including project ID,
 * backend URL, environment, version, and default attributes.
 */
final class HighlightOptions
{
    private string $projectId;
    private string $backendUrl;
    private string $environment;
    private string $version;
    private string $serviceName;
    private bool $metric;
    private Attributes $defaultAttributes;

    /**
     * Creates a new instance of HighlightOptions.
     *
     * @param string $projectId       the project ID to use
     * @param string $backendUrl      the backend URL to set
     * @param string $environment     the environment to set
     * @param string $version         the version to set
     * @param string $serviceName     the service name to set
     * @param bool   $metric          whether to enable metric or not
     * @param Attributes $defaultAttributes the default attributes to set
     */
    public function __construct(
        string $projectId,
        string $backendUrl,
        string $environment,
        string $version,
        string $serviceName,
        bool $metric,
        Attributes $defaultAttributes
    ) {
        $this->projectId = $projectId;
        $this->backendUrl = $backendUrl;
        $this->environment = $environment;
        $this->version = $version;
        $this->serviceName = $serviceName;
        $this->metric = $metric;
        $this->defaultAttributes = $defaultAttributes;
    }

    /**
     * Returns a new builder for constructing HighlightOptions with the specified project ID.
     *
     * @param string $projectId the project ID to use
     * @return HighlightOptionsBuilder a new builder for constructing HighlightOptions
     */
    public static function builder(string $projectId): HighlightOptionsBuilder
    {
        return new HighlightOptionsBuilder($projectId);
    }

    /**
     * Gets the project ID.
     *
     * @return string the project ID
     */
    public function getProjectId(): string
    {
        return $this->projectId;
    }

    /**
     * Gets the backend URL.
     *
     * @return string the backend URL
     */
    public function getBackendUrl(): string
    {
        return $this->backendUrl;
    }

    /**
     * Gets the environment.
     *
     * @return string the environment
     */
    public function getEnvironment(): string
    {
        return $this->environment;
    }

    /**
     * Gets the version.
     *
     * @return string the version
     */
    public function getVersion(): string
    {
        return $this->version;
    }

    /**
     * Gets the service name.
     *
     * @return string the service name
     */
    public function getServiceName(): string
    {
        return $this->serviceName;
    }

    /**
     * Checks whether metric is enabled.
     *
     * @return bool true if metric is enabled, false otherwise
     */
    public function isMetricEnabled(): bool
    {
        return $this->metric;
    }

    /**
     * Gets the default attributes.
     *
     * @return Attributes the default attributes
     */
    public function getDefaultAttributes(): Attributes
    {
        return $this->defaultAttributes;
    }

    /**
     * Produce a string representation of the class.
     * 
     * @return string representing the properties of this object.
     */
    public function __toString()
    {
        return "HighlightOptions[" .
                "projectId=" . $this->projectId . ", " .
                "backendUrl=" . $this->backendUrl . ", " .
                "enviroment=" . $this->environment . ", " .
                "version=" . $this->version . ", " .
                "serviceName=" . $this->serviceName . ", " .
                "metric=" . $this->metric . ", " .
                "defaultAttributes=" . implode(" ", $this->defaultAttributes->toArray()) . ']';

    }
}
