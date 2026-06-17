import os
import shutil
from pathlib import Path
from fastapi import UploadFile
from langchain_community.document_loaders import PyPDFLoader, TextLoader, Docx2txtLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from retrieval.vector_store import get_vector_store

# Use your existing data/uploads folder
UPLOAD_DIR = Path("data/uploads")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

async def process_and_index_file(file: UploadFile) -> int:
    """Saves file, extracts text, chunks it, and prepares it for the vector database."""
    file_path = UPLOAD_DIR / file.filename
    
    # 1. Save the uploaded file to your data/uploads directory
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    print(f"Processing uploaded file: {file.filename}")
        
    # 2. Extract text based on file type
    try:
        if file.filename.endswith(".pdf"):
            loader = PyPDFLoader(str(file_path))
        elif file.filename.endswith(".txt"):
            loader = TextLoader(str(file_path))
        elif file.filename.endswith(".docx"):
            loader = Docx2txtLoader(str(file_path))
        else:
            raise ValueError("Unsupported format. Please upload PDF, TXT, or DOCX.")
            
        documents = loader.load()
        
        # 3. Chop the text into smaller, searchable chunks
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000, 
            chunk_overlap=200,
            length_function=len
        )
        chunks = text_splitter.split_documents(documents)
        
        # 4. Add to Vector Store
        print("Converting text to embeddings and saving to ChromaDB...")
        vector_store = get_vector_store()
        vector_store.add_documents(chunks)
        
        print(f"Successfully split into {len(chunks)} chunks.")
        return len(chunks)
        
    except Exception as e:
        print(f"Error processing file: {str(e)}")
        raise e