from fastapi import APIRouter

from app.models.game import AddEvidenceRequest, AdvanceRequest, GameResponse, StartGameRequest, WorseRequest
from app.services.game import add_evidence, choose_branch, make_worse, report_for, start_game
from app.services.scenarios import random_scenario

router = APIRouter(prefix="/api", tags=["game"])

def response(state) -> GameResponse:
    return GameResponse(state=state, report=report_for(state) if state.finished else None)

@router.post("/game/start", response_model=GameResponse)
async def start(payload: StartGameRequest):
    return response(await start_game(payload.situation, payload.mode))

@router.post("/game/advance", response_model=GameResponse)
async def advance(payload: AdvanceRequest):
    return response(await choose_branch(payload.state, payload.branch))

@router.post("/game/worse", response_model=GameResponse)
async def worse(payload: WorseRequest):
    return response(await make_worse(payload.state))

@router.post("/game/evidence", response_model=GameResponse)
async def evidence(payload: AddEvidenceRequest):
    return response(await add_evidence(payload.state, payload.evidence))

@router.get("/scenarios/random")
async def scenario():
    return random_scenario()
