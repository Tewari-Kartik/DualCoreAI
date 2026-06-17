from fastapi import APIRouter, UploadFile, File, HTTPException
from pydantic import BaseModel
from retrieval.document_processor import process_and_index_file

router = APIRouter()

# Defining the response schema directly here for simplicity, 
# though you can move this to your api/schemas.py later!
class UploadResponse(BaseModel):
    filename: str
    chunks_created: int
    tokens_estimated: int
    status: str
    message: str

@router.post("/upload", response_model=UploadResponse)
async def upload_document(file: UploadFile = File(...)):
    try:
        # Pass the file to our new processor
        chunks_created = await process_and_index_file(file)
        
        return UploadResponse(
            filename=file.filename,
            chunks_created=chunks_created,
            tokens_estimated=chunks_created * 250,
            status="indexed",
            message="Success"
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))