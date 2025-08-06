# Sintra Trial Task

## Background

Small business owners spend hours writing social media posts for each platform. This tool helps them generate posts for Twitter, Instagram, and LinkedIn from a single product description.

Someone built a quick prototype using OpenAI's Responses API. It works, but it's rough around the edges.

Your job: make it better.

## The Task

You have ~4 hours to improve this codebase.

**Use any tools you want** - Cursor, Windsurf, Claude Code, GitHub Copilot, ChatGPT, v0, whatever you'd use on the job. This is about how you work in the real world, not a closed-book exam.

### Part 1: Fix and Improve

Focus on making the existing functionality reliable:

- Improve prompt engineering for better, more consistent outputs
- Add proper error handling and retry logic
- Make the response parsing more robust
- Handle edge cases (long descriptions, special characters, API failures)
- Use the existing config for platform-specific limits

### Part 2: Extend

Add one small feature that would make this more useful for small business owners. Examples:

- Tone/style customization (professional, casual, humorous)
- Platform-specific optimizations (hashtags, mentions, emojis)
- Batch processing for multiple products
- Copy to clipboard functionality
- Export posts as CSV or JSON
- Preview with character counts and warnings

Pick something that demonstrates good product sense. Document your choice and reasoning.

## Setup

Backend:

```bash
cd backend
npm install
cp .env.example .env  # Add your OpenAI API key
npm run dev
```

Frontend:

```bash
cd frontend
npm install
cp .env.example .env  # Optional: customize API URL
npm run dev
```

Visit http://localhost:3000 to test it out.

## Key Files to Review

- `backend/src/generate.ts` - Core generation and parsing logic
- `backend/src/openai.ts` - OpenAI API integration
- `backend/src/config.ts` - Configuration that's partially implemented
- `frontend/src/app/page.tsx` - UI for testing the service

## What to Submit

1. **GitHub Repository**: Create a GitHub repository with your solution and add `trial-sintra` as a collaborator

   - GitHub account to add: https://github.com/trial-sintra
   - Include full commit history

2. **Documentation**: Update this README with:
   - Your approach and tools used
   - What you fixed and why
   - What feature you added and why you chose it
   - What you'd do with more time
   - Any tradeoffs you made

## What We're Looking For

- How you prioritize fixes
- Your judgment on what features add value
- Code quality and structure
- How you handle tradeoffs
- Clear communication about your decisions

## Tips

- Start with the highest impact changes
- Keep it simple - this isn't about building the perfect system
- Think about the next developer who'll work on this

That's it. Show us how you approach real-world code.
