How to run on Replit:
- Create a new Replit → "Node.js".
- Add files from server-replit/ (package.json + index.js).
- In Replit Secrets, add OPENAI_API_KEY = your key. (Optional: OPENAI_MODEL = gpt-4o-mini)
- Click "Run". Copy the public URL (e.g., https://your-repl-name.username.repl.co).
- In Lovable project env, set VITE_API_BASE_URL to that URL. Reload /demo.
- The UI will now call {VITE_API_BASE_URL}/parseBuyBox first, then fall back locally if unreachable.