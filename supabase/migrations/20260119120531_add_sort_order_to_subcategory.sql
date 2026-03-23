/*
  # Add sort order to subcategory table

  1. Changes
    - Add `sort_order` column to `subcategory` table with default value
    - Update sort_order for Menuiserie subcategories with custom ordering:
      1. Portes d'entrée
      2. Fenêtres
      3. Portes intérieures
      4. Volets
      5. Autre
      6. Other subcategories ordered alphabetically after
*/

-- Add sort_order column with default value
ALTER TABLE subcategory ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 999;

-- Set custom sort order for Menuiserie subcategories
UPDATE subcategory 
SET sort_order = 1 
WHERE subcategory = 'Portes d''entrée' AND category_id = 'a8863264-327f-414d-86ed-586bca12fdc3';

UPDATE subcategory 
SET sort_order = 2 
WHERE subcategory = 'Fenêtres' AND category_id = 'a8863264-327f-414d-86ed-586bca12fdc3';

UPDATE subcategory 
SET sort_order = 3 
WHERE subcategory = 'Portes intérieures' AND category_id = 'a8863264-327f-414d-86ed-586bca12fdc3';

UPDATE subcategory 
SET sort_order = 4 
WHERE subcategory = 'Volets' AND category_id = 'a8863264-327f-414d-86ed-586bca12fdc3';

UPDATE subcategory 
SET sort_order = 5 
WHERE subcategory = 'Autre' AND category_id = 'a8863264-327f-414d-86ed-586bca12fdc3';

-- Set remaining Menuiserie subcategories to appear after the main ones
UPDATE subcategory 
SET sort_order = 10 
WHERE subcategory = 'Portes-fenêtres / Baies' AND category_id = 'a8863264-327f-414d-86ed-586bca12fdc3';

UPDATE subcategory 
SET sort_order = 11 
WHERE subcategory = 'Bardage' AND category_id = 'a8863264-327f-414d-86ed-586bca12fdc3';

UPDATE subcategory 
SET sort_order = 12 
WHERE subcategory = 'Escalier' AND category_id = 'a8863264-327f-414d-86ed-586bca12fdc3';

UPDATE subcategory 
SET sort_order = 13 
WHERE subcategory = 'Rénovation' AND category_id = 'a8863264-327f-414d-86ed-586bca12fdc3';

UPDATE subcategory 
SET sort_order = 14 
WHERE subcategory = 'RénovationMeuble' AND category_id = 'a8863264-327f-414d-86ed-586bca12fdc3';

UPDATE subcategory 
SET sort_order = 15 
WHERE subcategory = 'Terrasse' AND category_id = 'a8863264-327f-414d-86ed-586bca12fdc3';