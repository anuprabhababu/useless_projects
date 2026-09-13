import asyncio
import json
import os

from app.models.game import Interpretation


# Different personalities for the three supported modes.
VOICE = {
    "optimist": {
        "name": "Optimist",
        "instruction": (
            "Be reassuring and look for harmless explanations first, "
            "while still being funny."
        ),
    },
    "detective": {
        "name": "Detective",
        "instruction": (
            "Analyze tiny details like a dramatic detective. "
            "Point out suspicious possibilities, but make it clear "
            "that they are only possibilities."
        ),
    },
    "delulu": {
        "name": "Delulu",
        "instruction": (
            "Be hilariously overdramatic and imaginative. "
            "Turn ordinary details into ridiculous theories, "
            "without presenting fiction as fact."
        ),
    },
}


def fallback_content(state, trigger):
    situation = state.situation
    level = state.current_level
    mode = state.mode

    if mode == "optimist":
        thoughts = [
            f"Maybe there's actually a completely normal reason for this. Why am I worrying already?",
            f"Okay, but this could still mean absolutely nothing. People do random things all the time.",
            f"Wait... am I seriously turning one tiny detail into a whole story?",
            f"I need to stop and think. Do I actually have any evidence that something is wrong?",
            f"I have somehow spent five stages investigating this and still have absolutely no proof. Maybe I should go outside."
        ]

    elif mode == "delulu":
        thoughts = [
            f"Wait... okay, that tiny detail might actually mean something.",
            f"Hold on. Why would that happen specifically? That's a little too convenient.",
            f"Okay, now I'm noticing a pattern... and I don't think it's a coincidence.",
            f"I need to investigate this properly. There has to be something I'm not being told.",
            f"Okay, this has officially become a conspiracy. I've connected everything and somehow it all makes sense."
        ]

    else:  # detective
        thoughts = [
            f"Wait... why did that happen? Is there something I'm missing?",
            f"Okay, that detail is a little strange. Why exactly did they do that?",
            f"Hold on... if I compare that with what happened earlier, could there be a pattern?",
            f"Okay, I need more information. When did this happen, and what else was going on at the time?",
            f"I have officially started investigating something that probably isn't even a problem. But now I NEED answers."
        ]

    # Select thought based on current level.
    thought = thoughts[min(level - 1, 4)]

    # If the player clicked "Make It Worse",
    # keep the level-specific thought instead of replacing it
    # with the same sentence every time.
    if trigger == "worse":
        if level == 2:
            thought = thoughts[1]
        elif level == 3:
            thought = thoughts[2]
        elif level == 4:
            thought = thoughts[3]
        elif level == 5:
            thought = thoughts[4]

    # Evidence should also produce a level-appropriate reaction.
    elif trigger == "evidence":
        if level <= 2:
            thought = (
                f"Wait... this new detail might actually explain something. "
                f"Or maybe I'm just looking for a reason to overthink it."
            )
        elif level == 3:
            thought = (
                f"Okay, that new detail is interesting. "
                f"Does it actually connect to what I noticed before?"
            )
        elif level == 4:
            thought = (
                f"Hold on... this changes the investigation. "
                f"If this detail is relevant, what else have I missed?"
            )
        else:
            thought = (
                f"Okay, this is getting ridiculous. "
                f"I now have enough imaginary evidence to build an entire theory."
            )

    explanation = (
        f'The situation is: "{situation}". '
        f"At level {level}, the interpretation becomes more elaborate, "
        "even though there may still be a completely normal explanation."
    )

    return thought, explanation

async def generate_content(state, trigger):
    """
    Generate an AI thought based on the complete current game state.
    """

    api_key = os.getenv("OPENAI_API_KEY")

    # If no API key exists, use our situation-aware fallback.
    if not api_key:
        return fallback_content(state, trigger)

    voice = VOICE.get(
        state.mode,
        VOICE["detective"],
    )

    previous_thoughts = "\n".join(
        f"- Stage {stage.level}: {stage.thought}"
        for stage in state.stages
    )

    evidence = "\n".join(
        f"- [{item.kind}] {item.text}"
        for item in state.evidence
    )

    branches = ", ".join(state.selected_branches)

    prompt = f"""
You are the AI narrator for "Overthink", an entertainment-only
overthinking game.

The player has entered this situation:

"{state.situation}"

The player's selected mode is:
{voice["name"]}

Mode instructions:
{voice["instruction"]}

Current game information:
- Current level: {state.current_level}/5
- Current score: {state.score}/100
- Status: {state.status}
- Times they clicked "Make It Worse": {state.worse_clicks}
- Branches selected: {branches or "None"}
- Evidence:
{evidence or "None"}

Previous thoughts:
{previous_thoughts or "None"}

The player just performed this action:
{trigger}

IMPORTANT:
If the action is "worse", escalate the player's INNER MONOLOGUE.
Do not merely say that the situation became worse.

If the action is "evidence", react specifically to the new evidence
and let the thought incorporate what that evidence might mean.

Generate an INTERNAL OVERTHINKING THOUGHT, followed by a short explanation.

Requirements:

1. The "thought" must sound like an actual thought happening inside
   the player's head, NOT a summary of the situation.

2. Write the thought in a conversational, emotional, slightly chaotic
   inner-monologue style.

3. The thought should react to a SPECIFIC detail in the user's situation.

4. The thought can ask questions such as:
   "Why would they do that?"
   "Wait... why did that happen?"
   "Okay, but what if...?"
   "Am I reading too much into this?"

5. The thought should feel like something a person would actually think,
   not something a narrator or analyst would say.

6. Do NOT start the thought with phrases like:
   "The situation..."
   "This situation..."
   "After making..."
   "The evidence..."
   "This means..."
   "Based on..."

7. Do NOT simply repeat or paraphrase the user's situation.

8. The explanation should briefly justify why the thought is interesting
   while acknowledging that the interpretation may be completely wrong.

9. Make the response entertaining and progressively more dramatic
   depending on the game level.

10. Stay consistent with the selected mode.

11. Never present an imagined theory as a confirmed fact.

12. Return ONLY valid JSON.

Required JSON format:
{
    "thought": "an actual internal thought",
    "explanation": "short explanation"
}

"""

    def call_openai():
        from openai import OpenAI

        client = OpenAI(api_key=api_key)

        response = client.responses.create(
            model=os.getenv("OPENAI_MODEL", "gpt-5-mini"),
            input=prompt,
            text={"format": {"type": "json_object"}},
            max_output_tokens=200,
        )

        result = json.loads(response.output_text)

        return (
            result["thought"],
            result["explanation"],
        )

    try:
        return await asyncio.to_thread(call_openai)

    except Exception as error:
        # Do not expose the API key or other secrets.
        print(f"OpenAI request failed: {error}")
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