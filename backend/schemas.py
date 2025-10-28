from pydantic import BaseModel, Field
from typing import Dict, Any, Optional


class RAGQueryRequest(BaseModel):
    query: str = Field(..., description="User query to answer")
    rag_endpoint: str = Field(..., description="RAG service endpoint URL")
    api_key: str = Field(..., description="API key for RAG service")
    rag_payload: Dict[str, Any] = Field(..., description="Payload to send to RAG service")


class FullContextQueryRequest(BaseModel):
    query: str = Field(..., description="User query to answer")
    full_context: str = Field(..., description="Full document context")


class QueryResponse(BaseModel):
    answer: str = Field(..., description="Model generated answer")
    context_used: str = Field(..., description="Context provided to the model")
    tokens_used: Optional[int] = Field(None, description="Number of tokens generated")
    response_time: float = Field(..., description="Response time in seconds")
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Additional metadata")


class HealthResponse(BaseModel):
    model_config = {"protected_namespaces": ()}

    status: str
    model_loaded: bool
    model_name: str
    context_window_limit: Optional[int] = Field(None, description="Context window limit in tokens")
