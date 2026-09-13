from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field

Mode = Literal["detective", "delulu", "optimist"]
BranchTone = Literal["chill", "suspicious", "worst_case"]
EvidenceKind = Literal["fact", "assumption", "delusion"]


class StartGameRequest(BaseModel):
    situation: str = Field(min_length=3, max_length=500)
    mode: Mode


class EvidenceItem(BaseModel):
    text: str = Field(min_length=1, max_length=240)
    kind: EvidenceKind = "fact"


class Stage(BaseModel):
    level: int
    title: str
    thought: str
    branch: BranchTone | None = None


class Interpretation(BaseModel):
    label: str
    tone: BranchTone
    description: str


class GameState(BaseModel):
    situation: str
    mode: Mode
    current_level: int = Field(ge=1, le=5)
    stages: list[Stage] = Field(default_factory=list)
    selected_branches: list[BranchTone] = Field(default_factory=list)
    evidence: list[EvidenceItem] = Field(default_factory=list)
    worse_clicks: int = Field(default=0, ge=0)
    score: int = Field(default=0, ge=0, le=100)
    status: str = "🧘 Completely Chill"
    finished: bool = False
    latest_thought: str = ""
    latest_explanation: str = ""
    interpretations: list[Interpretation] = Field(default_factory=list)


class AdvanceRequest(BaseModel):
    state: GameState
    branch: BranchTone


class WorseRequest(BaseModel):
    state: GameState


class AddEvidenceRequest(BaseModel):
    state: GameState
    evidence: EvidenceItem


class Report(BaseModel):
    final_score: int
    status: str
    personality: str
    conclusion: str
    verdict: str
    branches_taken: int
    evidence_collected: int
    worse_clicks: int


class GameResponse(BaseModel):
    state: GameState
    report: Report | None = None