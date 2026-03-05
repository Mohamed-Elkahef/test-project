# Effective Debugging Strategy

The goal is to efficiently identify and resolve root causes. Follow these steps before resorting to extensive AI queries:

## 1. Reproduce Consistently
- Ensure you can reliably reproduce the bug
- Understand exact steps, inputs, and conditions that trigger the issue

## 2. Understand Expected vs. Actual
- Clearly articulate what the system should do versus what it is actually doing
- Identify the specific deviation

## 3. Isolate the Problem (Divide and Conquer)
- Narrow down the scope: frontend, backend API, database, specific module?
- Use browser developer tools (network tab, console, element inspector) for frontend
- Check API request/response payloads
- Test components or functions in isolation

## 4. Analyze Logs and Traces
- Examine relevant logs (application, system, database) around the time of error
- Look for error messages, warnings, unexpected values, or missing entries
- Use correlation IDs if available

## 5. Utilize the Debugger
- Step through suspected code path using IDE's debugger
- Inspect variable values and check control flow
- Pinpoint the exact line where things go wrong

## 6. Review Recent Changes
- Check version control history (git log, git blame)
- Examine related commits for recently introduced bugs

## 7. Formulate Hypotheses
- Form specific, testable hypotheses about the cause
- Example: "Variable X is null at line Y" or "API call fails due to incorrect auth headers"

## 8. Test Hypotheses Incrementally
- Make small, targeted changes to test your hypothesis
- Revert changes that don't work
- Avoid multiple unrelated changes at once

## 9. Write a Failing Test
- If possible, write a unit or integration test that reproduces the bug
- This confirms the bug's existence and ensures it stays fixed

## 10. Strategic AI Assistance
After exhausting above steps, provide AI with:
- **Specific Code Snippet**: The relevant, isolated function or block
- **Clear Context**: What the code should do, inputs received, exact error
- **What You've Tried**: Debugging steps taken and current hypothesis
- **Focused Questions**: Specific questions, not vague requests

## 11. Root Cause Analysis
- Reflect on why the bug occurred
- Consider if improved testing, validation, or design could have prevented it
- Apply lessons to future development
