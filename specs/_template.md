# Spec: [Feature Name]

**Status:** [ ] pending / [~] in progress / [x] done  
**File:** `src/filename.js`  
**Depends on:** _(list other spec files this one needs first)_

---

## Dependencies (imports)

```js
// list exact import statements Gemma should put at top of file
```

## Exports

List every function/variable this file must export:

- `functionName(param: type): returnType` — one-line description

## Behavior

### `functionName(param)`

What it does, step by step:
1. ...
2. ...

Edge cases:
- If X is null → return Y
- If array is empty → return []

## Example

```js
// show a usage example
const result = functionName(input);
// result === expected
```

## Do NOT (always include these in every spec)

- Do NOT define `window.DevTools.TOOLID` more than once in the file — no stub + real definition pattern
- Do NOT wire events inside `DOMContentLoaded` — the DOM is already loaded when render() is called
- Do NOT define functions outside the `window.DevTools` object registration block

## Tool-specific Do NOT

- Do not use fetch/async in this file
- Do not import anything not listed above
- Do not create helper functions not listed in Exports
