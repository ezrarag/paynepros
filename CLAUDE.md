# PaynePros Agent Instructions

## PaynePros State Log

This project is logged to a Google Drive Markdown file via the Google Drive MCP.

- Log File: `paynepros-state-log`
- File ID: `13AC5TBayz3pZL3TYI3IkZUy2v6M4eUCh`

When the user's message is `/init state`, read only the Google Drive file with the
File ID above and summarize where the project left off.

When the user's message is `log this`, or before ending a working session when the
user asks to save/log state, append a new entry at the bottom of that same file.
Only ever write to the File ID above for PaynePros state logging. Never write
PaynePros state entries into another project's log file.

Use this schema for each appended entry:

```markdown
### 📅 Log Entry: [timestamp] | Platform: [Claude Desktop / Claude Code / Codex]
- Current Project State:
- Key Actions Taken:
- Next Steps:
```
