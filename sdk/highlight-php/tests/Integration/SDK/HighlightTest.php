<?php

declare(strict_types=1);

namespace Highlight\Tests\Integration\SDK;

use DateTimeImmutable;
use Highlight\SDK\Common\HighlightHeader;
use Highlight\SDK\Common\HighlightOptions;
use Highlight\SDK\Common\Priority;
use Highlight\SDK\Common\Record\HighlightRecord;
use Highlight\SDK\Common\Severity;
use Highlight\SDK\Exception\HighlightIllegalStateException;
use Highlight\SDK\Exception\HighlightInvalidOptionException;
use Highlight\SDK\Highlight;
use PHPUnit\Framework\TestCase;
use ReflectionClass;
use InvalidArgumentException;

class HighlightTest extends TestCase
{
    private static string $projectId = 'test-project-01';

    protected function tearDown(): void
    {
        $reflectionClass = new ReflectionClass('Highlight\SDK\Highlight');
        $highlightProperty = $reflectionClass->getProperty('highlight');
        $highlightProperty->setAccessible(true);
        // set the singleton to null
        $highlightProperty->setValue(null);
    }

    public function test_init()
    {
        $this->assertSame(false, Highlight::isInitialized());
        Highlight::init(self::$projectId);
        $this->assertSame(true, Highlight::isInitialized());
    }

    public function test_initWithOptions()
    {
        $options = HighlightOptions::builder(self::$projectId)->build();

        $this->assertSame(false, Highlight::isInitialized());
        Highlight::initWithOptions($options);
        $this->assertSame(true, Highlight::isInitialized());
        $this->assertEquals("unknown", $options->getServiceName());
    }

    public function test_initWithOptions_and_ServiceName() 
    {
        $serviceName = 'test-service-03'; 
        $options = HighlightOptions::builder(self::$projectId)->serviceName($serviceName)->build();

        $this->assertSame(false, Highlight::isInitialized());
        Highlight::initWithOptions($options);
        $this->assertSame(true, Highlight::isInitialized());
        $this->assertNotEmpty($options->getServiceName());
        $this->assertEquals($serviceName, $options->getServiceName());

        // subsequent invocations of Highlight::init() should throw an exception
        try {
            Highlight::init(self::$projectId);
        } catch (HighlightIllegalStateException $e) {
            $this->assertTrue($e instanceof HighlightIllegalStateException);
            $this->assertEquals("Highlight is already initialized", $e->getMessage());
        }

        // subsequent invocations of Highlight::initWithOptions() should throw an exception
        try {
            Highlight::initWithOptions($options);
        } catch (HighlightIllegalStateException $e) {
            $this->assertTrue($e instanceof HighlightIllegalStateException);
            $this->assertEquals("Highlight is already initialized", $e->getMessage());
        }
    }

    public function test_capture_negative() 
    {
        $requestId = "test-request-04";
        $sessionId = "test-session-id";
        $message = "test-message";
        $severity = new Severity("test", 1, new Priority(1));

        // capture() - log
        try {
            $logRecord = (HighlightRecord::log())->requestId($requestId)->build();
        } catch (InvalidArgumentException $e) {
            $this->assertTrue($e instanceof InvalidArgumentException);
            $this->assertEquals("Severity cannot be null", $e->getMessage());
        }

        $logRecordBuilder = HighlightRecord::log();
        $logRecord = $logRecordBuilder->severity($severity)->requestId($requestId)->build();

        try {
            Highlight::capture($logRecord);
        } catch (HighlightIllegalStateException $e) {
            $this->assertTrue($e instanceof HighlightIllegalStateException);
            $this->assertEquals("Highlight instance is not initialized", $e->getMessage());
        }

        // capture() - error
        try {
            $errorRecord = (HighlightRecord::error())->build();
        } catch (InvalidArgumentException $e) {
            $this->assertTrue($e instanceof InvalidArgumentException);
            $this->assertEquals("Throwable cannot be null", $e->getMessage());
        }

        $errorRecordBuilder = HighlightRecord::error();
        $throwable = new HighlightInvalidOptionException("Test throwable");
        $errorRecord = $errorRecordBuilder->throwable($throwable)->build();

        try {
            Highlight::capture($errorRecord);
        } catch (HighlightIllegalStateException $e) {
            $this->assertTrue($e instanceof HighlightIllegalStateException);
            $this->assertEquals("Highlight instance is not initialized", $e->getMessage());
        }
        // captureLog()
        try {
            Highlight::captureLog($severity, $message);
        } catch (HighlightIllegalStateException $e) {
            $this->assertTrue($e instanceof HighlightIllegalStateException);
            $this->assertEquals("Highlight instance is not initialized", $e->getMessage());
        }
        // captureLogWithSessionAndRequest()
        try {
            Highlight::captureLogWithSessionAndRequest($severity, $message, $sessionId, $requestId);
        } catch (HighlightIllegalStateException $e) {
            $this->assertTrue($e instanceof HighlightIllegalStateException);
            $this->assertEquals("Highlight instance is not initialized", $e->getMessage());
        }
        // captureException()
        try {
            Highlight::captureException($throwable);
        } catch (HighlightIllegalStateException $e) {
            $this->assertTrue($e instanceof HighlightIllegalStateException);
            $this->assertEquals("Highlight instance is not initialized", $e->getMessage());
        }
        // captureExceptionWithHighlightHeader()
        try {
            Highlight::captureExceptionWithHighlightHeader($throwable, new HighlightHeader($sessionId, $requestId));
        } catch (HighlightIllegalStateException $e) {
            $this->assertTrue($e instanceof HighlightIllegalStateException);
            $this->assertEquals("Highlight instance is not initialized", $e->getMessage());
        }
        // captureRecordFromBuilder()
        try {
            Highlight::captureRecordFromBuilder(HighlightRecord::error());
        } catch (HighlightIllegalStateException $e) {
            $this->assertTrue($e instanceof HighlightIllegalStateException);
            $this->assertEquals("Highlight instance is not initialized", $e->getMessage());
        }
    }

    public function test_capture_positive() 
    {
        $sessionId = "test-session-string";
        $requestId1 = "test-request-01";
        $requestId2 = "test-request-02";

        $severity = new Severity("test", 1, new Priority(1));
        $message = "Test log message";
        $throwable = new HighlightInvalidOptionException("Test throwable");

        if (!Highlight::isInitialized()) {
            Highlight::init(self::$projectId);
        }
        $this->assertSame(true, Highlight::isInitialized());

        $logRecord1 = (HighlightRecord::log())
            ->severity($severity)
            ->message($message)
            ->timeOccurred(new DateTimeImmutable())
            ->userSessionString($sessionId)
            ->requestId($requestId1)
            ->build();
        Highlight::capture($logRecord1);

        $logRecord2 = (HighlightRecord::logFromRecord($logRecord1))->requestId($requestId2)->build();
        Highlight::capture($logRecord2);

        $errorRecord1 = (HighlightRecord::error())
            ->throwable($throwable)
            ->timeOccurred(new DateTimeImmutable())
            ->userSessionString($sessionId)
            ->build();
        Highlight::capture($errorRecord1);
        $errorRecord2 = (HighlightRecord::errorFromRecord($errorRecord1))->requestId($requestId2)->build();
        Highlight::capture($errorRecord2);

    }
}