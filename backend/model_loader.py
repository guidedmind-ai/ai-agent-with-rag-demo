from transformers import AutoTokenizer, AutoModelForCausalLM
from config import settings
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class ModelLoader:
    _instance = None
    _tokenizer = None
    _model = None
    _loaded = False

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(ModelLoader, cls).__new__(cls)
        return cls._instance

    def load_model(self):
        """Load the Qwen model using transformers"""
        if self._loaded:
            logger.info("Model already loaded")
            return

        try:
            logger.info(f"Loading model: {settings.model_name}")

            # Load tokenizer
            logger.info("Loading tokenizer...")
            self._tokenizer = AutoTokenizer.from_pretrained(settings.model_name)

            # Load model
            logger.info("Loading model with auto device mapping...")
            self._model = AutoModelForCausalLM.from_pretrained(
                settings.model_name,
                torch_dtype="auto",
                device_map="auto",
                max_position_embeddings=settings.context_window_limit
            )

            self._loaded = True
            logger.info("Model loaded successfully")

        except Exception as e:
            logger.error(f"Error loading model: {str(e)}")
            raise

    @property
    def tokenizer(self):
        if not self._loaded:
            raise RuntimeError("Tokenizer not loaded. Call load_model() first.")
        return self._tokenizer

    @property
    def is_loaded(self):
        return self._loaded

    @property
    def model(self):
        if not self._loaded:
            raise RuntimeError("Model not loaded. Call load_model() first.")
        return self._model

    def truncate_to_context_limit(self, text: str) -> str:
        """Truncate text to fit within context window limit"""
        tokens = self._tokenizer.encode(text)
        if len(tokens) <= settings.context_window_limit:
            return text

        logger.warning(f"Context exceeds limit ({len(tokens)} > {settings.context_window_limit}). Truncating...")
        truncated_tokens = tokens[:settings.context_window_limit]
        return self._tokenizer.decode(truncated_tokens, skip_special_tokens=True)

    def generate_response(self, prompt: str) -> str:
        """Generate response using the Qwen model"""
        if not self._loaded:
            raise RuntimeError("Model not loaded. Call load_model() first.")

        # Prepare messages
        messages = [{"role": "user", "content": prompt}]

        # Apply chat template
        text = self._tokenizer.apply_chat_template(
            messages,
            tokenize=False,
            add_generation_prompt=True,
            enable_thinking=False  # Disable thinking mode for faster responses
        )

        # Tokenize
        model_inputs = self._tokenizer([text], return_tensors="pt").to(self._model.device)

        # Check if input exceeds context window limit
        input_length = model_inputs.input_ids.shape[1]
        if input_length > settings.context_window_limit - settings.max_tokens:
            logger.warning(
                f"Input length ({input_length}) + max_new_tokens ({settings.max_tokens}) "
                f"exceeds context limit ({settings.context_window_limit}). Truncating input..."
            )
            # Truncate input to fit within context window
            max_input_length = settings.context_window_limit - settings.max_tokens
            model_inputs.input_ids = model_inputs.input_ids[:, :max_input_length]
            model_inputs.attention_mask = model_inputs.attention_mask[:, :max_input_length]

        # Generate
        generated_ids = self._model.generate(
            **model_inputs,
            max_new_tokens=settings.max_tokens,
            temperature=settings.temperature,
            do_sample=True,
            top_p=0.9
        )

        # Decode only the generated part (not the input)
        output_ids = generated_ids[0][len(model_inputs.input_ids[0]):].tolist()
        response = self._tokenizer.decode(output_ids, skip_special_tokens=True).strip()

        return response


# Global instance
model_loader = ModelLoader()
