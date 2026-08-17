from fastapi import APIRouter

router = APIRouter(prefix="/api/alerts", tags=["Alerts"])


@router.get("/")
def get_alerts():
    return [
        {
            "alert_id": "ALT-1042",
            "alert_type": "Brute Force Login",
            "severity": "Critical",
            "source_ip": "192.168.1.14"
        },
        {
            "alert_id": "ALT-1041",
            "alert_type": "Port Scan",
            "severity": "High",
            "source_ip": "10.0.0.55"
        },
        {
            "alert_id": "ALT-1040",
            "alert_type": "Malware Signature Match",
            "severity": "Critical",
            "source_ip": "172.16.4.21"
        }
    ]