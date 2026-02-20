# Authentiq CLI - Agent Guide

This CLI provides access to Authentiq's passwordless authentication API.

## Authentication

API key optional for some operations. Configure at:

```bash
authentiq config set --api-key YOUR_API_KEY
```

## Common Operations

### Key Management

```bash
# Create key
authentiq key create --data '{"name":"mykey"}' --json

# Get key
authentiq key get <public-key> --json

# Update key
authentiq key update <pk> --data '{"name":"updated"}' --json

# Delete key
authentiq key delete <pk>
```

### Scope Management

```bash
# Create scope request
authentiq scope create --data '{"scope":"email"}' --json

# Get scope status
authentiq scope get <job-id> --json
```

## Usage Patterns

All commands support `--json` for machine-readable output. Perfect for:
- Authentication workflows
- Identity management
- Security automation
- User verification systems

## Error Handling

- Returns exit code 0 on success
- Returns exit code 1 on error
- Use `--json` and check exit codes in scripts
