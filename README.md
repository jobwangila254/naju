# Naju Poultry Website

A fast, modern website for Naju Poultry built with HTML5, TailwindCSS, Supabase, and hosted on Vercel.

## Features

### Public Website
- **Home Page**: Hero section, featured products, 3-step process, company values
- **Products Page**: Dynamic product catalog with category filtering
- **Delivery Page**: Delivery areas, fee structure, and request form
- **About Page**: Company story, mission, values, and farm information
- **Contact Page**: Contact form, business hours, FAQ section

### Admin Panel
- **Dashboard**: Overview with statistics and recent activity
- **Product Management**: Add, edit, delete products with stock tracking
- **Delivery Requests**: Manage and track delivery orders
- **Contact Messages**: View and manage customer inquiries
- **Authentication**: Supabase Auth (email/password)

## Tech Stack

- **Frontend**: HTML5, TailwindCSS (CDN), Vanilla JavaScript
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **Hosting**: Vercel
- **Icons**: Font Awesome (CDN)
- **Design**: Mobile-first responsive design
- **PWA**: Service worker with offline fallback

## Project Structure

```
naju-poultry/
├── index.html          # Home page
├── products.html       # Products catalog
├── delivery.html       # Delivery information and form
├── about.html          # About us page
├── contact.html        # Contact page with form
├── admin.html          # Admin panel
├── offline.html        # Offline fallback page
├── 404.html            # Custom 404 page
├── sw.js               # Service worker
├── manifest.json       # PWA manifest
├── vercel.json         # Vercel deployment config
├── robots.txt          # SEO robots
├── sitemap.xml         # XML sitemap
├── js/
│   └── supabase.js     # Supabase client initialization
├── sql/
│   └── schema.sql      # Database schema + RLS policies
└── images/             # Image assets
```

## Setup Instructions

### 1. Supabase Setup
1. Create a new Supabase project at https://supabase.com
2. Run the SQL from `sql/schema.sql` in the Supabase SQL Editor
3. Get your Supabase URL and anon key from Project Settings > API
4. Update `js/supabase.js` with your credentials:
   ```javascript
   const SUPABASE_URL = 'https://your-project.supabase.co';
   const SUPABASE_ANON_KEY = 'your-anon-key';
   ```

### 2. Admin User
Create an admin user in Supabase Auth:
1. Go to Authentication > Users in Supabase dashboard
2. Click "Add User" and create an admin account
3. Use these credentials to log in at `/admin.html`

### 3. Vercel Deployment
1. Push the repository to GitHub
2. Import the project in Vercel
3. No build command needed - it's a static site
4. Deploy!

## Database Schema

### Products Table
- `id` (bigint, primary key)
- `name` (text)
- `description` (text)
- `price` (numeric)
- `category` (text: eggs, chicks, live, dressed, feed)
- `unit` (text)
- `stock` (integer)
- `image_url` (text)
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

### Delivery Requests Table
- `id` (bigint, primary key)
- `customer_name` (text)
- `phone` (text)
- `address` (text)
- `preferred_date` (text)
- `preferred_time` (text)
- `product_interest` (text)
- `notes` (text)
- `status` (text: pending, contacted, delivered, cancelled)
- `created_at` (timestamptz)

### Contact Messages Table
- `id` (bigint, primary key)
- `name` (text)
- `email` (text)
- `phone` (text)
- `message` (text)
- `status` (text: new, read)
- `created_at` (timestamptz)

## Security

- Row Level Security (RLS) is enabled on all tables
- Public users can only insert into contact_messages and delivery_requests
- Products are publicly readable
- Admin operations require Supabase authentication
- Security headers configured via Vercel
- No hardcoded credentials in source code

## Deployment

Deploy to Vercel:
```bash
vercel --prod
```
Or connect your GitHub repository for automatic deployments.

## Color Scheme
- Warm Brown (#8B4513) - Headers
- Warm Orange (#F4A460) - Buttons
- Fresh Green (#2E7D32) - Accents
- Cream (#FFF8E7) - Background
