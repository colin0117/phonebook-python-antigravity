"""
Module for fetching interesting historical facts and star sign details
for any Date of Birth, pulling from the Wikimedia On-This-Day REST API
with robust offline fallback and caching.
"""

import json
import logging
import urllib.error
import urllib.request
from datetime import datetime
from typing import Any, Dict, List, Optional

logger = logging.getLogger(__name__)

# In-memory cache for API results: (month, day) -> list of fact dicts
_FACTS_CACHE: Dict[tuple, List[Dict[str, Any]]] = {}

# Comprehensive Star Sign definitions
STAR_SIGNS = [
    ((1, 20), (2, 18), "Aquarius", "♒", "Jan 20 – Feb 18", "Visionary, independent, innovative, and humanitarian with an original perspective."),
    ((2, 19), (3, 20), "Pisces", "♓", "Feb 19 – Mar 20", "Imaginative, deeply empathetic, intuitive, and gifted with artistic sensibilities."),
    ((3, 21), (4, 19), "Aries", "♈", "Mar 21 – Apr 19", "Bold, ambitious, energetic, and a courageous pioneer who loves taking initiative."),
    ((4, 20), (5, 20), "Taurus", "♉", "Apr 20 – May 20", "Grounded, reliable, patient, devoted, and appreciative of beauty and craftsmanship."),
    ((5, 21), (6, 20), "Gemini", "♊", "May 21 – Jun 20", "Expressive, quick-witted, intellectually curious, and endlessly adaptable."),
    ((6, 21), (7, 22), "Cancer", "♋", "Jun 21 – Jul 22", "Intuitive, nurturing, fiercely loyal, and protective of family and friends."),
    ((7, 23), (8, 22), "Leo", "♌", "Jul 23 – Aug 22", "Confident, charismatic, generous, and a natural warm-hearted leader."),
    ((8, 23), (9, 22), "Virgo", "♍", "Aug 23 – Sep 22", "Analytical, practical, detail-oriented, and dedicated to excellence and helpfulness."),
    ((9, 23), (10, 22), "Libra", "♎", "Sep 23 – Oct 22", "Diplomatic, gracious, fair-minded, charming, and a champion of balance and peace."),
    ((10, 23), (11, 21), "Scorpio", "♏", "Oct 23 – Nov 21", "Passionate, resourceful, perceptive, determined, and deeply loyal once trust is earned."),
    ((11, 22), (12, 21), "Sagittarius", "♐", "Nov 22 – Dec 21", "Optimistic, adventurous, generous, and driven by a philosophical quest for knowledge."),
]

