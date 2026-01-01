# 🎯 QUICK VISUAL GUIDE - WHAT TO CHANGE

## Find This Code (around line 240):

```javascript
const getAIFeedback = async (question, expectedAnswer, userAnswer) => {
  // ... some code here ...
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {  ← CHANGE THIS
      method: 'POST',
      headers: { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },  ← CHANGE THIS
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',  ← ADD LINE BEFORE THIS
```

## Change It To This:

```javascript
const getAIFeedback = async (question, expectedAnswer, userAnswer) => {
  // ... same code ...
  try {
    const response = await fetch('/api/claude-proxy', {  ← CHANGED URL
      method: 'POST',
      headers: { 'content-type': 'application/json' },  ← REMOVED STUFF
      body: JSON.stringify({
        apiKey: apiKey,  ← ADDED THIS LINE
        model: 'claude-sonnet-4-20250514',  ← SAME
```

---

## 3 Changes Total:

1. **Line 1:** `'https://api.anthropic.com/v1/messages'` → `'/api/claude-proxy'`
2. **Line 2:** Delete `'x-api-key': apiKey, 'anthropic-version': '2023-06-01',`
3. **Line 3:** Add `apiKey: apiKey,` as first item in body

---

## How to Find It:

1. Press **Cmd+F** (Mac) or **Ctrl+F** (Windows)
2. Search for: `fetch('https://api.anthropic.com`
3. Should find **EXACTLY ONE** match
4. Change those 3 things
5. **DONE!**

---

That's it! Save and deploy! 🚀
