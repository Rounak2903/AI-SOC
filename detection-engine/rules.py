import json
from collections import defaultdict
from pathlib import Path


def detect_ssh_brute_force(events, threshold=2):
    failed_logins = defaultdict(list)
    alerts = []

    for event in events:
        if (
            event.get("event_type") == "authentication"
            and event.get("action") == "login_failed"
            and event.get("source_ip")
        ):
            failed_logins[event["source_ip"]].append(event)

    for source_ip, failures in failed_logins.items():
        if len(failures) >= threshold:
            alerts.append(
                {
                    "alert_id": f"alert_ssh_bruteforce_{source_ip}",
                    "alert_type": "SSH_BRUTE_FORCE",
                    "severity": "high",
                    "source_ip": source_ip,
                    "evidence": [event["event_id"] for event in failures],
                    "message": (
                        f"{len(failures)} failed SSH login attempts "
                        f"detected from {source_ip}"
                    ),
                }
            )

    return alerts


def detect_suspicious_sudo(events):
    alerts = []

    suspicious_commands = [
        "useradd",
        "usermod",
        "passwd",
        "chmod",
        "chown",
        "systemctl",
        "service",
    ]

    for event in events:
        if (
            event.get("event_type") == "authorization"
            and event.get("action") == "sudo_command"
        ):
            command = event.get("metadata", {}).get("command", "")

            if any(cmd in command for cmd in suspicious_commands):
                alerts.append(
                    {
                        "alert_id": f"alert_suspicious_sudo_{event['event_id']}",
                        "alert_type": "SUSPICIOUS_SUDO_ACTIVITY",
                        "severity": "high",
                        "username": event.get("username"),
                        "hostname": event.get("hostname"),
                        "evidence": [event["event_id"]],
                        "message": (
                            f"Suspicious sudo command detected: {command}"
                        ),
                    }
                )

    return alerts


def load_events(file_path="data/raw/events.jsonl"):
    events = []

    path = Path(file_path)

    if not path.exists():
        raise FileNotFoundError(f"Event file not found: {file_path}")

    with path.open("r", encoding="utf-8") as file:
        for line in file:
            if line.strip():
                events.append(json.loads(line))

    return events


if __name__ == "__main__":
    events = load_events()

    alerts = []

    alerts.extend(detect_ssh_brute_force(events))
    alerts.extend(detect_suspicious_sudo(events))

    print(f"Events analyzed: {len(events)}")
    print(f"Alerts generated: {len(alerts)}")

    for alert in alerts:
        print(json.dumps(alert, indent=2))