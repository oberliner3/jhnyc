# Experience Tracking Setup Guide

This guide will help you set up the complete experience tracking system for your Originz application.

## 📋 Prerequisites

- Supabase project set up and running
- Environment variables configured
- Next.js application deployed or running locally

## 🗃️ Database Setup

### Step 1: Run the Migration

1. Open your Supabase dashboard
2. Navigate to **SQL Editor**
3. Copy the contents of `supabase/migrations/20241222_experience_tracking.sql`
4. Paste and execute the SQL migration

This will create:
- **Tables**: `experience_tracks`, `user_sessions`, `user_journeys`, `performance_metrics`
- **Functions**: Analytics and insight functions
- **Triggers**: Automatic session updates and data cleanup
- **Policies**: Row Level Security (RLS) for data protection

### Step 2: Verify Tables Creation

After running the migration, verify the tables were created:

```sql
-- Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('experience_tracks', 'user_sessions', 'user_journeys', 'performance_metrics');

-- Check table structures
\d experience_tracks
\d user_sessions  
\d user_journeys
\d performance_metrics
```

## 🔧 Environment Variables Setup

### Required Variables

Add these to your `.env.local` file:

```bash
# Supabase Configuration (existing)
NEXT_PUBLIC_SUPABASE_URL="your_supabase_url"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your_supabase_anon_key"

# Required for Experience Tracking (SERVER-SIDE ONLY)
SUPABASE_SERVICE_ROLE_KEY="your_service_role_key"

# Experience Tracking Configuration (Optional)
NEXT_PUBLIC_EXPERIENCE_TRACKING_ENABLED=true
NEXT_PUBLIC_EXPERIENCE_TRACKING_SAMPLE_RATE=1.0
NEXT_PUBLIC_EXPERIENCE_TRACKING_DEBUG=false
```

### Finding Your Service Role Key

1. Go to your Supabase dashboard
2. Navigate to **Settings** → **API**
3. Find the **service_role** key in the **Project API keys** section
4. Copy the key and add it to your environment variables

**⚠️ SECURITY WARNING**: The service role key bypasses RLS. Never expose it on the client-side!

## 🚀 Application Integration

The experience tracking system is already integrated into your application:

### ✅ Automatic Tracking

The system automatically tracks:
- **Page views** when components mount
- **Navigation clicks** in headers and menus
- **Product interactions** (views, clicks, add-to-cart)
- **Form submissions** with success/failure tracking
- **User journeys** through conversion funnels
- **Performance metrics** (Core Web Vitals)
- **JavaScript errors** for debugging

### ✅ Components with Tracking

- `ProductCard` - Product engagement tracking
- `Header` - Navigation and search tracking
- `DraftOrderForm` - Form interaction tracking
- All components wrapped with `ExperienceTrackingProvider`

## 🧪 Testing the System

### 1. Start Your Application

```bash
pnpm dev
# or
npm run dev
```

### 2. Check Console Logs

With debug mode enabled (`NEXT_PUBLIC_EXPERIENCE_TRACKING_DEBUG=true`), you should see:

```
🎯 Experience Tracker initialized { sessionId: 'exp_...', anonymousId: 'exp_anon_...', config: {...} }
📊 Tracked event: { eventType: 'page_view', eventName: 'page_view', ... }
📤 Events sent successfully: { success: true, eventsProcessed: 1, batchId: '...' }
```

### 3. Verify Database Records

Check your Supabase database:

```sql
-- Check recent experience tracks
SELECT * FROM experience_tracks 
ORDER BY created_at DESC 
LIMIT 10;

-- Check active sessions
SELECT * FROM user_sessions 
WHERE is_active = true 
ORDER BY last_activity_at DESC;

-- Check user journeys
SELECT * FROM user_journeys 
ORDER BY created_at DESC 
LIMIT 5;
```

### 4. Test User Interactions

Perform these actions on your application:
- Navigate between pages
- Click on products
- Add items to cart
- Use the search function
- Submit a form
- Trigger an error (invalid form data)

