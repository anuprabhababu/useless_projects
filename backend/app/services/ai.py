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
            f"Maybe I'm overthinking this... there's probably a perfectly normal reason for this.",
            f"Okay, but this could still be completely harmless. Why am I analyzing every tiny detail?",
            f"Wait, am I turning one tiny thing into an entire story in my head?",
            f"Let's be honest, I have absolutely no proof that anything is wrong.",
            f"I have somehow investigated this for five stages and the evidence still says: probably nothing."
        ]

    elif mode == "delulu":
        thoughts = [
            f"Wait... okay, but what if this actually means something?",
            f"Hold on. That tiny detail is suddenly looking VERY suspicious.",
            f"Okay, there are officially too many coincidences for my liking.",
            f"I need to investigate this immediately. Who else noticed this?",
            f"This has gone way beyond a normal situation. I have constructed an entire conspiracy."
        ]

    else:  # detective
        thoughts = [
            f"Wait... why did that happen? Is there something I'm missing?",
            f"Okay, but that detail feels a little strange. Why exactly did they do that?",
            f"Hold on... that changes things. Could there be a reason behind it?",
            f"Now I'm noticing a pattern, and I don't know if I'm imagining it.",
            f"Okay, I need answers. What if all these tiny details are connected?"
        ]

    thought = thoughts[min(level - 1, 4)]

    if trigger == "worse":
        thought = (
            f"Wait... what if there's MORE to this than I initially thought?"
        )

    elif trigger == "evidence":
        thought = (
            f"Okay, this new piece of evidence changes the way I'm looking at this."
        )

    explanation = (
        f"The situation is: \"{situation}\". "
        "There is still no proof that anything is actually wrong, "
        "but that has never stopped an overthinking brain."
    )

    return thought, explanation
    """
    Fallback used when OpenAI is unavailable.

    This is still situation-aware: the response uses the
    user's actual situation instead of returning a generic sentence.
    """

    situation = state.situation
    mode = state.mode

    if mode == "optimist":
        responses = [
            (
                f'"{situation}" is probably much less serious than it feels.',
                "There is a perfectly normal explanation hiding somewhere. "
                "Your brain just skipped directly to the dramatic version."
            ),
            (
                f'Let us examine "{situation}" calmly.',
                "Nothing here proves that anything is wrong. "
                "Your brain may simply be filling in the blanks."
            ),
            (
                f'The evidence around "{situation}" is surprisingly calm.',
                "Before assuming the worst, remember that people are "
                "usually busy, distracted, or simply being people."
            ),
        ]

    elif mode == "delulu":
        responses = [
            (
                f'"{situation}"? This is definitely suspicious.',
                "Probably not. But if we dramatically connect enough unrelated "
                "events, we can build a theory with absolutely no evidence."
            ),
            (
                f'I have investigated "{situation}" and things are getting dramatic.',
                "There may be a completely normal explanation, but where is "
                "the fun in stopping there?"
            ),
            (
                f'"{situation}" has entered the conspiracy department.',
                "We currently have almost no evidence, which makes this "
                "the perfect time to develop a completely unnecessary theory."
            ),
        ]

    else:
        responses = [
            (
                f'I am investigating: "{situation}"',
                "There may be something behind this, or your brain may be "
                "turning one tiny detail into a full investigation."
            ),
            (
                f'"{situation}" — noted. That detail goes into the case file.',
                "It is not proof of anything yet, but it is exactly the kind "
                "of tiny detail an overthinking detective would notice."
            ),
            (
                f'The case surrounding "{situation}" has officially begun.',
                "We have one observation and several possible explanations. "
                "Unfortunately, your brain wants the most interesting one."
            ),
        ]

    # Change the fallback depending on what the player just did.
    if trigger == "worse":
        if mode == "delulu":
            return (
                f'We made "{situation}" significantly more suspicious.',
                "Did the situation actually get worse? Probably not. "
                "Did our imagination get worse? Absolutely."
            )

        return (
            f'After making "{situation}" worse, we have another possibility.',
            "There is still no proof that anything is wrong, "
            "but we have successfully created another reason to overthink it."
        )

    if trigger == "evidence":
        return (
            f'New evidence has been added to the case: "{situation}".',
            "Evidence is useful, but one small detail does not automatically "
            "confirm the theory your brain has created."
        )
        index = min(state.current_level - 1, len(responses) - 1)
        return responses[index]


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