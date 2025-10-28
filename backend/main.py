from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging

from config import settings
from schemas import (
    RAGQueryRequest,
    FullContextQueryRequest,
    QueryResponse,
    HealthResponse
)
from model_loader import model_loader
from inference import inference_service
from rag_client import rag_client

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load model on startup"""
    logger.info("Starting application...")
    try:
        model_loader.load_model()
        logger.info("Model loaded successfully")
    except Exception as e:
        logger.error(f"Failed to load model: {str(e)}")
        raise
    yield
    logger.info("Shutting down application...")


app = FastAPI(
    title="RAG vs Full Context AI Agent Demo",
    description="API for comparing RAG-based and full-context query responses",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development
    allow_credentials=False,  # Must be False when allow_origins is "*"
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/", tags=["Root"])
async def root():
    return {
        "message": "RAG vs Full Context AI Agent Demo API",
        "docs": "/docs",
        "health": "/api/health"
    }


@app.get("/api/health", response_model=HealthResponse, tags=["Health"])
async def health_check():
    """Check if the model is loaded and ready"""
    return HealthResponse(
        status="healthy" if model_loader.is_loaded else "unhealthy",
        model_loaded=model_loader.is_loaded,
        model_name=settings.model_name,
        context_window_limit=settings.context_window_limit
    )


@app.post("/api/query-rag", response_model=QueryResponse, tags=["Query"])
async def query_with_rag(request: RAGQueryRequest):
    """
    Process a query using RAG service for context retrieval

    This endpoint:
    1. Calls the external RAG service with the provided payload
    2. Extracts relevant context from RAG results
    3. Generates an answer using the LLM with RAG context
    """
    try:
        logger.info(f"Processing RAG query: {request.query}")

        # Update RAG payload with the actual query
        rag_payload = request.rag_payload.copy()
        rag_payload["query"] = request.query

        # Call RAG service
        rag_response = await rag_client.search(
            endpoint=request.rag_endpoint,
            api_key=request.api_key,
            payload=rag_payload
        )

        # Extract context from RAG response
        rag_context = rag_client.extract_context(rag_response)

        if not rag_context:
            raise HTTPException(
                status_code=500,
                detail="Failed to extract context from RAG service"
            )

        # Generate response using LLM
        result = await inference_service.query_with_rag(
            query=request.query,
            rag_context=rag_context
        )

        return QueryResponse(**result)

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error processing RAG query: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/query-full-context", response_model=QueryResponse, tags=["Query"])
async def query_with_full_context(request: FullContextQueryRequest):
    """
    Process a query using full document context

    This endpoint:
    1. Uses the entire document as context
    2. Generates an answer using the LLM with full context
    """
    try:
        logger.info(f"Processing full context query: {request.query}")

        # Generate response using LLM
        result = await inference_service.query_with_full_context(
            query=request.query,
            full_context=request.full_context
        )

        return QueryResponse(**result)

    except Exception as e:
        logger.error(f"Error processing full context query: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=settings.port,
        reload=True,
        log_level="info"
    )