Each action should create records in the database.

## 📊 Analytics Dashboard

### Available Analytics Functions

The migration includes several pre-built analytics functions:

```sql
-- Get session insights for the last 7 days
SELECT * FROM get_session_insights('7 days'::interval);

-- Get funnel conversion rates
SELECT * FROM get_funnel_conversion_rate('signup');

-- Get performance insights
SELECT * FROM get_performance_insights('24 hours'::interval);

-- Get bounce rate analysis
SELECT * FROM get_bounce_rate_analysis('7 days'::interval);
```

### Custom Queries Examples

```sql
-- Most popular pages
SELECT 
  page_url,
  COUNT(*) as views,
  COUNT(DISTINCT session_id) as unique_sessions
FROM experience_tracks 
WHERE event_type = 'page_view' 
  AND created_at > NOW() - INTERVAL '7 days'
GROUP BY page_url 
ORDER BY views DESC;

-- Product engagement analysis
SELECT 
  product_id,
  COUNT(CASE WHEN event_name = 'product_view' THEN 1 END) as views,
  COUNT(CASE WHEN event_name = 'add_to_cart' THEN 1 END) as adds_to_cart,
  ROUND(
    COUNT(CASE WHEN event_name = 'add_to_cart' THEN 1 END)::numeric / 
    NULLIF(COUNT(CASE WHEN event_name = 'product_view' THEN 1 END), 0) * 100, 
    2
  ) as conversion_rate
FROM experience_tracks 
WHERE product_id IS NOT NULL
GROUP BY product_id 
ORDER BY views DESC;

-- User journey drop-off analysis
SELECT 
  journey_type,
  journey_step,
  step_order,
  COUNT(*) as started,
  COUNT(CASE WHEN completed = true THEN 1 END) as completed,
  ROUND(
    COUNT(CASE WHEN completed = true THEN 1 END)::numeric / 
    COUNT(*) * 100, 
    2
  ) as completion_rate
FROM user_journeys 
GROUP BY journey_type, journey_step, step_order 
ORDER BY journey_type, step_order;
```

## 🔒 Privacy & Compliance

### Built-in Privacy Features

- **Do Not Track** respect (`respectDNT: true`)
- **IP Anonymization** (`anonymizeIPs: true`)
- **Sampling** for reduced data collection
- **RLS Policies** for data security
- **Automatic cleanup** of old data (30 days)

### GDPR/CCPA Compliance

The system includes features to help with privacy compliance:

```javascript
// Disable tracking for users who opt out
<ExperienceTrackingProvider disabled={user.hasOptedOut}>
  {children}
</ExperienceTrackingProvider>
```

## 🛠️ Troubleshooting

### Common Issues

1. **No events in database**
   - Check service role key is set correctly
   - Verify API routes are accessible
   - Check browser network tab for errors
   - Enable debug mode to see console logs

2. **TypeScript errors**
   - Ensure all types are imported from `@/lib/experience-tracking/types`
   - Check that event properties match interfaces

3. **Performance issues**
   - Reduce sample rate for high-traffic sites
   - Increase debounce timeouts
   - Disable unnecessary tracking features

### Debug Mode

Enable debug mode to see detailed logging:

```bash
NEXT_PUBLIC_EXPERIENCE_TRACKING_DEBUG=true
```

This will log:
- Tracker initialization
- Every tracked event
- API request/response details
- Error messages

## 📈 Next Steps

1. **Set up monitoring** for your tracking system
2. **Create custom dashboards** using the analytics functions
3. **Set up alerts** for tracking errors or unusual patterns
4. **A/B test** different UI elements using the tracking data
5. **Optimize conversion funnels** based on journey analytics

## 🆘 Support

If you encounter issues:

1. Check the [troubleshooting section](#-troubleshooting)
2. Review the comprehensive README in `lib/experience-tracking/README.md`
3. Verify all environment variables are set correctly
4. Test API routes manually using tools like Postman

The experience tracking system is now ready to provide deep insights into user behavior and help optimize your application's performance! 🎯