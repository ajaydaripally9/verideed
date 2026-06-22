import logging
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.ocr import extract_text_and_boxes
from app.layout_analyzer import analyze_layout
from app.coordinate_extractor import extract_metadata_and_coordinates

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="VeriDeed AI Service", version="1.0.0")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "verideed-ai-service"}

@app.post("/analyze")
async def analyze_document(file: UploadFile = File(...)):
    """
    Accepts a deed PDF or Image, performs OCR, layout forgery checks,
    and boundary coordinate extraction.
    """
    if not file:
        raise HTTPException(status_code=400, detail="No file uploaded")
        
    logger.info(f"Received file for analysis: {file.filename}")
    
    try:
        # Read file bytes
        file_bytes = await file.read()
        
        # 1. OCR Text & Bounding Box Extraction
        text_content, pages_data = extract_text_and_boxes(file_bytes, file.filename)
        
        # 2. Layout Analysis (Forgery check)
        layout_report = analyze_layout(pages_data)
        
        # 3. Metadata & Boundary Coordinate Extraction
        metadata_report = extract_metadata_and_coordinates(text_content)
        
        # Combine the results
        ocr_score = 95.0 # Baseline OCR confidence
        if not text_content.strip():
            ocr_score = 0.0
        elif "Fallback" in text_content:
            ocr_score = 60.0
            
        response_data = {
            "owner_name": metadata_report["owner_name"],
            "survey_number": metadata_report["survey_number"],
            "area": metadata_report["area"],
            "wkt_polygon": metadata_report["wkt_polygon"],
            "frontend_coords": metadata_report["frontend_coords"],
            "ocr_score": ocr_score,
            "layout_score": layout_report["score"],
            "layout_status": layout_report["status"],
            "layout_issues": layout_report["issues"],
            "suspicious_regions": layout_report["suspicious_regions"],
            "raw_text": text_content[:2000] # Return preview of text
        }
        
        logger.info(f"Successfully analyzed {file.filename}. Owner: {response_data['owner_name']}, Survey: {response_data['survey_number']}")
        return response_data
        
    except Exception as e:
        logger.error(f"Error analyzing document: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error analyzing document: {str(e)}")