# Curated offline fallback facts by (month, day) with multiple facts per date
OFFLINE_FACTS = {
    (1, 1): [
        {"year": 1863, "text": "Abraham Lincoln issued the Emancipation Proclamation.", "type": "event"},
        {"year": 1892, "text": "Ellis Island opened to begin processing immigrants to the United States.", "type": "event"},
        {"year": 1902, "text": "The first American college football bowl game, the Rose Bowl, was played in Pasadena.", "type": "event"}
    ],
    (1, 8): [
        {"year": 1942, "text": "Theoretical physicist and cosmologist Stephen Hawking was born in Oxford.", "type": "birth"},
        {"year": 1642, "text": "Astronomer Galileo Galilei passed away, exactly 300 years before Stephen Hawking was born.", "type": "event"},
        {"year": 1935, "text": "Rock and roll pioneer Elvis Presley was born in Tupelo, Mississippi.", "type": "birth"}
    ],
    (1, 15): [
        {"year": 1929, "text": "Civil rights leader and Nobel Peace Prize laureate Martin Luther King Jr. was born in Atlanta.", "type": "birth"},
        {"year": 2001, "text": "Wikipedia, the free multilingual collaborative online encyclopedia, was officially launched.", "type": "event"}
    ],
    (2, 11): [
        {"year": 1847, "text": "Thomas Edison, prolific inventor with 1,093 patents, was born in Milan, Ohio.", "type": "birth"},
        {"year": 1990, "text": "Anti-apartheid leader Nelson Mandela was released from Victor Verster Prison after 27 years.", "type": "event"}
    ],
    (2, 12): [
        {"year": 1809, "text": "Both Abraham Lincoln and Charles Darwin were born on this exact same day.", "type": "birth"},
        {"year": 1912, "text": "The last Emperor of China, Puyi, abdicated, marking the end of the Qing dynasty and imperial rule.", "type": "event"}
    ],
    (2, 15): [
        {"year": 1564, "text": "Galileo Galilei, the father of modern observational astronomy, was born in Pisa, Italy.", "type": "birth"},
        {"year": 1965, "text": "The red and white maple leaf design was officially inaugurated as the national flag of Canada.", "type": "event"}
    ],
    (3, 3): [
        {"year": 1847, "text": "Alexander Graham Bell, inventor of the telephone, was born in Edinburgh, Scotland.", "type": "birth"},
        {"year": 1923, "text": "TIME magazine published its very first issue.", "type": "event"}
    ],
    (3, 14): [
        {"year": 1879, "text": "Albert Einstein was born in Ulm, Germany; this date is also celebrated worldwide as Pi Day (3/14).", "type": "birth"},
        {"year": 1794, "text": "Eli Whitney received a patent for the cotton gin, revolutionizing American agriculture.", "type": "event"}
    ],
    (4, 12): [
        {"year": 1961, "text": "Yuri Gagarin became the first human in outer space aboard the Soviet Vostok 1 spacecraft.", "type": "event"},
        {"year": 1981, "text": "NASA launched STS-1 aboard Columbia, the first flight of the Space Shuttle program.", "type": "event"}
    ],
    (4, 15): [
        {"year": 1452, "text": "Leonardo da Vinci, master painter, engineer, and High Renaissance polymath, was born.", "type": "birth"},
        {"year": 1912, "text": "The British ocean liner RMS Titanic sank in the North Atlantic Ocean.", "type": "event"}
    ],
    (4, 25): [
        {"year": 1953, "text": "Francis Crick and James Watson published the double-helix structure of DNA in Nature.", "type": "event"},
        {"year": 1990, "text": "The Hubble Space Telescope was deployed into orbit from Space Shuttle Discovery.", "type": "event"}
    ],
    (5, 15): [
        {"year": 1940, "text": "The first McDonald's restaurant opened in San Bernardino, California.", "type": "event"},
        {"year": 1928, "text": "Mickey Mouse and Minnie Mouse made their first appearance in the silent cartoon Plane Crazy.", "type": "event"}
    ],
    (5, 20): [
        {"year": 1927, "text": "Charles Lindbergh took off from New York on the first solo nonstop transatlantic flight.", "type": "event"},
        {"year": 1932, "text": "Amelia Earhart took off from Newfoundland, becoming the first woman to fly solo across the Atlantic.", "type": "event"}
    ],
    (6, 23): [
        {"year": 1912, "text": "Alan Turing, father of modern computer science and artificial intelligence, was born.", "type": "birth"},
        {"year": 2016, "text": "Citizens of the United Kingdom voted in favour of leaving the European Union in the Brexit referendum.", "type": "event"},
        {"year": 1991, "text": "The first Sonic the Hedgehog video game was released in North America, launching an iconic franchise.", "type": "event"},
        {"year": 1868, "text": "Christopher Latham Sholes received a patent for the Type-Writer with the QWERTY keyboard layout.", "type": "event"}
    ],
    (7, 4): [
        {"year": 1776, "text": "The United States Declaration of Independence was adopted by the Second Continental Congress.", "type": "event"},
        {"year": 2012, "text": "CERN scientists announced the discovery of the Higgs boson particle at the Large Hadron Collider.", "type": "event"}
    ],
    (7, 20): [
        {"year": 1969, "text": "Apollo 11 landed on the Moon, and Neil Armstrong took 'one giant leap for mankind'.", "type": "event"},
        {"year": 1976, "text": "The American Viking 1 spacecraft touched down on Mars, transmitting the first close-up surface images.", "type": "event"},
        {"year": 1919, "text": "Sir Edmund Hillary, mountaineer and explorer who first summited Mount Everest, was born.", "type": "birth"},
        {"year": 1304, "text": "Italian Renaissance scholar and poet Petrarch, Father of Humanism, was born in Arezzo.", "type": "birth"}
    ],
    (8, 17): [
        {"year": 1936, "text": "Margaret Hamilton, lead software engineer for NASA's Apollo guidance computer software, was born.", "type": "birth"},
        {"year": 1978, "text": "Double Eagle II completed the first transatlantic balloon crossing.", "type": "event"}
    ],
    (8, 26): [
        {"year": 1918, "text": "Katherine Johnson, pioneering NASA mathematician whose trajectory calculations guided Apollo 11, was born.", "type": "birth"},
        {"year": 1920, "text": "The 19th Amendment to the United States Constitution took effect, guaranteeing women the right to vote.", "type": "event"}
    ],
    (9, 12): [
        {"year": 1962, "text": "President John F. Kennedy delivered his historic 'We choose to go to the Moon' speech at Rice University.", "type": "event"},
        {"year": 1958, "text": "Jack Kilby demonstrated the first working integrated circuit (microchip) at Texas Instruments.", "type": "event"}
    ],
    (9, 26): [
        {"year": 1983, "text": "Stanislav Petrov averted a global nuclear exchange by identifying a Soviet missile alarm as a false alert.", "type": "event"},
        {"year": 1960, "text": "The first televised United States presidential debate took place between John F. Kennedy and Richard Nixon.", "type": "event"}
    ],
    (10, 4): [
        {"year": 1957, "text": "Sputnik 1 was launched by the Soviet Union, opening the Space Age.", "type": "event"},
        {"year": 1582, "text": "Pope Gregory XIII introduced the Gregorian calendar, replacing the Julian calendar.", "type": "event"}
    ],
    (11, 7): [
        {"year": 1867, "text": "Marie Curie, the only person to win Nobel Prizes in two different sciences (Physics & Chemistry), was born.", "type": "birth"},
        {"year": 1913, "text": "Albert Camus, Nobel laureate author and philosopher, was born in French Algeria.", "type": "birth"}
    ],
    (12, 9): [
        {"year": 1906, "text": "Rear Admiral Grace Hopper, computing pioneer who developed the first compiler, was born.", "type": "birth"},
        {"year": 1968, "text": "Douglas Engelbart presented 'The Mother of All Demos', showcasing the computer mouse, hypertext, and GUI.", "type": "event"}
    ],
    (12, 10): [
        {"year": 1815, "text": "Ada Lovelace, English mathematician widely recognized as the world's first computer programmer, was born.", "type": "birth"},
        {"year": 1901, "text": "The first Nobel Prizes were awarded in Stockholm, Sweden.", "type": "event"},
        {"year": 1948, "text": "The United Nations General Assembly adopted the Universal Declaration of Human Rights in Paris.", "type": "event"}
    ],
    (12, 17): [
        {"year": 1903, "text": "Orville and Wilbur Wright completed the first successful powered heavier-than-air flight at Kitty Hawk.", "type": "event"},
        {"year": 1770, "text": "Ludwig van Beethoven was baptized in Bonn, Germany (widely accepted birth date: Dec 16 or 17).", "type": "birth"}
    ],
    (12, 25): [
        {"year": 1642, "text": "Sir Isaac Newton, physicist and mathematician who formulated the laws of motion and gravitation, was born.", "type": "birth"},
        {"year": 2021, "text": "NASA launched the James Webb Space Telescope aboard an Ariane 5 rocket from French Guiana.", "type": "event"}
    ]
}


