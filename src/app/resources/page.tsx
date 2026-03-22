import { Metadata } from 'next';
import Card from '@/components/ui/Card';
import PromptCard from '@/components/resources/PromptCard';

export const metadata: Metadata = {
  title: 'Tools & Resources - Vibe Coded with Love',
  description: 'Free tools, AI review prompts, and documentation to help you review and improve your code.',
};

const SCANNING_TOOLS = [
  {
    name: 'GitHub CodeQL',
    description: 'Free semantic code analysis for public repos via GitHub Actions. Detects vulnerabilities on every push/PR.',
    bestFor: 'Anyone with a public GitHub repo (zero friction)',
    install: 'Enable in repo Settings → Code security',
    link: 'https://github.com/github/codeql',
  },
  {
    name: 'Semgrep',
    description: 'Open-source static analysis with pattern matching. Huge community ruleset.',
    bestFor: 'Fast, customizable scanning in CI/CD',
    install: 'brew install semgrep\nor\npip install semgrep',
    link: 'https://semgrep.dev',
  },
  {
    name: 'Bearer CLI',
    description: 'SAST scanner aligned with OWASP Top 10 and CWE Top 25. Tracks sensitive data flows.',
    bestFor: 'Projects handling user data or auth',
    install: 'curl -sfL https://raw.githubusercontent.com/Bearer/bearer/main/contrib/install.sh | sh',
    link: 'https://bearer.com',
  },
  {
    name: 'SonarQube CE',
    description: 'Deep static analysis across 25+ languages with dashboards.',
    bestFor: 'Thorough analysis with visual reporting',
    install: 'Docker or visit sonarqube.org',
    link: 'https://sonarqube.org',
  },
  {
    name: 'Trivy',
    description: 'Scans containers, deps, IaC for vulnerabilities, secrets, license issues.',
    bestFor: 'Docker deployments, dependency checking',
    install: 'brew install trivy\nor\napt-get install trivy',
    link: 'https://trivy.dev',
  },
  {
    name: 'Graudit',
    description: 'Lightweight grep-based scanner with signature databases.',
    bestFor: 'Quick command-line audits',
    install: 'git clone https://github.com/wireghoul/graudit',
    link: 'https://github.com/wireghoul/graudit',
  },
];

const REFERENCE_DOCS = [
  {
    title: 'OWASP Top 10',
    description: 'The industry-standard list of the most critical web application security risks. If you only read one thing, read this.',
    link: 'https://owasp.org/www-project-top-ten',
  },
  {
    title: 'OWASP Free Tools for Open Source',
    description: 'Comprehensive list of free security tools for open-source projects.',
    link: 'https://owasp.org/www-community/Free_for_Open_Source_Application_Security_Tools',
  },
  {
    title: 'OpenSSF Security Guide for AI Code Assistants',
    description: 'Covers how to prompt AI tools to produce more secure code. Directly relevant.',
    link: 'https://best.openssf.org/Security-Focused-Guide-for-AI-Code-Assistant-Instructions',
  },
  {
    title: 'CWE Top 25',
    description: 'The 25 most dangerous software weaknesses.',
    link: 'https://cwe.mitre.org/top25',
  },
];

