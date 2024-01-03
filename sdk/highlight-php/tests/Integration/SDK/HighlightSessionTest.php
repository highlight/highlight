<?php

declare(strict_types=1);

namespace Highlight\Tests\Integration\SDK;

use OpenTelemetry\SDK\Common\Attribute\Attributes;
use Highlight\SDK\Common\Priority;
use Highlight\SDK\Common\Record\HighlightRecord;
use Highlight\SDK\Common\Record\HighlightLogRecordBuilder;
use Highlight\SDK\Common\Record\HighlightErrorRecordBuilder;
use Highlight\SDK\Common\Severity;
use Highlight\SDK\Exception\HighlightInvalidRecordException;
use Highlight\SDK\Highlight;
use Highlight\SDK\HighlightSession;
use PHPUnit\Framework\TestCase;
use ReflectionClass;
use DateTimeImmutable;
use Highlight\SDK\Common\Record\HighlightErrorRecord;
use Highlight\SDK\Common\Record\HighlightLogRecord;
use InvalidArgumentException;
use RuntimeException;

class HighlightSessionTest extends TestCase
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

    public function test_captureRecordFromBuilder()
    {
        $this->assertSame(false, Highlight::isInitialized());
        Highlight::init(self::$projectId);
        $this->assertSame(true, Highlight::isInitialized());

        $sessionId = 'test-session-01';
        $highlightSession = new HighlightSession($sessionId);


        // log:
        $logBuilder1 = HighlightRecord::log();
        $logBuilder1->severity(new Severity("severity test", 20, new Priority(4)));
        $highlightSession->captureRecordFromBuilder($logBuilder1);

        $logBuilder2 = (new HighlightLogRecordBuilder())->fromRecord(
            new HighlightLogRecord(
                new HighlightRecord(new DateTimeImmutable(), Attributes::create([]), new HighlightSession($sessionId), 'request-log-01'), 
                new Severity("severity test", 20, new Priority(4)),
                'Test log message'));
        $highlightSession->captureRecordFromBuilder($logBuilder2);

        // capture(...)
        $logRecordFromBuilder2 = (HighlightRecord::logFromRecord($logBuilder2->build()))->requestId('request-log-02')->build();
        $highlightSession->captureRecord($logRecordFromBuilder2);


        // error:
        $errorBuilder1 = HighlightRecord::error();
        $errorBuilder1->throwable(new RuntimeException('Test runtime exception'));
        $highlightSession->captureRecordFromBuilder($errorBuilder1);

        $errorBuilder2 = (new HighlightErrorRecordBuilder())->fromRecord(
            new HighlightErrorRecord(
                new HighlightRecord(new DateTimeImmutable(), Attributes::create([]), new HighlightSession($sessionId), 'request-error-01'),
                new RuntimeException('Test runtime exception')));
        $highlightSession->captureRecordFromBuilder($errorBuilder2);

        // capture(...)
        $errorRecordFromBuilder2 = (HighlightRecord::errorFromRecord($errorBuilder2->build()))->requestId('request-error-02')->build();
        $highlightSession->captureRecord($errorRecordFromBuilder2);
    }

    public function test_captureRecord()
    {
        if (!Highlight::isInitialized()) {
            Highlight::init(self::$projectId);
        }
        $this->assertSame(true, Highlight::isInitialized());

        $sessionId = 'test-session-01';
        $highlightSession = new HighlightSession($sessionId);

        // 1:
        $logRecord1 = (HighlightRecord::log())
            ->severity(new Severity("test", 5, new Priority(5)))
            ->message('Test log message')
            ->timeOccurred(new DateTimeImmutable())
            ->userSessionString($sessionId)
            ->requestId('test-request-01')
            ->build();
        $highlightSession->captureRecord($logRecord1);

        // 2:
        $errorRecord2 = (HighlightRecord::error())
            ->throwable(new InvalidArgumentException('Testing invalid argument throwable'))
            ->timeOccurred(new DateTimeImmutable())
            ->userSessionString($sessionId)
            ->build();
        $highlightSession->captureRecord($errorRecord2);

        // 3:
        $invalidRecord = new HighlightRecord(new DateTimeImmutable(), Attributes::create([]), new HighlightSession($sessionId), 'request-error-01');
        try {
            $highlightSession->captureRecord($invalidRecord);
        } catch (HighlightInvalidRecordException $e) {
            $this->assertTrue($e instanceof HighlightInvalidRecordException);
            $this->assertEquals("Invalid record type", $e->getMessage());
        }
    }

    public function test_captureException()
    {
        if (!Highlight::isInitialized()) {
            Highlight::init(self::$projectId);
        }
        $this->assertSame(true, Highlight::isInitialized());

        $sessionId = 'test-session-01';
        $highlightSession = new HighlightSession($sessionId);

        $throwable = new InvalidArgumentException('Invalid argument provided.');
        $highlightSession->captureException($throwable);
    }

    public function test_captureLog()
    {
        if (!Highlight::isInitialized()) {
            Highlight::init(self::$projectId);
        }
        $this->assertSame(true, Highlight::isInitialized());

        $sessionId = 'test-session-01';
        $highlightSession = new HighlightSession($sessionId);

        $severity = new Severity("test", 1, new Priority(1));
        $message = 'test message 01';
        $highlightSession->captureLog($severity, $message);
    }

    public function test_toString()
    {
        $sessionId = 'test-session-01';
        $highlightSession = new HighlightSession($sessionId);
        $this->assertStringContainsString($sessionId, $highlightSession->__toString());
    }
}