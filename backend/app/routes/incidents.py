from fastapi import APIRouter

router = APIRouter(prefix="/api/incidents", tags=["Incidents"])


@router.get("/")
def get_incidents():
    return [
        {
            "incident_id": "INC-1001",
            "incident_type": "Multiple Failed Logins",
            "severity": "Critical",
            "status": "Open"
        },
        {
            "incident_id": "INC-1002",
            "incident_type": "Suspicious Network Activity",
            "severity": "High",
            "status": "Investigating"
        }
    ]