def fallback_content(state, trigger):
    situation = state.situation
    level = state.current_level
    mode = state.mode

    if mode == "optimist":
        thoughts = [
            f"Maybe there's actually nothing going on. They probably just saw it and kept scrolling.",
            f"Okay, but people don't have to like every story they see. Why am I making one missing like such a big deal?",
            f"Wait... am I seriously treating a missing like as evidence that something is wrong?",
            f"Maybe I should stop investigating this. There are way too many normal explanations.",
            f"I have somehow turned one Instagram interaction into a full investigation, and honestly... there is still no actual evidence."
        ]

    elif mode == "delulu":
        thoughts = [
            f"Wait... they viewed it but didn't like it. Okay, that's interesting.",
            f"Hold on. They definitely had the opportunity to like it, so why didn't they?",
            f"Okay, now I'm noticing a pattern. This cannot possibly be completely random... right?",
            f"I need to know what they were thinking when they saw it. There has to be something behind this.",
            f"Okay, this has officially become a conspiracy. One missing like has somehow turned into an entire theory."
        ]

    else:  # detective
        thoughts = [
            f"Wait... they viewed it but didn't like it. Is there a normal reason for that?",
            f"Okay, but why did they watch it without interacting? That's a tiny detail, but now I'm curious.",
            f"Hold on... do they normally like my stories? If they do, then this might actually be worth noticing.",
            f"I need more information. When did they view it, what else have they interacted with, and does this actually form a pattern?",
            f"Okay, I have officially started collecting evidence from a missing Instagram like. What exactly am I trying to prove here?"
        ]

    thought = thoughts[min(level - 1, 4)]

    if trigger == "evidence":
        thought = (
            f"Wait... this new piece of evidence actually changes how I'm looking at this. "
            f"What if I'm missing something important?"
        )

    explanation = (
        f'The situation is "{situation}". '
        f"At level {level}, the interpretation becomes more elaborate, "
        "even though there may still be a completely normal explanation."
    )

    return thought, explanation