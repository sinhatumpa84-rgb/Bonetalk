# Security Policy — BoneTalk

BoneTalk is dedicated to building secure, reliable, and accessible assistive communication technology. We appreciate the efforts of security researchers and engineers who help keep our systems and users safe.

---

## Supported Versions

We actively provide security patches and updates for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 2.x     | :white_check_mark: |
| < 2.0   | :x:                |

---

## Reporting a Vulnerability

If you discover a potential security vulnerability within BoneTalk:

1. **Do not create a public issue** on GitHub or discuss the vulnerability publicly.
2. Send an email with a clear reproduction script or proof of concept to **security@bonetalk.ai** (or contact the repository maintainers directly).
3. Include:
   - Type of issue (e.g., XSS, CSRF, Header Misconfiguration, Denial of Service)
   - Component / Route affected
   - Detailed step-by-step instructions to reproduce
   - Potential impact assessment

### Response Targets
- **Initial Acknowledgment:** Within 48 hours.
- **Triage & Status Update:** Within 5 business days.
- **Remediation & Patch Release:** Prioritized based on severity (Critical/High within 7–14 days).

---

## Security Practices & Architecture

### 1. Client-Side Security & Sanitization
- **Strict Data Binding:** All user-controlled text, custom phrase training, and localized strings are rendered via React’s virtual DOM data bindings to prevent DOM-based XSS.
- **Bounded Inputs:** All interactive inputs (e.g. search queries, custom gestures) are bounded in length and stripped of control characters before processing.
- **Storage Resilience:** Local storage interactions (theme, language preference) are wrapped in exception guards and validated against strict whitelists to prevent storage injection and unhandled `DOMException` failures.

### 2. HTTP Security Headers
Production deployments on Vercel or custom edge servers enforce:
- `Content-Security-Policy` (CSP)
- `Strict-Transport-Security` (HSTS) with preloading
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: SAMEORIGIN` (Clickjacking defense)
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy` restricting sensitive browser APIs (camera, microphone, geolocation, payment)

### 3. WebGL & 3D Telemetry
- Three.js WebGL scenes implement context loss/recovery listeners to prevent mobile GPU resource exhaustion.
- Dynamic models and shaders are bundled locally—no untrusted remote URLs or dynamic shader compilation from user input.

### 4. Dependency & Supply Chain Assurance
- Automated `npm audit` and vulnerability scanning.
- Zero known vulnerabilities in production dependency tree.

---

## Responsible Disclosure & Bug Bounty
We ask that researchers adhere to standard responsible disclosure guidelines:
- Give us reasonable time to fix issues before publishing.
- Do not attempt destructive data access, denial of service on production infrastructure, or compromise of user privacy.
