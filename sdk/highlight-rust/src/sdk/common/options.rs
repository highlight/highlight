use std::borrow::Cow;
use opentelemetry_api::KeyValue;

const DEFAULT_ENVIROMENT: &str = "development";
const DEFAULT_VERSION: &str = "unknown";
const DEFAULT_SERVICE_NAME: &str = "unknown";

type StringType = Cow<'static, str>;

#[derive(Debug, Clone)]
#[non_exhaustive]
pub struct HighlightOptions {
    pub(crate) project_id: Option<StringType>,
    pub(crate) backend_url: Option<StringType>,
    pub(crate) environment: Option<StringType>,
    pub(crate) version: Option<StringType>,
    pub(crate) service_name: Option<StringType>,
    pub(crate) attributes: Option<Vec<KeyValue>>
}

impl HighlightOptions {
    pub fn builder<T: Into<StringType>>(project_id: T) -> HighlightOptionsBuilder {
        HighlightOptionsBuilder::new(project_id)
    }
}

impl Default for HighlightOptions {
    fn default() -> Self {
        Self {
            project_id: None,
            backend_url: None,
            environment: Some(DEFAULT_ENVIROMENT.into()),
            version: Some(DEFAULT_VERSION.into()),
            service_name: Some(DEFAULT_SERVICE_NAME.into()),
            attributes: None
        }    
    }
}

#[derive(Default)]
pub struct HighlightOptionsBuilder {
    options: HighlightOptions
}

impl HighlightOptionsBuilder {
    pub fn new<T: Into<StringType>>(project_id: T) -> Self {
        Self {
            options: HighlightOptions {
                project_id: Some(project_id.into()),
                ..Default::default()
            }
        }
    }

    pub fn with_backend_url<T: Into<StringType>>(self, url: T) -> Self {
        Self {
            options: HighlightOptions {
                backend_url: Some(url.into()),
                ..self.options
            }
        }
    }

    pub fn with_environment<T: Into<StringType>>(self, environment: T) -> Self {
        Self {
            options: HighlightOptions {
                environment: Some(environment.into()),
                ..self.options
            }
        }
    }

    pub fn with_version<T: Into<StringType>>(self, version: T) -> Self {
        Self {
            options: HighlightOptions {
                version: Some(version.into()),
                ..self.options
            }
        }
    }

    pub fn with_service_name<T: Into<StringType>>(self, name: T) -> Self {
        Self {
            options: HighlightOptions {
                service_name: Some(name.into()),
                ..self.options
            }
        }
    }

    pub fn with_attributes(self, attributes: Vec<KeyValue>) -> Self {
        Self {
            options: HighlightOptions {
                attributes: Some(attributes),
                ..self.options
            }
        }
    }

    pub fn build(self) -> HighlightOptions {
        self.options
    }
}