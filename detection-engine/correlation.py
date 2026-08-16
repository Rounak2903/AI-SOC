from datetime import datetime


def correlate_incident(events, alerts):
    failed_logins = [
        event
        for event in events
        if event.get("event_type") == "authentication"
        and event.get("action") == "login_failed"
    ]

    successful_logins = [
        event
        for event in events
        if event.get("event_type") == "authentication"
        and event.get("action") == "login_success"
    ]

    sudo_events = [
        event
        for event in events
        if event.get("event_type") == "authorization"
        and event.get("action") == "sudo_command"
    ]

    brute_force_alert = any(
        alert.get("alert_type") == "SSH_BRUTE_FORCE"
        for alert in alerts
    )

    suspicious_sudo_alert = any(
        alert.get("alert_type") == "SUSPICIOUS_SUDO_ACTIVITY"
        for alert in alerts
    )

    if (
        brute_force_alert
        and successful_logins
        and suspicious_sudo_alert
    ):
        evidence = []

        evidence.extend(
            event["event_id"] for event in failed_logins
        )

        evidence.extend(
            event["event_id"] for event in successful_logins
        )

        evidence.extend(
            event["event_id"] for event in sudo_events
        )

        incident = {
            "incident_id": f"inc_{datetime.now().strftime('%Y%m%d%H%M%S')}",
            "incident_type": "POTENTIAL_ACCOUNT_COMPROMISE",
            "severity": "critical",
            "status": "open",
            "evidence": evidence,
            "alerts": [
                alert["alert_id"]
                for alert in alerts
            ],
            "summary": (
                "Multiple failed login attempts were followed by "
                "a successful login and suspicious sudo activity."
            ),
        }

        return incident

    return None
if __name__ == "__main__":
    import json
    from pathlib import Path

    from rules import (
        load_events,
        detect_ssh_brute_force,
        detect_suspicious_sudo,
    )

    events = load_events()

    alerts = []
    alerts.extend(detect_ssh_brute_force(events))
    alerts.extend(detect_suspicious_sudo(events))

    incident = correlate_incident(events, alerts)

    if incident:
        print("Incident generated:")
        print(json.dumps(incident, indent=2))
    else:
        print("No correlated incident detected.")