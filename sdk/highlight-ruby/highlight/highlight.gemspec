require_relative 'lib/highlight/version'

Gem::Specification.new do |spec|
  spec.name          = 'highlight_io'
  spec.version       = Highlight::VERSION
  spec.authors       = ['Highlight']
  spec.email         = ['support@highlight.io']

  spec.summary       = 'The Highlight SDK for Ruby'
  spec.homepage      = 'https://www.highlight.io'
  spec.license       = 'MIT'
  spec.required_ruby_version = Gem::Requirement.new('>= 3.0.0')

  spec.metadata['homepage_uri'] = spec.homepage

  # Specify which files should be added to the gem when it is released.
  # The `git ls-files -z` loads the files in the RubyGem that have been added into git.
  spec.files =
    Dir.chdir(File.expand_path(__dir__)) do
      `git ls-files -z`.split("\x0").reject { |f| f.match(%r{^(test|spec|features)/}) }
    end
  spec.bindir        = 'exe'
  spec.executables   = spec.files.grep(%r{^exe/}) { |f| File.basename(f) }
  spec.require_paths = ['lib']

  spec.add_dependency('grpc', '~> 1.66')
  spec.add_dependency('opentelemetry-exporter-otlp', '~> 0.28.1')
  spec.add_dependency('opentelemetry-instrumentation-all', '~> 0.62.1')
  spec.add_dependency('opentelemetry-sdk', '~> 1.5.0')
  spec.add_dependency('opentelemetry-semantic_conventions', '~> 1.10.1')
  spec.metadata['rubygems_mfa_required'] = 'true'
end
