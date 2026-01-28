-- Remove duplicate settings entries keeping only the most recent (highest id)
DELETE FROM settings a
USING settings b
WHERE a.id < b.id
AND a.key = b.key
AND a.scope = b.scope
AND a.scope_id IS NOT DISTINCT FROM b.scope_id;