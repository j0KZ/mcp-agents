---
name: webapp-testing
description: Toolkit for testing local web applications using Playwright. Use when verifying frontend functionality, debugging UI behavior, capturing browser screenshots, or viewing browser logs.
---

# Web Application Testing

This skill provides guidance for testing web applications using Playwright for browser automation.

## When to Use This Skill

- Verifying frontend functionality works correctly
- Debugging UI behavior and interactions
- Capturing screenshots for documentation or debugging
- Testing form submissions and user flows
- Checking responsive design across viewports
- Validating API integrations from the frontend

## What This Skill Does

1. **Browser Automation**: Controls headless Chrome/Chromium for testing
2. **Screenshot Capture**: Takes full-page or element screenshots
3. **Form Testing**: Fills forms and validates submissions
4. **Network Inspection**: Monitors API calls and responses
5. **Console Logging**: Captures browser console output
6. **Responsive Testing**: Tests across different viewport sizes

## Decision Tree: Choosing Your Approach

```
User task → Is it static HTML?
    ├─ Yes → Read HTML file directly to identify selectors
    │         ├─ Success → Write Playwright script using selectors
    │         └─ Fails/Incomplete → Treat as dynamic (below)
    │
    └─ No (dynamic webapp) → Is the server already running?
        ├─ No → Start the server first, then run Playwright
        │
        └─ Yes → Reconnaissance-then-action:
            1. Navigate and wait for networkidle
            2. Take screenshot or inspect DOM
            3. Identify selectors from rendered state
            4. Execute actions with discovered selectors
```

## Basic Playwright Script

```python
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    # Always launch chromium in headless mode
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()

    # Navigate to the application
    page.goto('http://localhost:3000')

    # CRITICAL: Wait for JavaScript to execute
    page.wait_for_load_state('networkidle')

    # Take a screenshot
    page.screenshot(path='/tmp/screenshot.png', full_page=True)

    # Your automation logic here
    # ...

    browser.close()
```

## Reconnaissance-Then-Action Pattern

### Step 1: Inspect the Rendered DOM

```python
# Take a screenshot first
page.screenshot(path='/tmp/inspect.png', full_page=True)

# Get the full page content
content = page.content()

# Find all buttons
buttons = page.locator('button').all()
for btn in buttons:
    print(f"Button: {btn.text_content()}")

# Find all links
links = page.locator('a').all()
for link in links:
    print(f"Link: {link.get_attribute('href')}")
```

### Step 2: Identify Selectors

From inspection results, identify the best selectors:
- Prefer `data-testid` attributes if available
- Use `text=` for button text matching
- Use `role=` for ARIA roles
- Fall back to CSS selectors

### Step 3: Execute Actions

```python
# Click a button by text
page.click('text=Submit')

# Fill a form field
page.fill('input[name="email"]', 'user@example.com')

# Select from dropdown
page.select_option('select#country', 'US')

# Wait for element to appear
page.wait_for_selector('.success-message')
```

## Common Tasks

### Form Testing

```python
# Fill and submit a login form
page.fill('#email', 'test@example.com')
page.fill('#password', 'password123')
page.click('button[type="submit"]')

# Wait for navigation or response
page.wait_for_url('**/dashboard')
```

### Screenshot Comparison

```python
# Full page screenshot
page.screenshot(path='full-page.png', full_page=True)

# Element screenshot
page.locator('.hero-section').screenshot(path='hero.png')

# Specific viewport
page.set_viewport_size({'width': 375, 'height': 667})  # iPhone SE
page.screenshot(path='mobile.png')
```

### Console Log Capture

```python
# Capture console messages
def handle_console(msg):
    print(f"Console {msg.type}: {msg.text}")

page.on('console', handle_console)

# Also capture errors
def handle_error(error):
    print(f"Page error: {error}")

page.on('pageerror', handle_error)
```

### Network Request Monitoring

```python
# Monitor API calls
def handle_request(request):
    if '/api/' in request.url:
        print(f"API call: {request.method} {request.url}")

page.on('request', handle_request)

# Monitor responses
def handle_response(response):
    if '/api/' in response.url:
        print(f"Response: {response.status} {response.url}")

page.on('response', handle_response)
```

## Best Practices

### Wait Strategies

```python
# Wait for network to be idle (best for SPAs)
page.wait_for_load_state('networkidle')

# Wait for specific element
page.wait_for_selector('.content-loaded')

# Wait for specific text
page.wait_for_selector('text=Welcome back')

# Timeout for slow operations
page.wait_for_selector('.data-table', timeout=30000)
```

### Selector Best Practices

```python
# Preferred: data-testid (explicit for testing)
page.click('[data-testid="submit-button"]')

# Good: Role-based selectors (accessibility)
page.click('role=button[name="Submit"]')

# Good: Text-based (user-centric)
page.click('text=Submit')

# OK: CSS selectors (when others unavailable)
page.click('.btn-primary')

# Avoid: Fragile selectors
# page.click('div:nth-child(3) > span')  # Will break easily
```

### Error Handling

```python
try:
    page.click('button.submit', timeout=5000)
except TimeoutError:
    # Take screenshot for debugging
    page.screenshot(path='/tmp/error-state.png')
    print("Submit button not found - see error-state.png")
```

## Common Pitfalls

| Pitfall | Solution |
|---------|----------|
| DOM not ready | Wait for `networkidle` before inspection |
| Element not found | Check if it's in an iframe or shadow DOM |
| Flaky tests | Add explicit waits, avoid arbitrary `time.sleep()` |
| Stale selectors | Use stable attributes like `data-testid` |
| Popup blockers | Configure browser context to allow popups |

## WITH MCP Tools

If you have MCP tools available:

```
"Test the login flow on localhost:3000 and capture screenshots"
```

The webapp-testing MCP tool will handle server management and Playwright execution.

## WITHOUT MCP Tools

Run Playwright directly:

```bash
# Install Playwright
pip install playwright
playwright install chromium

# Run your test script
python test_webapp.py
```

## Installation

```bash
# Python
pip install playwright
playwright install chromium

# Node.js
npm install playwright
npx playwright install chromium
```

## Tips

- Always use headless mode (`headless=True`) for automation
- Take screenshots at key points for debugging
- Use `networkidle` wait state for dynamic apps
- Capture console logs to catch JavaScript errors
- Test on multiple viewport sizes for responsive design
- Close the browser when done to free resources
