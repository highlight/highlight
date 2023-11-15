<?php

declare(strict_types=1);

namespace Highlight\SDK\Common;

use OpenTelemetry\SDK\Common\Attribute\Attributes;
use OpenTelemetry\SDK\Common\Attribute\AttributesBuilder;

/**
 * A builder class for constructing HighlightOptions.
 */
class HighlightOptionsBuilder
{
    private string $projectId;
    private ?string $backendUrl = null;
    private ?string $environment = null;
    private ?string $version = null;
    private ?string $serviceName = null;
    private bool $metric = true;
    private AttributesBuilder $defaultAttributes;

    private const DEFAULT_URL = "https://otel.highlight.io:4318";
    private const DEFAULT_ENVIRONMENT = "development";
    private const DEFAULT_VERSION = "unknown";
    private const DEFAULT_SERVICE_NAME = "unknown";

    /**
     * Creates a new builder for constructing HighlightOptions with the specified project ID.
     *
     * @param string $projectId the project ID to use
     */
    public function __construct(string $projectId)
    {
        $this->projectId = $projectId;
        $this->defaultAttributes = Attributes::factory()->builder([]);
    }

    /**
     * Sets the backend URL for the highlight options being constructed.
     *
     * @param string $backendUrl the backend URL to set
     * @return $this this builder
     */
    public function backendUrl(string $backendUrl): HighlightOptionsBuilder
    {
        $this->backendUrl = $backendUrl;
        return $this;
    }

    /**
     * Sets the environment for the highlight options being constructed.
     *
     * @param string $environment the environment to set
     * @return $this this builder
     */
    public function environment(string $environment): HighlightOptionsBuilder
    {
        $this->environment = $environment;
        return $this;
    }

    /**
     * Sets the version for the highlight options being constructed.
     *
     * @param string $version the version to set
     * @return $this this builder
     */
    public function version(string $version): HighlightOptionsBuilder
    {
        $this->version = $version;
        return $this;
    }

    /**
     * Sets the service name for the highlight options being constructed.
     *
     * @param string $serviceName the service name to set
     * @return $this this builder
     */
    public function serviceName(string $serviceName): HighlightOptionsBuilder
    {
        $this->serviceName = $serviceName;
        return $this;
    }

    /**
     * Sets whether metric is enabled or not for the highlight options being constructed.
     *
     * @param bool $enabled whether to enable metric or not
     * @return $this this builder
     */
    public function metric(bool $enabled): HighlightOptionsBuilder
    {
        $this->metric = $enabled;
        return $this;
    }

    /**
     * Sets the default attributes for the highlight options being constructed using
     * the specified consumer function.
     *
     * @param callable $attributes a consumer function that accepts an
     *                            AttributesBuilder
     * @return $this this builder
     */
    public function attributes(callable $attributes): HighlightOptionsBuilder
    {
        $attributes($this->defaultAttributes);
        return $this;
    }

    /**
     * Builds the HighlightOptions using the specified project ID, backend URL, environment,
     * version, metric, and default attributes.
     *
     * @return HighlightOptions the constructed HighlightOptions
     */
    public function build(): HighlightOptions
    {
        return new HighlightOptions(
            $this->projectId,
            $this->backendUrl ?? self::DEFAULT_URL,
            $this->environment ?? self::DEFAULT_ENVIRONMENT,
            $this->version ?? self::DEFAULT_VERSION, 
            $this->serviceName ?? self::DEFAULT_SERVICE_NAME,
            $this->metric,
            $this->defaultAttributes->build()
        );
    }
}
