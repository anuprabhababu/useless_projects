import random

SCENARIOS = [
    "My friend replied 'k' instead of 'okay'.",
    "They saw my message but did not reply.",
    "My professor said 'interesting'.",
    "Someone liked an old Instagram post.",
    "A coworker ended their message with a period.",
    "Someone walked past me without saying hi.",
]

def random_scenario() -> dict[str, str]:
    return {"situation": random.choice(SCENARIOS)}
