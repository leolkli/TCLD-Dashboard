# Skill: Active Debugging via Scripting

**Description**: 
Instructs the AI to proactively write and execute localized debug scripts to isolate, reproduce, and understand errors dynamically, rather than passively searching through codebases with find, grep, or read commands.

**USE FOR**: 
Debugging runtime errors, unexpected null/undefined variables, timeout network failures, build pipeline issues, and API connection drops.

**DO NOT USE FOR**: 
Syntax errors or linting setup issues which can be natively seen without runtime execution.

## Instructions

Whenever you encounter a runtime error, build failure, or exceptions shown in logs, you MUST follow this protocol instead of immediately using file search tools to "stare at the code":

1. **Stop and Isolate**: Do not guess the fix by reading through hundreds of lines of code. Isolate the suspected function, module, or network call.
2. **Write a Debug Script**: Create a minimal, standalone reproduction script (e.g., `test-debug.js`, `test-connection.ts`, or a shell command). 
   - Import only the failing module or mock the failing input.
   - Inject verbose output (e.g., `console.log`, `print`, `try/catch` with full stack traces).
   - Dump the exact state of Environment Variables, Types, or Payloads just before the crash.
3. **Execute and Observe**: Use the `run_in_terminal` tool to run your custom debug script.
4. **Reason from Output**: Analyze the raw runtime output. Use the script's exact output to definitively prove *why* the error is happening.
5. **Iterate if Necessary**: If the script doesn't fail the same way, expand the script to match the host environment closer (e.g., applying missing context).
6. **Clean Up**: Once the root cause is understood and the main codebase is successfully patched, delete the temporary debug scripts to keep the workspace clean.