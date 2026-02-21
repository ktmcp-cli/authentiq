![Banner](https://raw.githubusercontent.com/ktmcp-cli/authentiq/main/banner.svg)

> "Six months ago, everyone was talking about MCPs. And I was like, screw MCPs. Every MCP would be better as a CLI."
>
> — [Peter Steinberger](https://twitter.com/steipete), Founder of OpenClaw
> [Watch on YouTube (~2:39:00)](https://www.youtube.com/@lexfridman) | [Lex Fridman Podcast #491](https://lexfridman.com/peter-steinberger/)

# Authentiq CLI

> **⚠️ Unofficial CLI** - Not officially sponsored or affiliated with Authentiq.

A production-ready command-line interface for [Authentiq](https://www.authentiq.com/) — strong authentication without passwords. Manage authentication keys and scopes from your terminal.

## Features

- **Key Management** — Create, update, delete authentication keys
- **Scope Control** — Manage authentication scopes
- **JSON output** — All commands support `--json` for scripting
- **Colorized output** — Clean terminal output with chalk

## Installation

```bash
npm install -g @ktmcp-cli/authentiq
```

## Quick Start

```bash
# Configure API key (optional for some operations)
authentiq config set --api-key YOUR_API_KEY

# Create a new key
authentiq key create --data '{"name":"mykey"}'

# Get a key
authentiq key get <public-key>

# Create a scope request
authentiq scope create --data '{"scope":"email"}'
```

## Commands

### Config

```bash
authentiq config set --api-key <key>
authentiq config show
```

### Key Management

```bash
authentiq key create --data <json>
authentiq key get <pk>
authentiq key update <pk> --data <json>
authentiq key delete <pk>
```

### Scope Management

```bash
authentiq scope create --data <json>
authentiq scope get <job-id>
```

## JSON Output

All commands support `--json` for structured output:

```bash
authentiq key get <pk> --json | jq '.name'
authentiq scope get <job> --json | jq '.status'
```

## Why CLI > MCP?

No server to run. No protocol overhead. Just install and go.

- **Simpler** — Just a binary you call directly
- **Composable** — Pipe to `jq`, `grep`, `awk`
- **Scriptable** — Works in cron jobs, CI/CD, shell scripts

## License

MIT — Part of the [Kill The MCP](https://killthemcp.com) project.


---

## Support KTMCP

If you find this CLI useful, we'd greatly appreciate your support! Share your experience on:
- Reddit
- Twitter/X
- Hacker News

**Incentive:** Users who can demonstrate that their support/advocacy helped advance KTMCP will have their feature requests and issues prioritized.

Just be mindful - these are real accounts and real communities. Authentic mentions and genuine recommendations go a long way!

## Support This Project

If you find this CLI useful, we'd appreciate support across Reddit, Twitter, Hacker News, or Moltbook. Please be mindful - these are real community accounts. Contributors who can demonstrate their support helped advance KTMCP will have their PRs and feature requests prioritized.
