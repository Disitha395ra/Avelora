-- Add layout_metadata to events for visual grid builder
ALTER TABLE events ADD COLUMN IF NOT EXISTS layout_metadata JSONB DEFAULT '{}'::jsonb;
