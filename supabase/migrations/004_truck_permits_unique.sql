-- Deduplicate truck_permits: keep oldest row per (truck_id, permit_requirement_id).
-- Then enforce uniqueness so duplicates cannot be re-inserted.

WITH ranked AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY truck_id, permit_requirement_id
      ORDER BY created_at ASC, id ASC
    ) AS rn
  FROM public.truck_permits
  WHERE permit_requirement_id IS NOT NULL
)
DELETE FROM public.truck_permits tp
WHERE tp.id IN (SELECT id FROM ranked WHERE rn > 1);

CREATE UNIQUE INDEX IF NOT EXISTS truck_permits_truck_requirement_unique
  ON public.truck_permits (truck_id, permit_requirement_id)
  WHERE permit_requirement_id IS NOT NULL;
