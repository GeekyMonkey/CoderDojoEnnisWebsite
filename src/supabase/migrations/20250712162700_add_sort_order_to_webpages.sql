-- Add sort_order column to webPages table
ALTER TABLE monkeyschool.webPages 
ADD COLUMN sort_order SMALLINT DEFAULT 0;

-- Create index for better performance when ordering by sort_order
CREATE INDEX idx_webpages_sort_order ON monkeyschool.webPages(sort_order);

-- Update existing records to have sort_order = 0 (already handled by DEFAULT, but being explicit)
UPDATE monkeyschool.webPages SET sort_order = 0 WHERE sort_order IS NULL;
