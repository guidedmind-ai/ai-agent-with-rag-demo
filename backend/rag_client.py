import httpx
import logging
from typing import Dict, Any

logger = logging.getLogger(__name__)


class RAGClient:
    def __init__(self, timeout: int = 60):
        self.timeout = timeout

    async def search(self, endpoint: str, api_key: str, payload: Dict[str, Any]) -> Dict[str, Any]:
        """
        Call the RAG service to retrieve relevant context

        Args:
            endpoint: RAG service endpoint URL
            api_key: API key for authentication
            payload: Search payload with query and filters

        Returns:
            RAG service response containing search results
        """
        try:
            headers = {
                "X-API-Key": api_key,
                "Content-Type": "application/json"
            }

            async with httpx.AsyncClient(timeout=self.timeout) as client:
                logger.info(f"Calling RAG endpoint: {endpoint}")
                response = await client.post(
                    endpoint,
                    json=payload,
                    headers=headers
                )
                response.raise_for_status()

                result = response.json()
                logger.info("RAG service call successful")
                return result

        except httpx.HTTPStatusError as e:
            logger.error(f"HTTP error calling RAG service: {e.response.status_code} - {e.response.text}")
            raise Exception(f"RAG service returned error: {e.response.status_code}")
        except httpx.RequestError as e:
            logger.error(f"Request error calling RAG service: {str(e)}")
            raise Exception(f"Failed to connect to RAG service: {str(e)}")
        except Exception as e:
            logger.error(f"Unexpected error calling RAG service: {str(e)}")
            raise

    def extract_context(self, rag_response: Dict[str, Any]) -> str:
        """
        Extract relevant text context from RAG response

        Args:
            rag_response: Response from RAG service

        Returns:
            Concatenated context string
        """
        try:
            # Assuming RAG service returns results in a 'results' field
            # Adjust based on actual API response structure
            if "results" in rag_response:
                contexts = []
                for result in rag_response["results"]:
                    if "text" in result:
                        contexts.append(result["text"])
                    elif "content" in result:
                        contexts.append(result["content"])
                return "\n\n".join(contexts)
            elif "documents" in rag_response:
                return "\n\n".join(rag_response["documents"])
            else:
                # Fallback: return entire response as string
                return str(rag_response)
        except Exception as e:
            logger.error(f"Error extracting context from RAG response: {str(e)}")
            return str(rag_response)


rag_client = RAGClient(timeout=60)  # 60 second timeout for RAG service
