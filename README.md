VoiceBot — Sanjai (100x Assessment)

Files:
- index.html      => Frontend: speech recognition, UI, TTS
- api/chat.js     => Vercel serverless function proxying to OpenAI
- package.json    => Minimal file to force Node runtime on Vercel
- .env.example    => Example env file

Deployment:
1. Push this repo to GitHub.
2. In Vercel, import the repository.
3. In Vercel Project Settings -> Environment Variables, add:
   - OPENAI_API_KEY = <your key>
   - OPENAI_MODEL = gpt-4o-mini
   (Targets: Production, Preview, Development)
4. Redeploy the project.
5. Test the frontend by visiting the project URL and using Start Recording.

Security:
- Never commit your real OPENAI_API_KEY to the repository.
- Use Vercel Environment Variables for secrets.