export default function ResourcesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {/* Hero Section */}
        <div className="mb-16 space-y-6">
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground">
            Tools & Resources
          </h1>
          <p className="text-xl text-foreground/80 leading-relaxed max-w-3xl">
            Free tools, prompts, and documentation to help you review and improve your code — whether you wrote it, an AI wrote it, or somewhere in between.
          </p>
        </div>

        {/* Section 1: Scan Your Code Automatically */}
        <section className="mb-16 space-y-8">
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-3">Scan Your Code Automatically</h2>
            <p className="text-foreground/80 text-lg mb-6">
              These free tools analyze your codebase and report issues. No AI prompting needed — just point them at your repo.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {SCANNING_TOOLS.map((tool, idx) => (
              <Card key={idx} padding="lg" hover className="flex flex-col">
                <h3 className="text-xl font-semibold text-foreground mb-2">{tool.name}</h3>
                <p className="text-foreground/80 mb-4 flex-grow">{tool.description}</p>

                <div className="space-y-3 pt-4 border-t border-border">
                  <div>
                    <p className="text-sm font-medium text-foreground/70 mb-1">Best for:</p>
                    <p className="text-sm text-foreground/80">{tool.bestFor}</p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-foreground/70 mb-1">Install:</p>
                    <pre className="text-xs bg-background text-foreground px-3 py-2 rounded whitespace-pre-wrap break-words">
                      {tool.install}
                    </pre>
                  </div>

                  <a
                    href={tool.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block text-warmPrimary hover:text-warmPrimaryDark text-sm font-medium transition-colors"
                  >
                    Learn More →
                  </a>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Section 2: Pack Your Code for AI Review */}
        <section className="mb-16 space-y-8">
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-3">Pack Your Code for AI Review</h2>
            <p className="text-foreground/80 text-lg mb-6">
              Use Repomix to prepare your codebase for AI analysis, then run one of the prompts below.
            </p>
          </div>

          <Card padding="lg" hover className="flex flex-col">
            <h3 className="text-2xl font-semibold text-foreground mb-4">Repomix</h3>

            <div className="space-y-6 flex-grow">
              <div>
                <h4 className="text-sm font-medium text-foreground/80 mb-2">What it does</h4>
                <p className="text-foreground/80">
                  Packages your entire codebase into a single AI-friendly file
                </p>
              </div>

              <div>
                <h4 className="text-sm font-medium text-foreground/80 mb-2">Features</h4>
                <ul className="text-sm text-foreground/80 space-y-1">
                  <li>• Token counting</li>
                  <li>• Secretlint integration</li>
                  <li>• Respects .gitignore</li>
                  <li>• Multiple output formats</li>
                </ul>
              </div>

              <div>
                <h4 className="text-sm font-medium text-foreground/80 mb-2">Install</h4>
                <pre className="text-xs bg-background text-foreground px-3 py-2 rounded">
                  npx repomix
                </pre>
                <p className="text-xs text-foreground/70 mt-1">(no install needed)</p>
              </div>

              <div>
                <h4 className="text-sm font-medium text-foreground/80 mb-2">Workflow</h4>
                <ol className="text-sm text-foreground/80 space-y-1">
                  <li>1. Run <code className="bg-background px-2 py-1 rounded text-xs">npx repomix</code> in your project</li>
                  <li>2. Paste output into Claude/ChatGPT</li>
                  <li>3. Use one of the prompts below</li>
                </ol>
              </div>
            </div>

            <div className="pt-6 border-t border-border space-y-3">
              <a
                href="https://repomix.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block text-warmPrimary hover:text-warmPrimaryDark text-sm font-medium transition-colors"
              >
                Visit repomix.com →
              </a>
              <br />
              <a
                href="https://github.com/yamadashy/repomix"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block text-warmPrimary hover:text-warmPrimaryDark text-sm font-medium transition-colors"
              >
                View on GitHub →
              </a>
            </div>
          </Card>
        </section>

        {/* Section 3: Copy-Paste Prompts */}
        <section className="mb-16 space-y-8">
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-3">Copy-Paste Prompts</h2>
            <p className="text-foreground/80 text-lg mb-6">
              Run these with Claude, ChatGPT, or any LLM. Paste your code (or Repomix output) where indicated.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <PromptCard
              title="Quick Security Scan"
              description="Start here. A fast check for the most common and embarrassing security issues."
              prompt={`You are a senior security engineer. Review the following code and check for:
1. Injection vulnerabilities (SQL, NoSQL, command injection)
2. Authentication and authorization issues
3. Sensitive data exposure (secrets in code, overly verbose error messages)
4. Missing input validation or sanitization
5. Insecure cryptography or hardcoded secrets

For each issue found, provide:
- Severity: Critical / High / Medium / Low
- What the problem is (in plain language)
- How to fix it (with a code example if possible)

If no issues are found in a category, say so. Be thorough but explain things in a way a non-security-expert can understand.

Here is the code:
[PASTE CODE OR REPOMIX OUTPUT HERE]`}
            />

            <PromptCard
              title="Full Project Architecture Review"
              description="A comprehensive review covering security, architecture, performance, and AI-specific issues."
              prompt={`You are a senior software architect performing a pre-release review. This codebase was built with AI assistance. Review it with that context in mind — AI-generated code often has inconsistent patterns across files, generic error handling, and may not maintain security context between modules.

Analyze the following areas:
1. **Security**: OWASP Top 10 vulnerabilities, auth/session handling, input validation consistency across all endpoints, secrets management
2. **Architecture**: Code organization, separation of concerns, dependency management, error handling patterns
3. **Performance**: N+1 queries, unnecessary re-renders, missing indexes, unoptimized data fetching
4. **AI-Specific Issues**: Inconsistent patterns between files, hallucinated dependencies (packages that don&apos;t exist), copy-paste patterns where a flawed approach was reused, context boundary failures

For each finding:
- Severity: Critical / High / Medium / Low
- File and location (if identifiable)
- The problem explained clearly
- Specific fix with code example
- Why this matters (what could go wrong)

Prioritize findings by severity. Group related issues together.

Here is the codebase:
[PASTE REPOMIX OUTPUT HERE]`}
            />

            <PromptCard
              title="Dependency & Supply Chain Check"
              description="Verify your dependencies are real, secure, and well-maintained."
              prompt={`Review the dependencies in this project. For each dependency:
1. Is this a real, actively maintained package? (AI tools sometimes hallucinate package names)
2. Are there known vulnerabilities in the version being used?
3. Is the package widely adopted or is it obscure/risky?
4. Are there better-maintained alternatives?
5. Are any dependencies unnecessary or redundant?

Also check for:
- Pinned vs unpinned versions
- Dev dependencies that ended up in production
- Packages that haven&apos;t been updated in over a year

Here are the project dependencies:
[PASTE package.json, requirements.txt, go.mod, OR EQUIVALENT]`}
            />

            <PromptCard
              title="Pre-Submission Checklist"
              description="Run this right before submitting to vibecodedwithlove.com."
              prompt={`I&apos;m about to submit this project to a platform for AI-assisted projects where the community will review it. Help me prepare by checking:
1. Are there any hardcoded secrets, API keys, or credentials in the code?
2. Are there any obvious security vulnerabilities that would be embarrassing if found?
3. Is the code reasonably organized and readable?
4. Are there any dependencies that don&apos;t actually exist (hallucinated by the AI)?
5. Does the error handling reveal sensitive information?
6. If this were exposed to the internet, what would be the biggest risk?

Be direct and honest. I&apos;d rather fix issues now than have them found publicly.

Here is the code:
[PASTE CODE OR REPOMIX OUTPUT HERE]`}
            />

            <PromptCard
              id="code-map-generator"
              title="Code Map Generator"
              description="Generates a structured overview of your codebase for the Code Map field during project submission."
              prompt={`You are a technical documentation specialist. I need you to generate a structured "Code Map" of this project that will help code reviewers quickly understand what this codebase does and how it works. The audience is developers who have never seen this code before.

Generate the following sections in markdown:

## Project Overview
A 2-3 sentence summary of what this application does based on the actual code (not what the developer claims — what the code actually implements).

## File Structure Summary
List the main directories and files with a one-line description of what each one does. Group by function (e.g., "Frontend", "API Routes", "Database", "Utilities"). Skip boilerplate config files unless they contain notable customization.

## Entry Points
Where does execution start? What are the main entry points a user or request hits? (e.g., "Main page renders from src/app/page.tsx", "API requests enter through src/app/api/")

## Data Flow
How does data move through the application? Trace the most important user action from frontend → API → database and back. Use a simple numbered flow.

## Key Components & What They Do
For each major component, module, or class: what it does, what it depends on, and what depends on it. Focus on the 5-10 most important pieces, not every file.

## External Dependencies & Integrations
What third-party services, APIs, or databases does this connect to? How are credentials managed?

## Routes / Endpoints
List all routes (pages) and API endpoints with their HTTP method and a brief description.

## State Management
How is application state managed? Where does data live (database, session, local state, context)?

## Potential Concerns
Based on your analysis, flag anything that looks inconsistent, unusual, or potentially problematic. This is not a security audit — just a "heads up, you might want to look at this" section.

Format everything in clean markdown. Be factual and specific — reference actual file names and function names from the code.

Here is the codebase:
[PASTE REPOMIX OUTPUT HERE]`}
            />
          </div>
        </section>

        {/* Section 4: Essential Reading */}
        <section className="space-y-8">
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-3">Essential Reading</h2>
            <p className="text-foreground/80 text-lg mb-6">
              Understand what these tools are actually checking for.
            </p>
          </div>

          <div className="space-y-4">
            {REFERENCE_DOCS.map((doc, idx) => (
              <a
                key={idx}
                href={doc.link}
                target="_blank"
                rel="noopener noreferrer"
                className="group block p-5 border border-border rounded-lg bg-input hover:border-warmPrimary hover:shadow-lg transition-all duration-300"
              >
                <h3 className="text-lg font-semibold text-foreground group-hover:text-warmPrimary mb-2 transition-colors">
                  {doc.title}
                </h3>
                <p className="text-foreground/80 text-sm mb-3">{doc.description}</p>
                <span className="text-warmPrimary group-hover:text-warmPrimaryDark text-sm font-medium transition-colors">
                  Read More →
                </span>
              </a>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