def get_star_sign(month: int, day: int) -> Dict[str, str]:
    """Returns astrological star sign details for given month and day."""
    for start, end, sign, symbol, date_range, traits in STAR_SIGNS:
        if (month, day) >= start and (month, day) <= end:
            return {
                "sign": sign,
                "symbol": symbol,
                "date_range": date_range,
                "traits": traits,
                "formatted": f"{sign} {symbol} ({date_range}) — {traits}"
            }
    # Capricorn wraps around Dec 22 – Jan 19
    return {
        "sign": "Capricorn",
        "symbol": "♑",
        "date_range": "Dec 22 – Jan 19",
        "traits": "Disciplined, ambitious, patient, strategic, and remarkably resilient.",
        "formatted": "Capricorn ♑ (Dec 22 – Jan 19) — Disciplined, ambitious, patient, and resilient."
    }


def fetch_facts_from_web(month: int, day: int) -> List[Dict[str, Any]]:
    """
    Fetches historical facts and famous birthdays from the Wikipedia On This Day API.
    Falls back gracefully to offline facts if network is down or times out.
    """
    cache_key = (month, day)
    if cache_key in _FACTS_CACHE:
        return _FACTS_CACHE[cache_key]

    facts: List[Dict[str, Any]] = []

    # 1. Attempt to fetch curated 'selected' events from Wikipedia REST API (fast & concise)
    try:
        url = f"https://en.wikipedia.org/api/rest_v1/feed/onthisday/selected/{month:02d}/{day:02d}"
        headers = {"User-Agent": "PhoneBookApp/2.0 (contact@example.org; automated testing)"}
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=2.5) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            for item in data.get("selected", []):
                year = item.get("year")
                text = item.get("text", "").strip()
                if year and text:
                    facts.append({
                        "year": year,
                        "text": text,
                        "type": "event",
                        "formatted": f"In {year}: {text}"
                    })
    except Exception as exc:
        logger.info(f"Wikipedia selected API call finished/timed out ({exc}). Merging curated records.")

    # 2. Add or merge offline facts
    offline_items = OFFLINE_FACTS.get((month, day), [])
    for off in offline_items:
        if not any(off["text"] in f["text"] for f in facts):
            prefix = "Born in" if off["type"] == "birth" else "In"
            facts.insert(0, {
                "year": off["year"],
                "text": off["text"],
                "type": off["type"],
                "formatted": f"{prefix} {off['year']}: {off['text']}"
            })

    # 3. If still fewer than 2 facts, add seasonal / astronomical trivia
    if len(facts) < 2:
        dt = datetime(2024, month, day)
        day_of_year = dt.timetuple().tm_yday
        month_name = dt.strftime("%B")
        sign = get_star_sign(month, day)
        facts.append({
            "year": None,
            "text": f"{month_name} {day} is Day {day_of_year} of the year.",
            "type": "calendar",
            "formatted": f"Calendar Milestone: {month_name} {day} is Day {day_of_year} of the year."
        })
        facts.append({
            "year": None,
            "text": f"Astrological placement: Under the influence of {sign['sign']} ({sign['symbol']}).",
            "type": "zodiac",
            "formatted": f"Astrological Fact: Guided by {sign['sign']} {sign['symbol']} — {sign['traits']}"
        })

    _FACTS_CACHE[cache_key] = facts
    return facts


def get_dob_details(dob_str: Optional[str]) -> Optional[Dict[str, Any]]:
    """
    Returns full details for a Date of Birth:
    - star sign (name, symbol, dates, traits)
    - list of historical facts pulled from the web
    - primary fact
    """
    if not dob_str:
        return None

    try:
        dt = datetime.strptime(dob_str.strip(), "%Y-%m-%d")
        month = dt.month
        day = dt.day
        year = dt.year
    except (ValueError, AttributeError):
        return None

    star_sign = get_star_sign(month, day)
    facts = fetch_facts_from_web(month, day)
    primary_fact = facts[0]["formatted"] if facts else "A wonderful day in history!"

    return {
        "dob": dob_str.strip(),
        "year": year,
        "month": month,
        "day": day,
        "star_sign": star_sign,
        "facts": facts,
        "primary_fact": primary_fact,
        "total_facts": len(facts)
    }


def get_dob_fact(dob_str: Optional[str]) -> Optional[str]:
    """Compatibility wrapper returning formatted primary fact string."""
    details = get_dob_details(dob_str)
    if not details:
        return None
    return f"🎉 Fun Date Fact: {details['primary_fact']}"
