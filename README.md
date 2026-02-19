> "Six months ago, everyone was talking about MCPs. And I was like, screw MCPs. Every MCP would be better as a CLI."
>
> — [Peter Steinberger](https://twitter.com/steipete), Founder of OpenClaw
> [Watch on YouTube (~2:39:00)](https://www.youtube.com/@lexfridman) | [Lex Fridman Podcast #491](https://lexfridman.com/peter-steinberger/)

# Authentiq CLI

Production-ready CLI for the Authentiq Identity API. Manage sessions, keys, and scopes directly from your terminal.

## Installation

```bash
npm install -g @ktmcp-cli/authentiq
```

## Configuration

```bash
authentiq config set token YOUR_BEARER_TOKEN
```

## Usage

### Sessions

```bash
# List all sessions
authentiq sessions list

# Create a new session
authentiq sessions create --scope "openid email"
authentiq sessions create --scope "openid profile" --callback https://example.com/callback

# Get session details
authentiq sessions get <session-id>

# Delete a session
authentiq sessions delete <session-id>
```

### Keys

```bash
# Register a public key (JWK format)
authentiq keys register --key '{"kty":"EC","crv":"P-256","x":"...","y":"..."}'

# Get key details
authentiq keys get <pk>

# Update a key
authentiq keys update <pk> --data '{"status":"active"}'

# Revoke a key
authentiq keys revoke <pk>
```

### Scopes

```bash
# List available scopes
authentiq scopes list

# Get scope details
authentiq scopes get openid

# Request additional scopes
authentiq scopes request --data '{"scope":"email"}'
```

### JSON Output

All commands support `--json` for machine-readable output:

```bash
authentiq sessions list --json
authentiq sessions get <id> --json
authentiq scopes list --json
```

## License

MIT
