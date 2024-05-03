import { siteUrl } from '../../../../utils/urls'
import { downloadSnippet, init } from '../../backend/python/shared-snippets'
import { QuickStartContent } from '../../QuickstartContent'
import { verifyTraces } from '../shared-snippets'

const libs = {
	Anthropic: { url: 'https://www.anthropic.com/', pypi: 'anthropic' },
	'Bedrock (AWS)': { url: 'https://aws.amazon.com/bedrock/', pypi: 'boto3' },
	ChromaDB: { url: 'https://www.trychroma.com/', pypi: 'chromadb' },
	Cohere: { url: 'https://cohere.com/', pypi: 'cohere' },
	Haystack: { url: 'https://haystack.deepset.ai/', pypi: 'haystack-ai' },
	Langchain: { url: 'https://www.langchain.com/', pypi: 'langchain' },
	LlamaIndex: { url: 'https://www.llamaindex.ai/', pypi: 'llamaindex' },
	'OpenAI (Azure)': { url: 'https://openai.com/', pypi: 'openai' },
	Pinecone: { url: 'https://www.pinecone.io/', pypi: 'pinecone' },
	Qdrant: { url: 'https://qdrant.tech/', pypi: 'qdrant' },
	Replicate: { url: 'https://replicate.com/', pypi: 'replicate' },
	'Transformers (Hugging Face)': {
		url: 'https://huggingface.co/docs/transformers/en/index/',
		pypi: 'transformers',
	},
	'VertexAI (GCP)': {
		url: 'https://cloud.google.com/vertex-ai?hl=en/',
		pypi: 'vertexai',
	},
	'WatsonX (IBM Watsonx AI)': {
		url: 'https://www.ibm.com/watsonx/',
		pypi: 'watsonx',
	},
	Weaviate: { url: 'https://weaviate.io/', pypi: 'weaviate' },
}

export const PythonAITracesContent: QuickStartContent = {
	title: 'Python AI / LLM Libraries',
	subtitle:
		'Learn how to set up highlight.io tracing for common Python AI / LLM libraries to automatically instrument model training, inference, and evaluation.',
	logoUrl: siteUrl('/images/quickstart/python.svg'),
	entries: [
		{
			title: 'Supported Python libraries',
			content:
				`highlight.io supports tracing AI / LLM operation using [OpenLLMetry](https://github.com/traceloop/openllmetry/). Supported libraries include:\n\n` +
				Object.entries(libs)
					.map(([key, value]) => `[${key}](${value.url})`)
					.join(', '),
			code: [
				{
					text: `# install and use your library in your code
pip install openai
pip install ${
						Object.values(libs)[
							Math.floor(
								Math.random() * Object.values(libs).length,
							)
						].pypi
					}`,
					language: 'bash',
				},
			],
		},
		downloadSnippet(),
		{
			title: 'Initialize the Highlight SDK for your respective framework.',
			content:
				'Setup the SDK. Supported libraries will be instrumented automatically.',
			code: [
				{
					text: `import highlight_io

${init}
`,
					language: 'python',
				},
			],
		},
		{
			title: 'Instrument your code.',
			content:
				'Setup a endpoint or function with HTTP trigger that utilizes the library you are trying to test. ' +
				'For example, if you are testing the requests library, you can setup a function that makes a request to a public API.',
			code: [
				{
					text: `from openai import OpenAI

import highlight_io
from highlight_io.integrations.flask import FlaskIntegration

${init}

client = OpenAI()

chat_history = [
    {"role": "system", "content": "You are a helpful assistant."},
]


@highlight_io.trace
def complete(message: str) -> str:
    chat_history.append({"role": "user", "content": message})
    completion = client.chat.completions.create(
        model="gpt-4-turbo",
        messages=chat_history,
    )
    chat_history.append(
        {"role": "assistant", "content": completion.choices[0].message.content}
    )
    return completion.choices[0].message.content


def main():
    print(complete("What is the capital of the United States?"))


if __name__ == "__main__":
    main()
    H.flush()
`,
					language: 'python',
				},
			],
		},
		{
			...verifyTraces,
			content:
				verifyTraces.content +
				` ![Python AI / LLM Libraries](/images/docs/python-ai-traces.png)`,
		},
	],
}
