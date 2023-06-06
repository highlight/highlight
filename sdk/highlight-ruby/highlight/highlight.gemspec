require_relative 'lib/highlight/version'

Gem::Specification.new do |spec|
  spec.name          = "highlight_io"
  spec.version       = Highlight::VERSION
  spec.authors       = ["Highlight"]
  spec.email         = ["support@highlight.io"]

  spec.summary       = "The Highlight SDK for Ruby"
  spec.homepage      = "https://www.highlight.io"
  spec.license       = "MIT"
  spec.required_ruby_version = Gem::Requirement.new(">= 2.3.0")

  spec.metadata["homepage_uri"] = spec.homepage

  # Specify which files should be added to the gem when it is released.
  # The `git ls-files -z` loads the files in the RubyGem that have been added into git.
  spec.files         = Dir.chdir(File.expand_path('..', __FILE__)) do
    `git ls-files -z`.split("\x0").reject { |f| f.match(%r{^(test|spec|features)/}) }
  end
  spec.bindir        = "exe"
  spec.executables   = spec.files.grep(%r{^exe/}) { |f| File.basename(f) }
  spec.require_paths = ["lib"]

  spec.add_runtime_dependency 'opentelemetry-sdk'
  spec.add_runtime_dependency 'opentelemetry-exporter-otlp'
  spec.add_runtime_dependency 'opentelemetry-instrumentation-all'
  spec.add_runtime_dependency 'opentelemetry-semantic_conventions'
  spec.add_runtime_dependency 'grpc', '~> 1.52'
end
