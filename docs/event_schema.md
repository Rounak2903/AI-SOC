# Security Event Schema

This document defines the common event format used across AI-SOC.

All log collectors, detection engines, ML pipelines, backend services,
and AI investigation components should follow this schema.

## 1. Event Structure

```json
{
  "event_id": "evt_001",
  "timestamp": "2026-08-16T18:30:00Z",
  "source": "linux",
  "event_type": "authentication",
  "action": "login_failed",
  "username": "root",
  "source_ip": "192.168.1.10",
  "hostname": "server-01",
  "severity": "medium",
  "metadata": {}
}