from app.models.game import EvidenceItem, GameState, Report, Stage
from app.services.ai import generate_content, interpretations
from app.services.scoring import refresh_score

LEVELS = ("Reasonable", "Hmm...", "Suspicious", "Detective", "Unhinged")


async def set_new_thought(state: GameState, trigger: str, branch: str | None = None) -> GameState:
    thought, explanation = await generate_content(state, trigger)
    state.latest_thought = thought
    state.latest_explanation = explanation
    state.interpretations = interpretations()
    state.stages.append(Stage(level=state.current_level, title=LEVELS[state.current_level - 1], thought=thought, branch=branch))
    return refresh_score(state)


async def start_game(situation: str, mode: str) -> GameState:
    state = GameState(situation=situation.strip(), mode=mode, current_level=1)
    return await set_new_thought(state, "start")


async def choose_branch(state: GameState, branch: str) -> GameState:
    if state.finished:
        return state
    state.selected_branches.append(branch)
    jump = 2 if branch == "worst_case" and state.current_level <= 3 else 1
    state.current_level = min(5, state.current_level + jump)
    state.finished = state.current_level == 5
    return await set_new_thought(state, f"branch:{branch}", branch)


async def make_worse(state: GameState) -> GameState:
    if state.finished:
        return state
    state.worse_clicks += 1
    state.current_level = min(5, state.current_level + 1)
    state.finished = state.current_level == 5
    return await set_new_thought(state, "worse")


async def add_evidence(state: GameState, evidence: EvidenceItem) -> GameState:
    state.evidence.append(evidence)
    return await set_new_thought(state, "evidence")


def report_for(state: GameState) -> Report:
    personalities = {
        "detective": "The Digital Detective",
        "delulu": "The Professional Delulu",
        "optimist": "The Chill Witness",
    }
    return Report(
        final_score=state.score,
        status=state.status,
        personality=personalities[state.mode],
        conclusion=(f"You started with {state.situation!r} and opened {len(state.stages)} imaginary investigation tabs."),
        verdict="There is probably nothing wrong. This is an entertainment game, not evidence or a diagnosis.",
        branches_taken=len(state.selected_branches),
        evidence_collected=len(state.evidence),
        worse_clicks=state.worse_clicks,
    )
