from fastapi import APIRouter

router = APIRouter(prefix="/api/events", tags=["Events"])


@router.get("/")
def get_events():
    return {
        "totalEvents": 18542,
        "activeAlerts": 37,
        "criticalIncidents": 4,
        "severity": {
            "critical": 4,
            "high": 12,
            "medium": 26,
            "low": 51
        }
    }