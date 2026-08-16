import json
import uuid
from datetime import datetime, timezone
from pathlib import Path


def create_security_event(
    event_type,
    action,
    username=None,
    source_ip=None,
    hostname=None,
    severity="medium",
    metadata=None,
):
    return {
        "event_id": f"evt_{uuid.uuid4()}",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "source": "linux",
        "event_type": event_type,
        "action": action,
        "username": username,
        "source_ip": source_ip,
        "hostname": hostname,
        "severity": severity,
        "metadata": metadata or {},
    }


def save_event(event, output_file="data/raw/events.jsonl"):
    output_path = Path(output_file)
    output_path.parent.mkdir(parents=True, exist_ok=True)

    with output_path.open("a", encoding="utf-8") as file:
        file.write(json.dumps(event) + "\n")


if __name__ == "__main__":
    events = [
        create_security_event(
            event_type="authentication",
            action="login_failed",
            username="root",
            source_ip="192.168.1.10",
            hostname="server-01",
            severity="medium",
            metadata={"service": "ssh"},
        ),
        create_security_event(
            event_type="authentication",
            action="login_failed",
            username="admin",
            source_ip="192.168.1.10",
            hostname="server-01",
            severity="medium",
            metadata={"service": "ssh"},
        ),
        create_security_event(
            event_type="authentication",
            action="login_success",
            username="admin",
            source_ip="192.168.1.10",
            hostname="server-01",
            severity="low",
            metadata={"service": "ssh"},
        ),
        create_security_event(
            event_type="authorization",
            action="sudo_command",
            username="admin",
            hostname="server-01",
            severity="high",
            metadata={"command": "systemctl restart ssh"},
        ),
    ]

    output_file = "data/raw/events.jsonl"

    # Start with a clean dataset
    Path(output_file).unlink(missing_ok=True)

    for event in events:
        save_event(event, output_file)

    print(f"Collected {len(events)} security events.")
    print(f"Saved to {output_file}")