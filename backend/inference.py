import time
import logging
from typing import Dict, Any
from model_loader import model_loader
from config import settings

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """You are a helpful assistant that provides direct, concise answers based on the given context. Answer the question directly without showing your reasoning process or thinking steps. Be brief and to the point."""


class InferenceService:
    def __init__(self):
        self.system_prompt = SYSTEM_PROMPT

    def generate_response(self, context: str, query: str) -> Dict[str, Any]:
        """
        Generate a response using the Qwen model

        Args:
            context: Context information
            query: User's question

        Returns:
            Dictionary with answer and metadata
        """
        try:
            start_time = time.time()

            # Truncate context to fit within context window limit
            truncated_context = model_loader.truncate_to_context_limit(context)

            # Build the prompt
            prompt = f"""{self.system_prompt}

Context:
{truncated_context}

User Question: {query}

Answer:"""

            # Generate response using the model
            answer = model_loader.generate_response(prompt)

            response_time = time.time() - start_time

            # Estimate tokens (rough approximation)
            tokens_generated = len(answer.split())

            logger.info(f"Generated response in {response_time:.2f}s")

            return {
                "answer": answer,
                "tokens_used": tokens_generated,
                "response_time": response_time
            }

        except Exception as e:
            logger.error(f"Error during inference: {str(e)}")
            raise

    async def query_with_rag(self, query: str, rag_context: str) -> Dict[str, Any]:
        """
        Generate answer using RAG-retrieved context

        Args:
            query: User's question
            rag_context: Context retrieved from RAG service

        Returns:
            Response dictionary with answer and metadata
        """
        result = self.generate_response(rag_context, query)

        return {
            "answer": result["answer"],
            "context_used": rag_context,
            "tokens_used": result["tokens_used"],
            "response_time": result["response_time"],
            "metadata": {"method": "RAG"}
        }

    async def query_with_full_context(self, query: str, full_context: str) -> Dict[str, Any]:
        """
        Generate answer using full document context

        Args:
            query: User's question
            full_context: Complete document text

        Returns:
            Response dictionary with answer and metadata
        """
        result = self.generate_response(full_context, query)

        return {
            "answer": result["answer"],
            "context_used": full_context,
            "tokens_used": result["tokens_used"],
            "response_time": result["response_time"],
            "metadata": {"method": "Full Context"}
        }


inference_service = InferenceService()
