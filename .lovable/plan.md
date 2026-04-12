

# Fix: Posts appearing in both "Top Posts" and "Needs Work" tabs

## Problem
With only 4 posts, `sortedPosts.slice(0, 5)` returns all 4 posts, and `sortedPosts.slice(-5)` also returns all 4. Every post shows up in both tabs.

## Fix

**File: `src/components/report/PostsTabView.tsx`**

1. **Split posts into non-overlapping sets** — divide sorted posts at the midpoint:
   - Top half goes to "Top Posts"
   - Bottom half goes to "Needs Work"
   - If only 1 post, show it in "Top Posts" only and hide the "Needs Work" tab

2. **Show ALL relevant "why" hints instead of just the first one** — currently `generateWhyItWorked` returns only `hints[0]`. Change it to return all matched hints joined together so the user gets a full explanation.

3. **Improve "Needs Work" hints** to be more actionable:
   - Add hints for low comments, low shares ratio, low reach
   - Suggest specific improvements (e.g., "Add visuals to boost engagement", "Ask a question to drive comments")

### Splitting logic
```
const midpoint = Math.ceil(sortedPosts.length / 2);
const topPosts = sortedPosts.slice(0, midpoint);
const bottomPosts = sortedPosts.slice(midpoint);
// If only 1 post total, bottomPosts will be empty — hide "Needs Work" tab
```

This ensures no post ever appears in both tabs regardless of total count.

