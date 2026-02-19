# AGENT.md — Authentiq CLI for AI Agents

This document explains how to use the Authentiq CLI as an AI agent.

## Overview

The `authentiq` CLI provides access to the Authentiq Identity API. Requires a Bearer token.

## Prerequisites

```bash
authentiq config set token YOUR_BEARER_TOKEN
```

## All Commands

### Config

```bash
authentiq config get <key>
authentiq config set <key> <value>
authentiq config list
```

### Sessions

```bash
authentiq sessions list
authentiq sessions create --scope "openid email"
authentiq sessions create --scope "openid profile" --callback https://example.com/callback
authentiq sessions get <session-id>
authentiq sessions delete <session-id>
```

### Keys

```bash
authentiq keys register --key '{"kty":"EC","crv":"P-256","x":"...","y":"..."}'
authentiq keys get <pk>
authentiq keys update <pk> --data '{"status":"active"}'
authentiq keys revoke <pk>
```

### Scopes

```bash
authentiq scopes list
authentiq scopes get <scope-id>
authentiq scopes request --data '{"scope":"email"}'
```

## JSON Output

All commands support `--json`:

```bash
authentiq sessions list --json
authentiq keys get <pk> --json
authentiq scopes list --json
```

## Error Handling

The CLI exits with code 1 on error and prints to stderr.
- `Authentication failed` — Run `authentiq config set token YOUR_TOKEN`
- `Resource not found` — Check the ID is correct
