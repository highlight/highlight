<?php

declare(strict_types=1);

namespace Highlight\Tests\Unit\SDK\Common;

use Highlight\SDK\Common\HighlightOptions;
use Highlight\SDK\Common\HighlightOptionsBuilder as Builder;
use OpenTelemetry\SDK\Common\Attribute\Attributes;
use PHPUnit\Framework\TestCase;

class HighlightOptionsTest extends TestCase
{
    private static string $projectId = 'test-project-01';
    private static string $defaultEnv = 'development';
    private static string $defaultVersion = 'unknown';
    private static string $defaultServiceName = 'unknown';

    public function test_HighlightOptions_Constructor() 
    {
        $serviceName = 'test-service-01'; 
        $options = new HighlightOptions(self::$projectId, '', '', '', $serviceName, false, Attributes::create([]));

        $this->assertSame(self::$projectId, $options->getProjectId());
        $this->assertSame('', $options->getBackendUrl());
        $this->assertSame('', $options->getEnvironment());
        $this->assertSame('', $options->getVersion());
        $this->assertSame($serviceName, $options->getServiceName()); 
        $this->assertSame(false, $options->isMetricEnabled());
        $this->assertEmpty($options->getDefaultAttributes());
        $this->assertStringContainsString(self::$projectId, $options->__toString());
        $this->assertStringContainsString($serviceName, $options->__toString());
    }

    public function test_HighlightOptions_Builder()
    {
        $optionsBuilder = HighlightOptions::builder(self::$projectId);
        $options = $optionsBuilder->build();

        $this->testHighlightOptions($options);
    }

    public function test_HighlightOptionsBuilder_Build()
    {
        $optionsBuilder = new Builder(self::$projectId);
        $options = $optionsBuilder->build();

        $this->testHighlightOptions($options);
    }

    private function testHighlightOptions(HighlightOptions $options) 
    {
        $this->assertSame(self::$projectId, $options->getProjectId());
        $this->assertSame(self::$defaultEnv, $options->getEnvironment());
        $this->assertSame(self::$defaultVersion, $options->getVersion());
        $this->assertSame(self::$defaultServiceName, $options->getServiceName()); 
        $this->assertSame(true, $options->isMetricEnabled());
        $this->assertEmpty($options->getDefaultAttributes());
    }
}