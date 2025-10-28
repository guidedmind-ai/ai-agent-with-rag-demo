from pydantic_settings import BaseSettings
from typing import Literal


class Settings(BaseSettings):
    model_name: str = "Qwen/Qwen3-4B" # Qwen/Qwen2.5-3B-Instruct
    quantization_bits: int = 4
    max_tokens: int = 512
    temperature: float = 0.7
    device: Literal["auto", "cpu", "cuda"] = "auto"
    port: int = 8001
    context_window_limit: int = 4096  # Limit context window to 8k tokens (reduced from 128k)

    class Config:
        env_file = ".env"
        protected_namespaces = ()


settings = Settings()
