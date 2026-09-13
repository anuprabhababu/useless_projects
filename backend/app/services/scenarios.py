import random


SCENARIOS = [
    # Messages & texting
    "My friend replied 'k' instead of 'okay'.",
    "They saw my message but did not reply.",
    "They took three hours to reply to my message.",
    "They replied with just a thumbs-up emoji.",
    "They suddenly started replying with shorter messages.",
    "They were typing for a long time and then sent only one word.",
    "They replied immediately yesterday but took hours today.",
    "They read my message and then went offline.",
    "They sent 'sure' instead of 'sure!!'.",
    "They deleted a message before I could read it.",
    "They sent a message and then deleted it.",
    "They ended their message with a period.",
    "They used 'fine' instead of 'okay'.",
    "They didn't reply but posted a story.",
    "They replied to everyone except me in the group chat.",

    # Friends
    "My friend cancelled our plans at the last minute.",
    "My friend made plans but didn't invite me.",
    "My friend suddenly became quiet around me.",
    "My friend laughed at something I said and I don't know why.",
    "My friend said 'we need to talk'.",
    "My friend forgot something I told them yesterday.",
    "My friend started hanging out with a different group.",
    "My friend said they were busy but I saw them online.",
    "My friend didn't react to my new profile picture.",
    "My friend called everyone except me.",

    # College & professors
    "My professor said 'see me after class'.",
    "My professor said my answer was 'interesting'.",
    "My professor looked at me after asking a question.",
    "My professor asked me to submit my work again.",
    "My professor sent a message saying 'Please meet me tomorrow'.",
    "My professor paused before saying my name.",
    "My professor gave me less feedback than usual.",
    "My professor looked serious while checking my assignment.",
    "My professor asked why I was absent.",
    "My professor said 'we'll discuss this later'.",

    # Social media
    "Someone liked one of my really old Instagram posts.",
    "Someone viewed my story but didn't like it.",
    "Someone unfollowed me but still watches my stories.",
    "Someone viewed my story immediately after I posted it.",
    "Someone followed me and then unfollowed me a few minutes later.",
    "Someone removed a like from my old post.",
    "Someone suddenly started liking several of my posts.",
    "Someone posted something that sounded strangely similar to my situation.",
    "Someone saw my story but ignored my message.",
    "Someone changed their profile picture after talking to me.",

    # Relationships & crushes
    "They were online but didn't message me.",
    "They smiled at me and then looked away.",
    "They talked to everyone except me at the party.",
    "They remembered a tiny detail I mentioned weeks ago.",
    "They replied differently when their friends were around.",
    "They suddenly started using more emojis.",
    "They asked who I was hanging out with.",
    "They complimented me and then immediately changed the subject.",
    "They said 'nothing' when I asked what was wrong.",
    "They viewed my profile but didn't follow me.",

    # Work & teammates
    "My teammate didn't respond to my message.",
    "My coworker said 'interesting' after I shared an idea.",
    "My manager asked me to stay back after the meeting.",
    "My teammate changed something I had worked on.",
    "My coworker suddenly became very formal in their messages.",
    "My manager sent a message saying 'Can we talk?'",
    "My teammate didn't mention my contribution during the presentation.",
    "My coworker started using my idea without mentioning me.",
    "My manager looked serious during our meeting.",
    "My teammate left me on read in the group chat.",

    # Everyday situations
    "Someone walked past me without saying hi.",
    "Someone looked at me and then whispered to their friend.",
    "Someone laughed right after I walked into the room.",
    "The person behind me started laughing during a conversation.",
    "Someone called my name and then said 'never mind'.",
    "Someone moved seats after I sat down.",
    "I heard someone mention my name from across the room.",
    "Someone looked at my phone screen while I was using it.",
    "Someone suddenly became quiet when I entered the room.",
    "Someone said 'it's fine' but sounded completely serious.",
]


def random_scenario():
    return {"situation": random.choice(SCENARIOS)}