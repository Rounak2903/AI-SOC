from dotenv import load_dotenv
import os
from google import genai

load_dotenv()

client = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY")
)

import json
from pathlib import Path

from prompt import SYSTEM_PROMPT, build_investigation_prompt

load_dotenv()



def load_events(file_path="data/raw/events.jsonl"):
    path = Path(file_path)

    if not path.exists():
        raise FileNotFoundError(f"Event file not found: {file_path}")

    events = []

    with path.open("r", encoding="utf-8") as file:
        for line in file:
            if line.strip():
                events.append(json.loads(line))

    return events


def resolve_evidence(incident, events):
    evidence_ids = set(incident.get("evidence", []))

    return [
        event
        for event in events
        if event.get("event_id") in evidence_ids
    ]


def prepare_investigation(incident, events):
    evidence_events = resolve_evidence(incident, events)

    return {
        "incident": incident,
        "evidence_events": evidence_events,
    }

def run_ai_investigation(investigation):
    prompt = build_investigation_prompt(investigation)

    response = client.interactions.create(
    model="gemini-3.5-flash",
    input=prompt,
    system_instruction=SYSTEM_PROMPT
)

    return response.output_text

    return response.text

if __name__ == "__main__":
    events = load_events()

    sample_incident = {
        "incident_id": "inc_demo_001",
        "incident_type": "POTENTIAL_ACCOUNT_COMPROMISE",
        "severity": "critical",
        "status": "open",
        "evidence": [
            events[0]["event_id"],
            events[1]["event_id"],
            events[2]["event_id"],
            events[3]["event_id"],
        ],
        "alerts": [
            "alert_ssh_bruteforce_001",
            "alert_suspicious_sudo_001",
        ],
        "summary": (
            "Multiple failed login attempts were followed by "
            "a successful login and suspicious sudo activity."
        ),
    }

    investigation = prepare_investigation(
        sample_incident,
        events
    )

    print("\n--- INVESTIGATION CONTEXT ---")
    print(json.dumps(investigation, indent=2))

    print("\n--- INVESTIGATION PROMPT ---")
    print(build_investigation_prompt(investigation))

    print("\n--- AI INVESTIGATION ---")

ai_report = run_ai_investigation(investigation)

print(ai_report)