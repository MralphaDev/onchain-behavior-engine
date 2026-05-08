from fastapi import APIRouter, UploadFile, File, Form

from usecases.sybil import run_sybil
from usecases.rugpull import run_rugpull

api_router = APIRouter()


@api_router.post("/analyze")
async def analyze(
    usecase: str = Form(...),
    file: UploadFile = File(...),
    token_contract: str = Form(...),
    start_date: str = Form(None),
    end_date: str = Form(None)
):
    csv_bytes = await file.read()

    if usecase == "sybil":
        return run_sybil(csv_bytes, token_contract)

    if usecase == "rugpull":
        return run_rugpull(
            csv_bytes,
            token_contract,
            start_date,
            end_date
        )

    return {"error": "invalid usecase"}