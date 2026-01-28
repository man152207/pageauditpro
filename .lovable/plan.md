
Goal
- Fix pagelyzer.io/pricing (and all other React routes) returning “LiteSpeed 404” only on hard reload (Ctrl+Shift+R), while normal in-app navigation works.

Root cause (why it happens)
- Your app is a React SPA (Vite + react-router-dom).
- When you click links, routing happens in the browser (client-side), so it “works”.
- On a hard reload, the browser forces a fresh request to the server for /pricing.
- LiteSpeed tries to find a real file/folder at /pricing. It doesn’t exist, so LiteSpeed returns its own server 404 page.
- A normal refresh may still show the page because the browser can reuse cached index.html/assets; Ctrl+Shift+R bypasses cache, exposing the server misconfiguration.

Production-ready fix (LiteSpeed / cPanel)
- Configure “History API Fallback” on the server: rewrite any non-file request to /index.html.
- On LiteSpeed/Apache hosting, the standard, reliable way is a root .htaccess rewrite (or equivalent vhost rules).

What I will implement in the codebase (so it ships with every deploy)
1) Add a SPA rewrite .htaccess into the build output
   - Create: public/.htaccess
   - This file will be copied into dist/.htaccess during `vite build` (public directory is copied to dist).
   - Contents (robust SPA fallback; preserves real files like assets, favicon, robots.txt):
     - Enable RewriteEngine
     - If the request matches an existing file (-f) or directory (-d), serve it normally
     - Otherwise rewrite everything to /index.html

   Proposed .htaccess rules:
   ```apache
   <IfModule mod_rewrite.c>
     RewriteEngine On
     RewriteBase /

     # If requesting an actual existing file or directory, serve it
     RewriteCond %{REQUEST_FILENAME} -f [OR]
     RewriteCond %{REQUEST_FILENAME} -d
     RewriteRule ^ - [L]

     # SPA fallback: everything else goes to index.html
     RewriteRule . /index.html [L]
   </IfModule>

   # Optional safety: if rewrites are disabled for some reason, still fallback
   ErrorDocument 404 /index.html
   ```

   Notes:
   - This will make /pricing reload-safe (including Ctrl+Shift+R), and also /features, /faq, /dashboard/*, /super-admin/*, etc.
   - Intentionally missing routes will still show your React NotFound page (because React router will render 404 UI inside the SPA), but the server will return index.html (HTTP status may still be 200 unless you implement SSR; for SPA that’s normal).

2) Add a CI verification so we never “forget” the rewrite file again
   - Update: .github/workflows/deploy-ftp.yml
   - After build, verify dist/.htaccess exists:
     - `test -f dist/.htaccess || (echo ".htaccess missing in dist" && exit 1)`
   - This ensures future deployments can’t break hard reload.

3) Deployment/hosting considerations (to avoid surprises)
   - Confirm your deployment target directory is the actual web root (often public_html). Your workflow uploads dist/ to server-dir: /. If that maps correctly in your hosting, fine. If not, adjust server-dir to the correct path (commonly /public_html/).
   - Ensure .htaccess is allowed by the host (AllowOverride enabled). On most cPanel + LiteSpeed setups it is.
   - If LiteSpeed cache is enabled, purge cache after deployment (hard reload behavior can be confusing otherwise).

Testing checklist (what you should test after this ships)
1) Hard reload tests (Ctrl+Shift+R / Ctrl+F5)
   - https://pagelyzer.io/pricing
   - https://pagelyzer.io/features
   - https://pagelyzer.io/faq
   - https://pagelyzer.io/contact
   - https://pagelyzer.io/privacy-policy
   - https://pagelyzer.io/terms-of-service
   - https://pagelyzer.io/super-admin/settings/webhooks (after login)

2) Direct paste tests (new incognito window)
   - Paste each URL directly (no prior navigation) and confirm it loads.

3) Static assets still served correctly
   - https://pagelyzer.io/robots.txt should still load as a plain text file
   - favicon and JS/CSS assets should load normally (Network tab shows 200 for assets)

Edge cases / risks and how we handle them
- Existing .htaccess on the server (WordPress, other rules):
  - If your server already has a .htaccess, we must merge rules rather than overwrite.
  - Because your deploy uploads dist/ to server root, it may overwrite the existing .htaccess. If you rely on existing rules, we should coordinate the final merged .htaccess content.
- If AllowOverride is disabled:
  - .htaccess won’t work; then the fix must be done in the server’s vhost config. (Still solvable, but requires hosting control panel / admin access.)
- Some hosts block ErrorDocument 404 /index.html with rewrites:
  - The RewriteRule solution alone is usually sufficient.

Deliverables
- public/.htaccess (new)
- .github/workflows/deploy-ftp.yml updated to verify dist/.htaccess exists
- Post-deploy verification steps documented (above)

Result
- /pricing (and all other React routes) will no longer produce a LiteSpeed “404 Not Found” on Ctrl+Shift+R.
- The SPA will be reload-safe in production, as required.
