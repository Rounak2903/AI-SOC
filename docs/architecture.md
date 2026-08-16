# AI-SOC Architecture

## 1. Project Overview

AI-SOC is an AI-powered Security Operations Center designed to collect
security events, detect suspicious activity, identify anomalies,
correlate related events into incidents, and assist security analysts
with AI-powered investigation.

The system combines:

- Security log collection
- Rule-based threat detection
- ML-based anomaly detection
- Incident correlation
- Threat intelligence enrichment
- MITRE ATT&CK mapping
- LLM-based investigation
- RAG-based security knowledge retrieval
- SOC dashboard
- Human-in-the-loop response

---

## 2. High-Level Architecture

```text
                SECURITY SOURCES
                       |
                       v
              +------------------+
              |  Log Collector   |
              +--------+---------+
                       |
                       v
              +------------------+
              | Event Normalizer |
              +--------+---------+
                       |
              +--------+---------+
              |                  |
              v                  v
      +---------------+   +---------------+
      | Rule Detection|   | ML Anomaly    |
      |    Engine     |   |  Detection    |
      +-------+-------+   +-------+-------+
              |                   |
              +---------+---------+
                        |
                        v
              +-------------------+
              | Incident          |
              | Correlation       |
              +---------+---------+
                        |
                        v
              +-------------------+
              | Threat Intel      |
              | Enrichment        |
              +---------+---------+
                        |
                        v
              +-------------------+
              | AI Investigator   |
              | LLM + RAG         |
              +---------+---------+
                        |
              +---------+---------+
              |                   |
              v                   v
       +-------------+     +---------------+
       | MITRE ATT&CK|     | Risk Scoring  |
       +-------------+     +---------------+
              |                   |
              +---------+---------+
                        |
                        v
              +-------------------+
              |   SOC Dashboard   |
              +-------------------+
                        |
                        v
              Human Analyst Review