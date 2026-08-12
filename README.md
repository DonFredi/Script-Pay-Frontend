ScriptPay Agent System for Claude Code

**Fast, practical agent prompts** for maintaining and improving your ScriptPay frontend.

## What You Have

Four powerful agents that work with Claude Code:

1. **Security Agent** - Find and fix vulnerabilities
2. **Quality Agent** - Improve code quality & reduce complexity
3. **Audit Agent** - Check system health & detect issues
4. **Feature Agent** - Generate new features from specs

## 30-Second Setup

### 1. Copy Files to Your Project

Copy these 4 files to your project's `.claude/prompts/agents/` folder:

- `security-agent.md`
- `quality-agent.md`
- `audit-agent.md`
- `feature-agent.md`

```bash
# In your project root
mkdir -p .claude/prompts/agents

# Copy the agent files here
# You can drag-drop or git clone
```

### 2. Use in Claude Code

```bash
# Open Claude Code
claude-code

# Paste an agent prompt, then say:
# "Run this security audit on my codebase"
# "Run this quality pass to improve code"
# "Generate [feature name] using this template"
```

### 3. Review & Merge

Claude Code will create PRs with changes. Review and merge when ready.

**Done!** You're now using autonomous agents. 🚀

## How Each Agent Works

### 🔒 Security Agent

**What it does:**

- Finds hardcoded secrets (API keys, tokens, passwords)
- Checks for XSS vulnerabilities
- Verifies authentication/authorization
- Audits input validation
- Scans dependencies for CVEs

**How to use:**

```
1. Open Claude Code
2. Load: security-agent.md
3. Say: "Perform a complete security audit"
4. Claude will scan code and create a PR with fixes
```

**Time:** ~30 minutes first run, ~15 minutes ongoing

**Output:**

- PR with security fixes
- List of vulnerabilities found
- Recommendations

### ✨ Quality Agent

**What it does:**

- Reduces code complexity
- Improves test coverage
- Removes dead code
- Fixes linting issues
- Optimizes performance

**How to use:**

```
1. Open Claude Code
2. Load: quality-agent.md
3. Say: "Run quality improvements"
4. Claude will refactor code and create a PR
```

**Time:** ~45 minutes first run, ~20 minutes ongoing

**Output:**

- Refactored code
- Better test coverage
- Reduced complexity
- Performance improvements

### 📊 Audit Agent

**What it does:**

- Checks for hardcoded secrets
- Detects code smells
- Verifies error handling
- Audits logging practices
- Tracks technical debt
- Generates health report

**How to use:**

```
1. Open Claude Code
2. Load: audit-agent.md
3. Say: "Run a system audit"
4. Claude will scan code and create a report
```

**Time:** ~30 minutes

**Output:**

- Audit report (`.claude/audit-report.md`)
- GitHub issues for findings
- Health score & metrics

### 🚀 Feature Agent

**What it does:**

- Generates complete features from specs
- Creates backend services
- Builds React components
- Writes tests
- Updates documentation

**How to use:**

```
1. Prepare feature request (use template in feature-agent.md)
2. Open Claude Code
3. Load: feature-agent.md
4. Say: "Generate [feature name]"
5. Paste feature spec
6. Claude generates complete feature
```

**Time:** ~20-30 minutes per feature

**Output:**

- API service
- React components
- Tests
- Page/route
- Documentation
- PR ready for review

## Real World Examples

### Example 1: Security Audit

```
You (Claude Code):
"Use the security agent to audit my codebase"

Claude:
✓ Scanning 45 TypeScript files...
✓ Found: Hardcoded Stripe key in src/config/stripe.ts
✓ Found: Missing CSRF protection on POST endpoints
✓ Found: localStorage storing auth token (XSS vulnerable)

Creating fixes...
✓ Moved secrets to .env
✓ Added CSRF guards
✓ Using httpOnly cookies instead

Creating PR: security/audit-fixes-2024-01-15
✓ PR ready for review
```

### Example 2: Quality Improvements

```
You (Claude Code):
"Run quality improvements on the codebase"

Claude:
✓ Analyzing code complexity...
✓ Found: UserForm.tsx is 120 lines (extract methods)
✓ Found: procesPayment() has cyclomatic complexity 8 (simplify)
✓ Found: Test coverage only 62% (add tests)

Refactoring...
✓ Extracted UserForm into 3 components
✓ Simplified payment processing to complexity 4
✓ Added 15 new tests

Creating PR: quality/improvements-2024-01-15
✓ Coverage improved: 62% → 78%
✓ All tests passing
```

### Example 3: Generate Feature

