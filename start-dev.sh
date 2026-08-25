#!/bin/bash
# Persistent dev server launcher for FusionFlow ERP (Neon PostgreSQL)
cd /home/z/my-project
pkill -f "next dev" 2>/dev/null
sleep 2
export NODE_OPTIONS="--max-old-space-size=3072"
export DATABASE_URL="postgresql://neondb_owner:npg_UN3xrIYVPhE5@ep-purple-recipe-awvh2gwy-pooler.c-12.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
export NEON_DIRECT_URL="postgresql://neondb_owner:npg_UN3xrIYVPhE5@ep-purple-recipe-awvh2gwy.c-12.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
export NEON_HOST_POOLER="ep-purple-recipe-awvh2gwy-pooler.c-12.us-east-1.aws.neon.tech"
export NEON_HOST_DIRECT="ep-purple-recipe-awvh2gwy.c-12.us-east-1.aws.neon.tech"
export NEON_USER="neondb_owner"
export NEON_PASS="npg_UN3xrIYVPhE5"
exec /home/z/my-project/node_modules/.bin/next dev -p 3000
