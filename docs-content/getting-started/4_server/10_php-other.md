# Highlight.io PHP & Laravel SDK

The PHP & Laravel SDK has been implemented in the `sdk/highlight-php` repository.

## Installation

```bash
composer require highlight/highlight-php
```

## Setup (Laravel)

Add your Highlight Project ID to your `.env` file:
```env
HIGHLIGHT_PROJECT_ID=your_project_id
```

The `HighlightServiceProvider` automatically initializes OpenTelemetry and registers a logging listener for exceptions.

To route logs to Highlight, add the highlight channel to `config/logging.php`:
```php
'channels' => [
    'highlight' => [
        'driver' => 'custom',
        'via' => \Highlight\SDK\Laravel\HighlightServiceProvider::class,
    ],
]
```

## Setup (Vanilla PHP)

```php
use Highlight\SDK\Highlight;

Highlight::init('your_project_id');

try {
    // your code
} catch (\Throwable $e) {
    Highlight::recordException($e);
}
```
