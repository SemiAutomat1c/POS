-- Add subscription_tier column to stores table
ALTER TABLE public.stores
ADD COLUMN subscription_tier subscription_tier NOT NULL DEFAULT 'free';

-- Update existing stores to have a default subscription tier
UPDATE public.stores
SET subscription_tier = 'free'
WHERE subscription_tier IS NULL; 