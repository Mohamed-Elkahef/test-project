---
skill_name: security-audit
triggers:
  - "security audit"
  - "security review"
  - "vulnerability scan"
  - "security vulnerabilities"
  - "security check"
  - "token in URL"
  - "XSS"
  - "CSRF"
  - "authentication security"
  - "authorization check"
description: |
  This skill should be used when conducting security audits of web applications, APIs, and codebases.
  It helps identify common security vulnerabilities, assess security risks, and provide remediation recommendations.
  Use this skill for reviewing authentication mechanisms, authorization logic, input validation, data exposure,
  and other security-related concerns.
---

# Security Audit Skill

## Purpose

Perform comprehensive security audits of web applications, identifying vulnerabilities and providing actionable remediation guidance.

## When to Use This Skill

- Reviewing code for security vulnerabilities
- Auditing authentication and authorization mechanisms
- Identifying data exposure risks (tokens in URLs, sensitive data in logs)
- Checking for common web vulnerabilities (XSS, CSRF, SQL injection, etc.)
- Evaluating API security
- Assessing secure data storage and transmission
- Reviewing third-party dependencies for known vulnerabilities

## Key Security Areas

### 1. Authentication & Authorization

**Common Issues:**
- Weak password policies
- Missing multi-factor authentication
- Insecure session management
- JWT token vulnerabilities
- Missing or improper role-based access control (RBAC)

**What to Check:**
- Password hashing algorithms (bcrypt, argon2)
- Session timeout and invalidation
- Token storage and transmission
- Authorization checks on all protected routes
- Privilege escalation vulnerabilities

### 2. Data Exposure

**Common Issues:**
- Sensitive tokens in URLs
- Credentials in source code or logs
- Excessive data in API responses
- Missing encryption for sensitive data
- Insecure direct object references (IDOR)

**What to Check:**
- Tokens passed via POST body or headers (not URL params)
- Environment variables for secrets
- API response filtering
- Database field encryption
- Access control on object references

### 3. Input Validation & Injection

**Common Issues:**
- SQL injection
- Cross-site scripting (XSS)
- Command injection
- Path traversal
- XML external entity (XXE)

**What to Check:**
- Input sanitization and validation
- Parameterized queries or ORM usage
- Output encoding
- File upload restrictions
- Content Security Policy (CSP) headers

### 4. Cross-Site Request Forgery (CSRF)

**Common Issues:**
- Missing CSRF tokens
- Improper CSRF token validation
- State-changing GET requests

**What to Check:**
- CSRF protection on state-changing operations
- SameSite cookie attributes
- Origin/Referer header validation

### 5. Security Headers

**Common Issues:**
- Missing security headers
- Permissive CORS policies
- Insecure content type handling

**What to Check:**
- Content-Security-Policy
- X-Frame-Options
- X-Content-Type-Options
- Strict-Transport-Security
- CORS configuration

### 6. API Security

**Common Issues:**
- Missing rate limiting
- Lack of API authentication
- Verbose error messages
- Missing input validation
- Insecure API versioning

**What to Check:**
- Rate limiting implementation
- API key/token authentication
- Generic error responses
- Request validation
- API documentation security

### 7. Dependencies & Supply Chain

**Common Issues:**
- Outdated dependencies with known vulnerabilities
- Unused dependencies
- Malicious packages

**What to Check:**
- `npm audit` or equivalent
- Dependency update policies
- Lock file integrity
- Subresource Integrity (SRI) for CDN resources

## Audit Process

### Step 1: Reconnaissance
1. Identify application architecture (frontend, backend, databases)
2. Map authentication and authorization flows
3. Identify sensitive data and operations
4. Review technology stack and dependencies

### Step 2: Code Review
1. Search for hardcoded secrets (`grep -r "password\|secret\|token\|api_key"`)
2. Review authentication implementation
3. Check authorization on protected routes
4. Examine input validation and sanitization
5. Review data storage and transmission

### Step 3: Automated Scanning
1. Run dependency audits (`npm audit`, `pip-audit`)
2. Use static analysis tools (ESLint security plugins, Bandit, Semgrep)
3. Check for common vulnerabilities with scanners

### Step 4: Manual Testing
1. Test authentication bypass
2. Test authorization escalation
3. Test input validation (XSS, SQL injection)
4. Test CSRF protection
5. Test rate limiting

