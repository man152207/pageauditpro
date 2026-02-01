

# Facebook Login मा सबै Permissions Request गर्ने Plan

## समस्या

- अहिले "Continue with Facebook" मा केवल `email` scope request हुँदैछ
- तपाईंले `pages_show_list`, `pages_read_engagement`, `pages_read_user_content`, `read_insights` पनि Login मा नै request गर्न चाहनुहुन्छ
- यी page permissions अझै "Ready for testing" मा छन्, जसले "App needs at least one supported permission" error दिन सक्छ

---

## Technical Solution

### 1. facebook-auth-login Edge Function Update

**File:** `supabase/functions/facebook-auth-login/index.ts`

Line ~120 मा scope update गर्ने:

```typescript
// Before (current)
const scopes = ["email"].join(",");

// After (with all permissions)
const scopes = [
  "email",
  "pages_show_list",
  "pages_read_engagement",
  "pages_read_user_content",
  "read_insights"
].join(",");
```

### 2. Debug Logging Improve

Auth URL generation मा better logging add गर्ने ताकि exact URL verify गर्न सकियोस्।

---

## Important Warning

`pages_*` र `read_insights` permissions अझै **"Ready for testing"** status मा छन्। यसको मतलब:

- केवल App Admins/Developers/Testers ले यी permissions प्रयोग गर्न सक्छन्
- Normal users ले "App needs at least one supported permission" error पाउनेछन्
- **Production users को लागि App Review submit गरेर Advanced Access लिनुपर्छ**

### Temporary Workaround (Testing को लागि)

तपाईं App Role मा add भएको account ले test गर्दा, यो काम गर्नुपर्छ।

---

## Implementation Steps

1. **Edge Function Update:** `facebook-auth-login` मा scope array expand गर्ने
2. **Deploy:** Edge function redeploy गर्ने
3. **Test:** App admin/tester account ले "Continue with Facebook" test गर्ने
4. **Verify:** OAuth dialog मा सबै permissions देखिन्छ कि check गर्ने

---

## Meta Console Requirement (Production को लागि)

Production users को लागि यी permissions को Advanced Access चाहिन्छ:

| Permission | Current Status | Required Status | Action |
|------------|----------------|-----------------|--------|
| email | Standard Access | Standard Access | Done |
| pages_show_list | Ready for testing | Advanced Access | Submit App Review |
| pages_read_engagement | Ready for testing | Advanced Access | Submit App Review |
| pages_read_user_content | Ready for testing | Advanced Access | Submit App Review |
| read_insights | Ready for testing | Advanced Access | Submit App Review |

---

## Expected Result After Implementation

1. "Continue with Facebook" click गर्दा Facebook OAuth dialog खुल्छ
2. Dialog मा सबै permissions देखिन्छ (email, pages_show_list, etc.)
3. User approve गरेपछि login complete हुन्छ
4. User को pages access token पनि पाइन्छ

