# Nexora Production Guide

Dokumen ini menjelaskan langkah minimum untuk menyiapkan dan memverifikasi Nexora pada environment production.

## Architecture

Nexora menggunakan struktur monorepo:

```text
Browser
  │
  ▼
nexora-console
  │
  ▼
nexora-core
  │
  ▼
PostgreSQL
```
