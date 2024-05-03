from highlight_io.integrations.anthropic import AnthropicIntegration
from highlight_io.integrations.bedrock import BedrockIntegration
from highlight_io.integrations.boto import BotoIntegration
from highlight_io.integrations.boto3sqs import Boto3SQSIntegration
from highlight_io.integrations.celery import CeleryIntegration
from highlight_io.integrations.chromadb import ChromadbIntegration
from highlight_io.integrations.cohere import CohereIntegration
from highlight_io.integrations.haystack import HaystackIntegration
from highlight_io.integrations.langchain import LangchainIntegration
from highlight_io.integrations.llamaindex import LlamaIndexIntegration
from highlight_io.integrations.openai import OpenAIIntegration
from highlight_io.integrations.pinecone import PineconeIntegration
from highlight_io.integrations.qdrant import QdrantInstrumentation
from highlight_io.integrations.redis import RedisIntegration
from highlight_io.integrations.replicate import ReplicateIntegration
from highlight_io.integrations.requests import RequestsIntegration
from highlight_io.integrations.sqlalchemy import SQLAlchemyIntegration
from highlight_io.integrations.transformers import TransformersIntegration
from highlight_io.integrations.vertexai import VertexAIIntegration
from highlight_io.integrations.watsonx import WatsonXIntegration
from highlight_io.integrations.weaviate import WeaviateIntegration

DEFAULT_INTEGRATIONS = [
    AnthropicIntegration,
    BedrockIntegration,
    Boto3SQSIntegration,
    BotoIntegration,
    CeleryIntegration,
    ChromadbIntegration,
    CohereIntegration,
    HaystackIntegration,
    LangchainIntegration,
    LlamaIndexIntegration,
    OpenAIIntegration,
    PineconeIntegration,
    QdrantInstrumentation,
    RedisIntegration,
    ReplicateIntegration,
    RequestsIntegration,
    SQLAlchemyIntegration,
    TransformersIntegration,
    VertexAIIntegration,
    WatsonXIntegration,
    WeaviateIntegration,
]
