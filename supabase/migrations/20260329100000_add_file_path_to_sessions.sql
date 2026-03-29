-- Migration: Add file_path column to analysis_sessions
-- Author: Antigravity AI
-- Date: 2026-03-29

DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'analysis_sessions' 
        AND column_name = 'file_path'
    ) THEN 
        ALTER TABLE public.analysis_sessions ADD COLUMN file_path TEXT;
        COMMENT ON COLUMN public.analysis_sessions.file_path IS 'Path to the uploaded resume file in storage.';
    END IF;
END $$;
