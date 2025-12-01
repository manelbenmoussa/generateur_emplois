from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Any, Dict
from timetable import greedy_timetable

app = FastAPI()

class TimetableRequest(BaseModel):
    data: Dict[str, Any]

@app.post("/generate-greedy")
def generate_greedy(req: TimetableRequest):
    import sys
    import traceback
    try:
        result = greedy_timetable(req.data)
        return {"assignments": result}
    except Exception as e:
        print("[FATAL] Exception in /generate-greedy endpoint:", file=sys.stderr)
        print(e, file=sys.stderr)
        traceback.print_exc(file=sys.stderr)
        raise HTTPException(status_code=500, detail=str(e))
