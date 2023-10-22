use std::borrow::Cow;
use opentelemetry_api::KeyValue;
use super::meta::consts;

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
            backend_url: Some(consts::DEFAULT_BACKEND.into()),
            environment: Some(consts::DEFAULT_ENVIROMENT.into()),
            version: Some(consts::DEFAULT_VERSION.into()),
            service_name: Some(consts::DEFAULT_SERVICE_NAME.into()),
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

#[cfg(test)]
mod tests {
    use crate::sdk::common::{attributes, meta::consts};
    use super::HighlightOptions;

    #[test]
    fn build_default_highlight_options() {
        let options = HighlightOptions::default();
        assert_eq!(options.project_id, None);
        assert_eq!(options.backend_url.unwrap(), consts::DEFAULT_BACKEND);
        assert_eq!(options.environment.unwrap(), consts::DEFAULT_ENVIROMENT);
        assert_eq!(options.version.unwrap(), consts::DEFAULT_VERSION);
        assert_eq!(options.service_name.unwrap(), consts::DEFAULT_SERVICE_NAME);
        assert_eq!(options.attributes, None);
    }

    #[test]
    fn build_highlight_options_with_builder() {
        let project_id = "123abc";
        let backend_url = "https://otel.example.com:4318";
        let environment = "testing";
        let version = "0.1.0";
        let service_name = "highlight-options-test";
        let attributes = vec![
            attributes::HIGHLIGHT_SESSION_ID.string("aaaaa-bbb-cccc")
        ];
        let options = HighlightOptions::builder(project_id)
            .with_backend_url(backend_url)
            .with_environment(environment)
            .with_version(version)
            .with_service_name(service_name)
            .with_attributes(attributes)
            .build();

        assert_eq!(options.project_id.unwrap(), project_id);
        assert_eq!(options.backend_url.unwrap(), backend_url);
        assert_eq!(options.environment.unwrap(), environment);
        assert_eq!(options.version.unwrap(), version);
        assert_eq!(options.service_name.unwrap(), service_name);

        let attrs =  options.attributes.unwrap();
        assert_eq!(attrs.len(), 1);
        assert_eq!(attrs[0].key.as_str(), "highlight.session_id");
        assert_eq!(attrs[0].value.as_str(), "aaaaa-bbb-cccc");
    }
}
