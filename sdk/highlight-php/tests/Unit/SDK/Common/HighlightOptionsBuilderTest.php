<?php

declare(strict_types=1);

namespace Highlight\Tests\Unit\SDK\Common;

use Highlight\SDK\Common\HighlightOptions;
use Highlight\SDK\Common\HighlightOptionsBuilder as Builder;
use OpenTelemetry\SDK\Common\Attribute\Attributes;
use PHPUnit\Framework\TestCase;

class HighlightOptionsBuilderTest extends TestCase
{
    private static string $projectId = 'test-project-01';
    private static string $dev = 'development';
    private static string $unknown = 'unknown';

    public function test_HighlightOptions_Constructor() 
    {
        $optionsBuilder = new Builder(self::$projectId);
                
        $metricEnabled = false;
        $optionsBuilder->metric($metricEnabled);
        $this->assertSame($metricEnabled, $optionsBuilder->build()->isMetricEnabled());

        $metricEnabled = true;
        $optionsBuilder->metric($metricEnabled);
        $this->assertSame($metricEnabled, $optionsBuilder->build()->isMetricEnabled());
    }

    public function test_Equality()
    {
        $options1 = (HighlightOptions::builder(self::$projectId))->build();
        $options2 = (new Builder(self::$projectId))->build();

        $this->assertEquals($options1, $options2);        
    }
}