### Step 5: Reporting
1. Categorize findings by severity (Critical, High, Medium, Low)
2. Provide proof of concept for each vulnerability
3. Include remediation recommendations
4. Prioritize fixes

## Common Vulnerability Patterns

### Token in URL (Security Risk)

**Issue:**
```javascript
// ❌ Bad: Token in URL
fetch(`/api/video/stream?token=${authToken}`)
```

**Fix:**
```javascript
// ✅ Good: Token in header
fetch('/api/video/stream', {
  headers: {
    'Authorization': `Bearer ${authToken}`
  }
})
```

**Why:** URLs are logged in browser history, server logs, and referrer headers.

### Missing Input Validation

**Issue:**
```javascript
// ❌ Bad: No validation
app.post('/user/:id', (req, res) => {
  db.query(`UPDATE users SET name='${req.body.name}' WHERE id=${req.params.id}`)
})
```

**Fix:**
```javascript
// ✅ Good: Parameterized query + validation
app.post('/user/:id', (req, res) => {
  const schema = z.object({ name: z.string().max(100) })
  const { name } = schema.parse(req.body)
  db.query('UPDATE users SET name=? WHERE id=?', [name, req.params.id])
})
```

### Missing Authorization Check

**Issue:**
```javascript
// ❌ Bad: No authorization
app.get('/api/user/:id/orders', async (req, res) => {
  const orders = await db.query('SELECT * FROM orders WHERE user_id=?', [req.params.id])
  res.json(orders)
})
```

**Fix:**
```javascript
// ✅ Good: Check ownership
app.get('/api/user/:id/orders', async (req, res) => {
  if (req.user.id !== parseInt(req.params.id) && !req.user.isAdmin) {
    return res.status(403).json({ error: 'Forbidden' })
  }
  const orders = await db.query('SELECT * FROM orders WHERE user_id=?', [req.params.id])
  res.json(orders)
})
```

### XSS Vulnerability

**Issue:**
```javascript
// ❌ Bad: Unescaped user input
const name = req.query.name
res.send(`<h1>Hello ${name}</h1>`)
```

**Fix:**
```javascript
// ✅ Good: Use templating engine with auto-escaping
res.render('welcome', { name: req.query.name })

// Or manual escaping
const escapeHtml = (str) => str.replace(/[&<>"']/g, (m) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
})[m])
res.send(`<h1>Hello ${escapeHtml(req.query.name)}</h1>`)
```

## Tools & Commands

### Dependency Scanning
```bash
# Node.js
npm audit
npm audit fix

# Python
pip-audit
safety check

# General
snyk test
```

### Static Analysis
```bash
# JavaScript/TypeScript
npx eslint --ext .js,.ts . --plugin security

# Python
bandit -r .

# Multi-language
semgrep --config=auto .
```

### Secret Scanning
```bash
# Scan for secrets in git history
truffleHog --regex --entropy=True .

# GitLeaks
gitleaks detect
```

## Severity Levels

- **Critical**: Immediate exploitation possible, high impact (RCE, auth bypass)
- **High**: Easy to exploit, significant impact (data exposure, privilege escalation)
- **Medium**: Requires conditions, moderate impact (CSRF, info disclosure)
- **Low**: Hard to exploit or low impact (verbose errors, missing headers)

## Remediation Priorities

1. **Critical**: Fix immediately
2. **High**: Fix within 1 week
3. **Medium**: Fix within 1 month
4. **Low**: Fix in next release cycle

## References

- OWASP Top 10: https://owasp.org/www-project-top-ten/
- CWE Top 25: https://cwe.mitre.org/top25/
- OWASP Cheat Sheets: https://cheatsheetseries.owasp.org/

## Example Audit Report Structure

```markdown
# Security Audit Report

**Date:** YYYY-MM-DD
**Auditor:** [Name]
**Scope:** [Application/Module]

## Executive Summary
[Brief overview of findings]

## Findings

### Critical

#### 1. [Vulnerability Name]
- **Severity:** Critical
- **Location:** `file.js:123`
- **Description:** [What the vulnerability is]
- **Impact:** [What an attacker can do]
- **Proof of Concept:** [How to exploit]
- **Remediation:** [How to fix]

### High
[...]

### Medium
[...]

### Low
[...]

## Recommendations
1. [Priority recommendation]
2. [...]

## Conclusion
[Overall security posture assessment]
```
