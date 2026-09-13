import asyncio
import json
import os

from app.models.game import GameState, Interpretation

VOICE = {
    "detective": "a playful detective documenting clues on a corkboard",
    "delulu": "a playful narrator becoming increasingly obviously absurd",
    "optimist": "a reassuring friend who still treats the game theatrically",
}


def fallback_content(state: GameState, trigger: str):
    latest_evidence = (
        state.evidence[-1].text
        if state.evidence
        else "the completely ordinary silence"
    )

    content = {
        "detective": (
            f"Case-file update: '{latest_evidence}' has been highlighted in yellow marker.",
            "This proves nothing, but the imaginary corkboard is interested.",
        ),
        "delulu": (
            "This is probably normal. Which is exactly the cover story a normal situation would use.",
            "A tiny fictional conspiracy has entered the chat wearing sunglasses.",
        ),
        "optimist": (
            "Alternative theory: they could be busy, tired, or fighting a printer.",
            "The benefit of the doubt has requested a comfy chair and a snack.",
        ),
    }

    thought, explanation = content[state.mode]

    if trigger == "worse":
        thought += " The plot has thickened by exactly one millimetre."

    return thought, explanation


async def generate_content(state: GameState, trigger: str):
    if not os.getenv("OPENAI_API_KEY"):
        return fallback_content(state, trigger)

    prompt = f"""
Write JSON with keys "thought" and "explanation" for Overthink,
an entertainment-only overthinking game.

Situation: {state.situation}
Mode: {VOICE[state.mode]}
Level: {state.current_level} of 5
Trigger: {trigger}
Evidence: {[f"{item.kind}: {item.text}" for item in state.evidence]}
Recent choices: {state.selected_branches[-3:]}

Use one short funny sentence for each key.
Clearly show uncertainty.
Never diagnose, accuse, recommend surveillance, or state speculation as fact.
"""

    def call_openai():
        from openai import OpenAI

        client = OpenAI()

        response = client.responses.create(
            model=os.getenv("OPENAI_MODEL", "gpt-5-mini"),
            input=prompt,
            text={"format": {"type": "json_object"}},
            max_output_tokens=160,
        )

        result = json.loads(response.output_text)
        return result["thought"], result["explanation"]

    try:
        return await asyncio.to_thread(call_openai)
    except Exception:
        return fallback_content(state, trigger)


def interpretations():
    return [
        Interpretation(
            label="🟢 Probably nothing",
            tone="chill",
            description="Take the calm route.",
        ),
        Interpretation(
            label="🟡 Something feels off",
            tone="suspicious",
            description="Add a little dramatic doubt.",
        ),
        Interpretation(
            label="🔴 Something is definitely wrong",
            tone="worst_case",
            description="Escalate with confidence and no evidence.",
        ),
    ]