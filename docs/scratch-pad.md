# Scratch pad


https://github.com/Aider-AI/aider.git

1. We have onlyh sub account
2. many software need api key and we are stull cant uses tools.
3. lm studo can help by converting sub into an api.
4. aider is a lmstudio plugin that can expose our subased to api based.
5. we have multiple pages that maket is happen
6. Now we have to figure what the final consolidated plain.


7. ==== To be filled by AI====

8. Plan — expose Claude Code CLI as a local API:
9. Write HTTP server that:
   9.1 listens on a port (8787),
   9.2 accepts POST /v1/messages,
   9.3 runs `claude -p "<prompt>" --output-format json` (or Agent SDK),
   9.4 returns `{ content: [{ type: "text", text: "..." }] }`.
10. Start the server.
11. Point tools at it: `ANTHROPIC_BASE_URL=http://localhost:8787`.
