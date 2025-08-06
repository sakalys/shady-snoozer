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

---

# Implementation Documentation

## Approach and Tools Used

**Tools Used:**
- Claude Code for analysis, planning, and implementation
- Built-in code analysis and refactoring capabilities
- Systematic approach using todo tracking for complex multi-step tasks

**Development Approach:**
1. **Analysis Phase**: Comprehensive codebase analysis to understand architecture, current limitations, and improvement opportunities
2. **Prioritization**: Focus on highest-impact fixes first (reliability, error handling, robustness)
3. **Iterative Implementation**: Make incremental improvements with testing at each step
4. **Feature Addition**: Add one valuable feature based on user needs analysis
5. **Documentation**: Document all changes, decisions, and tradeoffs throughout the process

## Fixes and Improvements

### [To be updated as fixes are implemented]

**Current Status**: Starting implementation phase

**Planned Priority Fixes:**
1. **Prompt Engineering**: Improve OpenAI prompts for more consistent, structured responses
2. **Error Handling**: Add comprehensive retry logic and better error messaging
3. **Response Parsing**: Make parsing more robust with better fallback strategies
4. **Configuration Integration**: Utilize existing platform config for validation
5. **Input Validation**: Add character limit warnings and better edge case handling

## Feature Addition

### [To be updated when feature is selected and implemented]

**Feature Selection Process**: Evaluating options based on:
- User value for small business owners
- Implementation complexity vs. impact
- Integration with existing architecture
- Demonstration of product sense

**Top Candidates:**
- Character count validation with platform-specific warnings
- Tone/style customization options
- Copy-to-clipboard functionality with formatting
- Export functionality for batch processing

## What I'd Do With More Time

### [To be updated as implementation progresses]

**Future Enhancements:**
- Advanced prompt templates with A/B testing
- Caching layer for similar product descriptions
- Analytics and usage tracking
- Integration with social media scheduling tools
- Multi-language support
- Advanced content customization (industry-specific templates)

## Tradeoffs Made

### [To be updated as implementation decisions are made]

**Key Decision Points:**
- Balance between feature richness and code simplicity
- Error handling complexity vs. user experience
- API reliability vs. response speed
- Customization options vs. ease of use

---

*This documentation will be updated in real-time as improvements are implemented.*
