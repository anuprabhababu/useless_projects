from app.models.game import GameState

STATUS_BANDS = (
    (20, "🧘 Completely Chill"),
    (40, "🤔 Slightly Suspicious"),
    (60, "👀 Something's Up"),
    (80, "🕵️ Detective Mode"),
    (95, "🤡 Delusional"),
    (100, "💀 COMPLETELY COOKED"),
)

BRANCH_POINTS = {
    "chill": 0,
    "suspicious": 7,
    "worst_case": 15,
}

EVIDENCE_POINTS = {
    "fact": 1,
    "assumption": 3,
    "delusion": 6,
}


def refresh_score(state: GameState) -> GameState:
    score = (state.current_level - 1) * 10
    score += sum(BRANCH_POINTS[branch] for branch in state.selected_branches)
    score += state.worse_clicks * 10
    score += min(sum(EVIDENCE_POINTS[item.kind] for item in state.evidence), 18)

    state.score = min(score, 100)
    state.status = next(label for maximum, label in STATUS_BANDS if state.score <= maximum)

    return state