```
You (Claude Code):
"Generate subscription management feature"

Feature Spec:
- List all subscriptions
- Create new subscription
- Edit subscription amount
- Cancel subscription
- Show billing history

Claude:
✓ Creating database schema...
✓ Creating API service (src/services/subscriptions.ts)
✓ Creating components...
  ✓ SubscriptionList.tsx
  ✓ SubscriptionForm.tsx
  ✓ BillingHistory.tsx
✓ Creating page (src/app/subscriptions/page.tsx)
✓ Writing tests (15 tests, 85% coverage)
✓ Creating documentation

Creating PR: feature/subscriptions-2024-01-15
✓ Feature complete and ready for review
```

## Daily Workflow

### Morning (5 min)

```bash
# Check what needs attention
scriptpay-agent status
# Or check GitHub for pending PRs from agents
gh pr list --label agent
```

### When You Have Time (30-45 min)

```bash
# Run an agent
# 1. Open Claude Code
# 2. Load agent prompt
# 3. Run it
# 4. Review PR created
# 5. Merge when ready
```

### Weekly (30 min)

```bash
# Audit system health
# Run audit agent
# Review findings
# Create GitHub issues for top priorities
# Assign to team
```

## File Structure

After setup, your project looks like:

```
your-project/
├── .claude/
│   └── prompts/
│       └── agents/
│           ├── security-agent.md      ← Security audits
│           ├── quality-agent.md       ← Code quality
│           ├── audit-agent.md         ← System health
│           └── feature-agent.md       ← Generate features
│
├── src/
│   ├── (agents improve this)
│   └── ...
│
├── .github/
│   └── workflows/
│       └── (optional) agents.yml      ← Scheduled runs
│
└── README.md
```

## Common Questions

### Q: Do I need to install anything?

**A:** No! Just copy the files and use them in Claude Code.

### Q: How much does it cost?

**A:** Just your normal Claude API costs. ~$5-15/month for regular use.

### Q: Can I trust the generated code?

**A:** Claude generates production-quality code with tests. Always review PRs before merging.

### Q: What if I disagree with a change?

**A:** It's a PR - you can request changes or reject it.

### Q: Can I customize the agents?

**A:** Yes! Edit the `.md` files to customize checklist and behavior.

### Q: Can I use them with GitHub Actions?

**A:** Yes! You can copy the prompts and create workflows. (See agent-integration-guide.md)

## Tips & Tricks

### Tip 1: Start with Audit

Run the audit agent first to understand your codebase health before fixing.

### Tip 2: Security Before Quality

Security fixes are more important than quality improvements.

### Tip 3: Review PRs Carefully

Always review agent PRs. They're usually good but might need tweaks.

### Tip 4: Use for Learning

Read generated code to see best practices for React/TypeScript.

### Tip 5: Combine with Your Workflow

Use agents alongside your normal development. They don't replace code review.

## Troubleshooting

### Agent won't run

- Make sure you copied the full prompt text
- Check you're in Claude Code (not regular Claude chat)
- Try starting fresh with a new conversation

### PR has conflicts

- Pull latest code first
- Ask agent to rebase or regenerate
- Merge conflicts are normal - resolve and commit

### Generated code has issues

- Claude did its best - refine it if needed
- All code passes tests but might need polish
- Edit PR and push changes

### Too many PRs created

- Delete agent branches you don't want
- Run agents less frequently
- Be selective about which agents to use

## Next Steps

### ✅ Immediate

1. Copy these 4 files to `.claude/prompts/agents/`
2. Open Claude Code
3. Try the audit agent first (it's read-only)

### 📚 Learn More

- Read each agent file (they have detailed checklists)
- Understand what each agent looks for
- Review generated PRs to see quality

### 🚀 Start Using

- Use security agent weekly
- Use quality agent biweekly
- Use audit agent weekly
- Use feature agent as needed

### 📊 Monitor

- Track PRs created by agents
- Review metrics (test coverage, complexity)
- Adjust agent behavior as needed

## Support

**Having trouble?**

1. Read the specific agent's `.md` file (they're detailed)
2. Check Claude Code's error messages
3. Try with a smaller scope first
4. Run tests locally to verify changes

**Want to customize?**

1. Edit the `.md` files
2. Change checklist items
3. Add your project-specific checks
4. Re-run agent with new version

## What's Next?

Now that you have agents set up:

1. **Today**: Run audit agent (read-only, safe)
2. **This Week**: Run quality agent (improve code)
3. **This Month**: Run security agent (fix vulnerabilities)
4. **Ongoing**: Use feature agent for new features

Your codebase will get continuously better! 📈

---

**Ready to start?**

1. Copy these 4 files to `.claude/prompts/agents/`
2. Open Claude Code
3. Load `security-agent.md`
4. Say: "Run a security audit on my codebase"
5. Review the PR created

That's it! Welcome to autonomous agents. 🤖✨

---

**Questions?** Each agent file has extensive documentation and examples.
