# Highlight PHP SDK

Below are some examples demonstrating usage of the PHP SDK:
```php
    use Highlight\SDK\Common\HighlightOptions;
    use Highlight\SDK\Highlight;


    $projectId = '1jdkeo52';

    // Use only a projectId to bootstrap Highlight
    if (!Highlight::isInitialized()) {
        Highlight::init($projectId);
    }

    // Use a HighlightOptions instance to bootstrap Highlight
    $options = HighlightOptions::builder($projectId)->build();
    if (!Highlight::isInitialized()) {
        Highlight::initWithOptions($options);
    }

    // Use a HighlightOptions instance prepped with a serviceName to bootstrap Highlight
    $options = HighlightOptions::builder($projectId)->serviceName('test-service-01')->build();

    if (!Highlight::isInitialized()) {
        Highlight::initWithOptions($options);
    }

```