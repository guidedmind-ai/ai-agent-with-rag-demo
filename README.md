# RAG vs Full Context AI Agent Demo

A demonstration application comparing RAG (Retrieval-Augmented Generation) based queries against full-context queries using a local LLM.

## Project Overview

This project consists of two components:

1. **Backend (Python/FastAPI)**: Runs a local LLM (Microsoft Phi-3-mini-4k-instruct with 4-bit quantization) and provides API endpoints for querying
2. **Frontend (Next.js/React)**: Provides a side-by-side comparison UI for RAG vs Full Context queries

## Features

- 🔍 **RAG-based querying** using GuidedMind API for context retrieval
- 📄 **Full-context querying** using the entire document
- 🤖 **Local LLM inference** with 4-bit quantization for efficiency
- ⚡ **Side-by-side comparison** of both approaches
- 📊 **Response metrics** including time and token usage

## Project Structure

```
.
├── backend/                 # Python FastAPI application
│   ├── main.py             # FastAPI app and endpoints
│   ├── model_loader.py     # LLM loading with 4-bit quantization
│   ├── inference.py        # Inference service
│   ├── rag_client.py       # RAG API client
│   ├── schemas.py          # Pydantic models
│   ├── config.py           # Configuration settings
│   ├── requirements.txt    # Python dependencies
│   └── .env               # Environment variables
│
├── frontend/               # Next.js React application
│   ├── app/               # Next.js app directory
│   ├── components/        # React components
│   ├── lib/              # Utilities and API client
│   ├── package.json      # Node dependencies
│   └── .env.local        # Frontend environment variables
│
└── README.md             # This file
```

## Prerequisites

### Backend Requirements

- Python 3.9 or higher
- 8GB+ RAM (for running the 4-bit quantized model)
- CUDA-capable GPU (optional, but recommended for faster inference)

### Frontend Requirements

- Node.js 18+ and npm

## Installation & Setup

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create a virtual environment
python -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
# venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables (optional - defaults are set)
# Edit .env file if needed
```

**Backend Environment Variables (.env):**
```env
MODEL_NAME=microsoft/Phi-3-mini-4k-instruct
QUANTIZATION_BITS=4
MAX_TOKENS=512
TEMPERATURE=0.7
DEVICE=auto
PORT=8001
```

### 2. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Configure environment variables (optional - defaults are set)
# Edit .env.local file if needed
```

**Frontend Environment Variables (.env.local):**
```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:8001
```

## Running the Application

### Start Backend Server

```bash
cd backend
source venv/bin/activate  # Activate virtual environment if not already activated
python main.py
```

The backend will:
1. Load the Microsoft Phi-3-mini-4k-instruct model with 4-bit quantization (first run will download ~2GB)
2. Start FastAPI server on http://localhost:8001
3. Provide API documentation at http://localhost:8001/docs

**Note**: Port 8000 is reserved for your local RAG service. The AI agent backend runs on port 8001.

**Note**: First-time model loading may take several minutes as it downloads the model from HuggingFace.

### Start Frontend Server

```bash
cd frontend
npm run dev
```

The frontend will be available at http://localhost:3000

## Usage Guide

### RAG Panel (Left Side)

1. **RAG Endpoint**: Pre-configured with `http://localhost:8000/api/rag/search` (read-only) - points to your local RAG service
2. **API Key**: Enter your GuidedMind API key (required)
3. **RAG Payload**: JSON configuration for the RAG service
   - `query`: Auto-populated with your question
   - `filters`: Document filtering options
   - `options`: Search configuration (metadata, max results, etc.)
4. **Your Query**: Enter your question or click a sample query
5. Click **Submit Query** to process

### Full Context Panel (Right Side)

1. **Full Document Context**: Shows the entire test document (read-only)
2. **Your Query**: Enter your question or click a sample query
3. Click **Submit Query** to process

### Sample Queries

Pre-configured sample queries are provided:
- "What is the main topic of the document?"
- "What special characters are mentioned in Section 1?"
- "Explain the code example provided"
- "What is the purpose of this document?"

## API Documentation

### Backend Endpoints

#### `GET /api/health`
Check backend and model status

**Response:**
```json
{
  "status": "healthy",
  "model_loaded": true,
  "model_name": "microsoft/Phi-3-mini-4k-instruct"
}
```

#### `POST /api/query-rag`
Process query using RAG-retrieved context

**Request:**
```json
{
  "query": "What is the main topic?",
  "rag_endpoint": "http://localhost:8000/api/rag/search",
  "api_key": "your-api-key",
  "rag_payload": {
    "query": "",
    "filters": {...},
    "options": {...}
  }
}
```

**Response:**
```json
{
  "answer": "The generated answer...",
  "context_used": "Context from RAG...",
  "tokens_used": 42,
  "response_time": 1.23,
  "metadata": {"method": "RAG"}
}
```

#### `POST /api/query-full-context`
Process query using full document context

**Request:**
```json
{
  "query": "What is the main topic?",
  "full_context": "# Full document text..."
}
```

**Response:**
```json
{
  "answer": "The generated answer...",
  "context_used": "Full document...",
  "tokens_used": 42,
  "response_time": 1.23,
  "metadata": {"method": "Full Context"}
}
```

## Comparison: RAG vs Full Context

### RAG Approach (Left Panel)
- ✅ Retrieves only relevant chunks of information
- ✅ More efficient for large document sets
- ✅ Reduces token usage
- ⚠️ May miss context if retrieval isn't perfect
- ⚠️ Requires external RAG service

### Full Context Approach (Right Panel)
- ✅ Has access to all information
- ✅ No dependency on external services
- ✅ More comprehensive understanding
- ⚠️ Uses more tokens
- ⚠️ Not scalable for large documents (context limits)

## Troubleshooting

### Backend Issues

**Model fails to load:**
- Ensure you have sufficient RAM (8GB+)
- Check internet connection for initial model download
- Try setting `DEVICE=cpu` in `.env` if GPU issues occur

**Port already in use:**
- Change `PORT` in backend `.env` file
- Update `NEXT_PUBLIC_BACKEND_URL` in frontend `.env.local`

### Frontend Issues

**Backend not available:**
- Ensure backend server is running
- Check that `NEXT_PUBLIC_BACKEND_URL` is correct
- Verify no firewall is blocking localhost:8000

**RAG queries failing:**
- Verify your GuidedMind API key is correct
- Check the RAG endpoint is accessible
- Review error messages in the UI

## Technologies Used

### Backend
- **FastAPI**: Modern Python web framework
- **Transformers**: HuggingFace library for LLMs
- **BitsAndBytes**: 4-bit model quantization
- **PyTorch**: ML framework
- **Uvicorn**: ASGI server

### Frontend
- **Next.js 15**: React framework
- **TailwindCSS**: Utility-first CSS
- **Axios**: HTTP client
- **TypeScript**: Type safety

## Model Information

**Model**: microsoft/Phi-3-mini-4k-instruct
- **Size**: ~2GB (4-bit quantized)
- **Context Length**: 4K tokens
- **Quantization**: 4-bit NF4 with double quantization
- **License**: MIT

## Performance Considerations

- First query may be slower due to model warmup
- GPU inference is significantly faster than CPU
- Response time includes both inference and RAG API calls
- 4-bit quantization reduces memory by ~75% with minimal quality loss

## License

This project is provided as a demonstration. Check individual component licenses:
- microsoft/Phi-3-mini-4k-instruct: MIT
- Dependencies: See respective licenses

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review FastAPI docs at http://localhost:8000/docs
3. Check browser console and backend logs for errors

---

**Happy Testing! 🚀**
