# Lab: Spatial Data Import, SQL Analysis & Django Integration
## CMPU4058 - Advanced Web Mapping - Week 2
**Duration:** 3 hours  
**Difficulty:** Intermediate to Advanced  
**Type:** Problem-Based Learning

## Learning Objectives
By the end of this lab, students will be able to:
1. Install and configure GDAL/OGR tools for spatial data processing
2. Import shapefiles into PostGIS using ogr2ogr command-line tool
3. Write and execute basic to intermediate spatial SQL queries
4. Connect Django to PostGIS databases containing real spatial data
5. Configure Django admin interface to display and manage spatial data
6. Analyze spatial relationships using PostGIS functions
7. Create data-driven web applications with real geographic datasets

## Problem Scenario
You are a GIS analyst at "Dublin City Planning Department," and your team has been tasked with analyzing urban development patterns and transportation networks. The department has provided you with several spatial datasets:

- **Dublin Administrative Boundaries** (polygons)
- **Road Network** (lines) 
- **Points of Interest** (points)
- **Land Use Zones** (polygons)

Your mission is to:
1. Import these datasets into your PostGIS database
2. Perform spatial analysis to answer planning questions
3. Create a Django web application to manage and visualize the data
4. Provide insights on urban development patterns through spatial queries

The city council will use your analysis to make informed decisions about future development projects, transportation planning, and resource allocation.

## Prerequisites
- Completion of Week 1 lab (Django + PostGIS setup)
- Basic understanding of SQL queries
- Familiarity with GIS concepts (points, lines, polygons)
- Command-line interface experience

## Required Software
- PostgreSQL with PostGIS (from Week 1)
- GDAL/OGR tools
- Python/Django environment (from Week 1)
- Sample spatial datasets (provided)

---

## Part 1: GDAL/OGR Installation and Dataset Preparation (45 minutes)

### Challenge 1.1: GDAL/OGR Installation

GDAL (Geospatial Data Abstraction Library) is the industry-standard toolkit for reading and writing spatial data. OGR is the vector data component of GDAL.

#### Installation by Platform:

**macOS (using Homebrew):**
```bash
# Install GDAL with all drivers
brew install gdal

# Verify installation
ogr2ogr --version
ogrinfo --version
```

**Ubuntu/Linux:**
```bash
# Update package manager
sudo apt update

# Install GDAL/OGR with development headers
sudo apt install gdal-bin libgdal-dev python3-gdal

# Verify installation
ogr2ogr --version
ogrinfo --version
```

**Windows:**
```bash
# Option 1: Using OSGeo4W installer
# Download from https://trac.osgeo.org/osgeo4w/
# Install complete GDAL package

# Option 2: Using conda (recommended)
conda install -c conda-forge gdal

# Verify installation
ogr2ogr --version
```

#### Test GDAL Installation:
```bash
# List supported formats (should show many formats)
ogr2ogr --formats

# Check specific format support
ogrinfo --format "ESRI Shapefile"
ogrinfo --format "PostgreSQL"
```

### Challenge 1.2: Download and Examine Spatial Datasets

We'll work with real Dublin spatial data for this lab.

#### Create Project Directory:
```bash
# Create lab directory
mkdir dublin_spatial_analysis
cd dublin_spatial_analysis

# Create data directory
mkdir data
cd data
```

#### Download Sample Datasets:

For this lab, we'll create sample Dublin datasets. In a real scenario, you'd download from official sources like Dublin City Council Open Data portal.

**Create Sample Dublin Boundaries (dublin_boundaries.shp):**
```bash
# We'll create this using PostGIS first, then export
# This simulates receiving data from the planning department

# Connect to your PostGIS database from Week 1
psql -h localhost -U map_developer -d hello_map_dublin

# Create sample Dublin administrative areas
CREATE TABLE dublin_admin_areas (
    id SERIAL PRIMARY KEY,
    area_name VARCHAR(100),
    area_type VARCHAR(50),
    population INTEGER,
    area_km2 DECIMAL(10,2),
    geom GEOMETRY(POLYGON, 4326)
);

# Insert sample administrative areas
INSERT INTO dublin_admin_areas (area_name, area_type, population, area_km2, geom) VALUES
('Dublin City Centre', 'City Center', 25000, 5.2, 
 ST_GeomFromText('POLYGON((-6.2800 53.3350, -6.2400 53.3350, -6.2400 53.3650, -6.2800 53.3650, -6.2800 53.3350))', 4326)),
('Temple Bar District', 'Cultural Quarter', 8000, 1.1,
 ST_GeomFromText('POLYGON((-6.2700 53.3430, -6.2600 53.3430, -6.2600 53.3480, -6.2700 53.3480, -6.2700 53.3430))', 4326)),
('Phoenix Park Area', 'Recreational', 15000, 12.5,
 ST_GeomFromText('POLYGON((-6.3400 53.3500, -6.3200 53.3500, -6.3200 53.3600, -6.3400 53.3600, -6.3400 53.3500))', 4326)),
('Docklands', 'Business District', 18000, 3.8,
 ST_GeomFromText('POLYGON((-6.2300 53.3400, -6.2100 53.3400, -6.2100 53.3500, -6.2300 53.3500, -6.2300 53.3400))', 4326)),
('Ballsbridge', 'Residential', 22000, 4.2,
 ST_GeomFromText('POLYGON((-6.2200 53.3250, -6.2000 53.3250, -6.2000 53.3350, -6.2200 53.3350, -6.2200 53.3250))', 4326));

# Create sample road network
CREATE TABLE dublin_roads (
    id SERIAL PRIMARY KEY,
    road_name VARCHAR(100),
    road_type VARCHAR(50),
    speed_limit INTEGER,
    length_meters DECIMAL(10,2),
    geom GEOMETRY(LINESTRING, 4326)
);

# Insert sample roads
INSERT INTO dublin_roads (road_name, road_type, speed_limit, length_meters, geom) VALUES
('O''Connell Street', 'Main Street', 30, 500,
 ST_GeomFromText('LINESTRING(-6.2603 53.3498, -6.2603 53.3548)', 4326)),
('Grafton Street', 'Pedestrian', 0, 400,
 ST_GeomFromText('LINESTRING(-6.2601 53.3398, -6.2601 53.3448)', 4326)),
('Dame Street', 'Main Street', 30, 600,
 ST_GeomFromText('LINESTRING(-6.2703 53.3434, -6.2603 53.3434)', 4326)),
('Quays Road', 'Main Road', 50, 1200,
 ST_GeomFromText('LINESTRING(-6.2803 53.3468, -6.2403 53.3468)', 4326)),
('Ring Road M50', 'Motorway', 100, 2000,
 ST_GeomFromText('LINESTRING(-6.3503 53.3598, -6.2003 53.3298)', 4326));

# Create points of interest
CREATE TABLE dublin_poi (
    id SERIAL PRIMARY KEY,
    poi_name VARCHAR(100),
    poi_type VARCHAR(50),
    visitors_per_day INTEGER,
    rating DECIMAL(3,2),
    geom GEOMETRY(POINT, 4326)
);

# Insert sample POIs
INSERT INTO dublin_poi (poi_name, poi_type, visitors_per_day, rating, geom) VALUES
('Trinity College Library', 'Education', 2500, 4.8,
 ST_GeomFromText('POINT(-6.2603 53.3441)', 4326)),
('Dublin Castle', 'Historic Site', 1800, 4.5,
 ST_GeomFromText('POINT(-6.2674 53.3429)', 4326)),
('Temple Bar Pub', 'Entertainment', 3000, 4.2,
 ST_GeomFromText('POINT(-6.2668 53.3453)', 4326)),
('Phoenix Park Visitor Centre', 'Recreation', 1200, 4.6,
 ST_GeomFromText('POINT(-6.3298 53.3558)', 4326)),
('Dublin Port', 'Transport Hub', 5000, 4.0,
 ST_GeomFromText('POINT(-6.2200 53.3450)', 4326)),
('Dublin Airport Express Stop', 'Transport', 8000, 4.3,
 ST_GeomFromText('POINT(-6.2503 53.3480)', 4326)),
('St. Stephen\'s Green Shopping', 'Commercial', 15000, 4.4,
 ST_GeomFromText('POINT(-6.2580 53.3388)', 4326)),
('Guinness Storehouse', 'Tourist Attraction', 4000, 4.7,
 ST_GeomFromText('POINT(-6.2867 53.3419)', 4326));

# Exit PostgreSQL
\q
```

#### Export Data to Shapefiles:
```bash
# Navigate back to data directory
cd ~/dublin_spatial_analysis/data

# Export tables to shapefiles using ogr2ogr
# This simulates receiving shapefiles from the planning department

# Export administrative boundaries
ogr2ogr -f "ESRI Shapefile" dublin_boundaries.shp \
    PG:"host=localhost user=map_developer dbname=hello_map_dublin password=dublin2025!" \
    -sql "SELECT * FROM dublin_admin_areas"

# Export road network
ogr2ogr -f "ESRI Shapefile" dublin_roads.shp \
    PG:"host=localhost user=map_developer dbname=hello_map_dublin password=dublin2025!" \
    -sql "SELECT * FROM dublin_roads"

# Export points of interest
ogr2ogr -f "ESRI Shapefile" dublin_poi.shp \
    PG:"host=localhost user=map_developer dbname=hello_map_dublin password=dublin2025!" \
    -sql "SELECT * FROM dublin_poi"

# Verify shapefile creation
ls -la *.shp
```

#### Examine Shapefile Contents:
```bash
# Use ogrinfo to examine shapefile structure and contents

# Get basic information about administrative boundaries
ogrinfo dublin_boundaries.shp

# Get detailed information including feature count and extent
ogrinfo -so dublin_boundaries.shp dublin_admin_areas

# View first few features
ogrinfo dublin_boundaries.shp dublin_admin_areas -fid 1

# Examine road network
ogrinfo -so dublin_roads.shp dublin_roads

# Check points of interest
ogrinfo -so dublin_poi.shp dublin_poi

# View attribute information
ogrinfo dublin_poi.shp dublin_poi -sql "SELECT poi_name, poi_type, rating FROM dublin_poi"
```

### Challenge 1.3: Understanding Coordinate Systems and Projections

Before importing data, it's crucial to understand coordinate reference systems (CRS).

#### Check Coordinate Systems:
```bash
# Check CRS of shapefiles
ogrinfo dublin_boundaries.shp dublin_admin_areas -so | grep -i projection

# View full spatial reference system
ogrinfo dublin_boundaries.shp dublin_admin_areas -so | grep -A 10 "Layer SRS WKT"
```

#### Coordinate System Considerations:
- **WGS84 (EPSG:4326)**: Global geographic coordinate system (latitude/longitude)
- **Irish Transverse Mercator (EPSG:2157)**: Official Irish coordinate system
- **Web Mercator (EPSG:3857)**: Common for web mapping applications

---

## Part 2: Shapefile Import with ogr2ogr (45 minutes)

### Challenge 2.1: Database Preparation

Create a new database specifically for this spatial analysis project.

#### Create Analysis Database:
```bash
# Connect to PostgreSQL as superuser
sudo -u postgres psql

# Create new database for spatial analysis
CREATE DATABASE dublin_spatial_analysis;

# Create user for this project
CREATE USER spatial_analyst WITH PASSWORD 'analyst2025!';

# Grant privileges
GRANT ALL PRIVILEGES ON DATABASE dublin_spatial_analysis TO spatial_analyst;

# Connect to new database
\c dublin_spatial_analysis;

# Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;

# Verify PostGIS installation
SELECT PostGIS_Version();

# Exit PostgreSQL
\q
```

### Challenge 2.2: Basic ogr2ogr Import Operations

Now we'll import our shapefiles into the new PostGIS database using various ogr2ogr options.

#### Basic Import Command Structure:
```bash
# General ogr2ogr syntax for PostGIS:
# ogr2ogr -f "PostgreSQL" PG:"connection_string" input_file.shp [options]
```

#### Import Administrative Boundaries:
```bash
# Navigate to data directory
cd ~/dublin_spatial_analysis/data

# Basic import of administrative boundaries
ogr2ogr -f "PostgreSQL" \
    PG:"host=localhost user=spatial_analyst dbname=dublin_spatial_analysis password=analyst2025!" \
    dublin_boundaries.shp \
    -nln admin_boundaries \
    -overwrite

# Verify import
psql -h localhost -U spatial_analyst -d dublin_spatial_analysis -c "SELECT count(*) FROM admin_boundaries;"
```

#### Import with Advanced Options:
```bash
# Import road network with additional options
ogr2ogr -f "PostgreSQL" \
    PG:"host=localhost user=spatial_analyst dbname=dublin_spatial_analysis password=analyst2025!" \
    dublin_roads.shp \
    -nln road_network \
    -overwrite \
    -lco GEOMETRY_NAME=geom \
    -lco SPATIAL_INDEX=YES \
    -lco PRECISION=NO \
    -t_srs EPSG:4326

# Import points of interest with coordinate transformation
ogr2ogr -f "PostgreSQL" \
    PG:"host=localhost user=spatial_analyst dbname=dublin_spatial_analysis password=analyst2025!" \
    dublin_poi.shp \
    -nln points_of_interest \
    -overwrite \
    -lco GEOMETRY_NAME=geom \
    -lco SPATIAL_INDEX=YES \
    -s_srs EPSG:4326 \
    -t_srs EPSG:4326

# Verify all imports
psql -h localhost -U spatial_analyst -d dublin_spatial_analysis -c "
    SELECT 
        table_name,
        column_name,
        data_type 
    FROM information_schema.columns 
    WHERE table_name IN ('admin_boundaries', 'road_network', 'points_of_interest')
    ORDER BY table_name, ordinal_position;
"
```

### Challenge 2.3: Advanced Import Techniques

Learn advanced ogr2ogr techniques for data transformation and filtering.

#### Import with SQL Filtering:
```bash
# Import only high-rated POIs (rating > 4.5)
ogr2ogr -f "PostgreSQL" \
    PG:"host=localhost user=spatial_analyst dbname=dublin_spatial_analysis password=analyst2025!" \
    dublin_poi.shp \
    -nln high_rated_poi \
    -overwrite \
    -where "rating > 4.5" \
    -lco GEOMETRY_NAME=geom

# Import only main roads (speed limit > 30)
ogr2ogr -f "PostgreSQL" \
    PG:"host=localhost user=spatial_analyst dbname=dublin_spatial_analysis password=analyst2025!" \
    dublin_roads.shp \
    -nln major_roads \
    -overwrite \
    -where "speed_limi > 30" \
    -lco GEOMETRY_NAME=geom

# Verify filtered imports
psql -h localhost -U spatial_analyst -d dublin_spatial_analysis -c "
    SELECT 'high_rated_poi' as table_name, count(*) as record_count FROM high_rated_poi
    UNION ALL
    SELECT 'major_roads', count(*) FROM major_roads;
"
```

#### Import with Field Mapping and Transformation:
```bash
# Import with custom field names and data transformation
ogr2ogr -f "PostgreSQL" \
    PG:"host=localhost user=spatial_analyst dbname=dublin_spatial_analysis password=analyst2025!" \
    dublin_boundaries.shp \
    -nln admin_areas_transformed \
    -overwrite \
    -sql "SELECT 
            area_name as district_name,
            area_type as zone_type,
            population,
            area_km2 as area_square_km,
            CASE 
                WHEN population > 20000 THEN 'High Density'
                WHEN population > 15000 THEN 'Medium Density'
                ELSE 'Low Density'
            END as density_class,
            * 
          FROM dublin_admin_areas" \
    -lco GEOMETRY_NAME=geom

# Verify transformation
psql -h localhost -U spatial_analyst -d dublin_spatial_analysis -c "
    SELECT district_name, zone_type, population, density_class 
    FROM admin_areas_transformed 
    ORDER BY population DESC;
"
```

---

## Part 3: Spatial SQL Queries and Analysis (60 minutes)

### Challenge 3.1: Basic Spatial Queries

Connect to your database and start exploring the imported data with spatial SQL.

#### Database Connection and Basic Exploration:
```bash
# Connect to the spatial analysis database
psql -h localhost -U spatial_analyst -d dublin_spatial_analysis
```

```sql
-- Check what tables we have
\dt

-- Examine table structures
\d admin_boundaries
\d road_network
\d points_of_interest

-- Basic record counts
SELECT 
    'admin_boundaries' as table_name, 
    count(*) as records 
FROM admin_boundaries
UNION ALL
SELECT 'road_network', count(*) FROM road_network
UNION ALL
SELECT 'points_of_interest', count(*) FROM points_of_interest;

-- Check coordinate system
SELECT Find_SRID('public', 'admin_boundaries', 'geom');
SELECT Find_SRID('public', 'road_network', 'geom');
SELECT Find_SRID('public', 'points_of_interest', 'geom');
```

#### Geometry Information Queries:
```sql
-- Get geometry types and basic statistics
SELECT 
    area_name,
    ST_GeometryType(geom) as geometry_type,
    ST_Area(geom::geography) / 1000000 as area_km2_calculated,
    ST_Perimeter(geom::geography) / 1000 as perimeter_km
FROM admin_boundaries
ORDER BY area_km2_calculated DESC;

-- Road network statistics
SELECT 
    road_name,
    road_type,
    ST_Length(geom::geography) / 1000 as length_km_calculated,
    length_meters / 1000 as length_km_stored,
    speed_limit
FROM road_network
ORDER BY length_km_calculated DESC;

-- Point coordinates and basic info
SELECT 
    poi_name,
    poi_type,
    ST_X(geom) as longitude,
    ST_Y(geom) as latitude,
    visitors_per_day,
    rating
FROM points_of_interest
ORDER BY visitors_per_day DESC;
```

### Challenge 3.2: Intermediate Spatial Analysis

Now we'll perform more complex spatial analysis to answer planning questions.

#### Spatial Relationships - Points in Polygons:
```sql
-- Find which POIs are in which administrative areas
SELECT 
    a.area_name,
    p.poi_name,
    p.poi_type,
    p.visitors_per_day
FROM admin_boundaries a
JOIN points_of_interest p ON ST_Contains(a.geom, p.geom)
ORDER BY a.area_name, p.visitors_per_day DESC;

-- Count POIs per administrative area
SELECT 
    a.area_name,
    a.area_type,
    COUNT(p.poi_name) as poi_count,
    SUM(p.visitors_per_day) as total_daily_visitors
FROM admin_boundaries a
LEFT JOIN points_of_interest p ON ST_Contains(a.geom, p.geom)
GROUP BY a.area_name, a.area_type
ORDER BY poi_count DESC;

-- Average rating of POIs by area
SELECT 
    a.area_name,
    COUNT(p.poi_name) as poi_count,
    ROUND(AVG(p.rating), 2) as average_rating,
    ROUND(AVG(p.visitors_per_day), 0) as avg_daily_visitors
FROM admin_boundaries a
LEFT JOIN points_of_interest p ON ST_Contains(a.geom, p.geom)
GROUP BY a.area_name
HAVING COUNT(p.poi_name) > 0
ORDER BY average_rating DESC;
```

#### Buffer Analysis:
```sql
-- Find POIs within 500 meters of major roads
SELECT DISTINCT
    p.poi_name,
    p.poi_type,
    r.road_name,
    r.road_type,
    ROUND(ST_Distance(p.geom::geography, r.geom::geography), 0) as distance_meters
FROM points_of_interest p
CROSS JOIN road_network r
WHERE ST_DWithin(p.geom::geography, r.geom::geography, 500)
ORDER BY p.poi_name, distance_meters;

-- Create 1km buffer around high-traffic POIs
SELECT 
    poi_name,
    poi_type,
    visitors_per_day,
    ST_Buffer(geom::geography, 1000)::geometry as buffer_geom
FROM points_of_interest
WHERE visitors_per_day > 3000;

-- Find administrative areas that overlap with POI buffers
WITH poi_buffers AS (
    SELECT 
        poi_name,
        visitors_per_day,
        ST_Buffer(geom::geography, 1000)::geometry as buffer_geom
    FROM points_of_interest
    WHERE visitors_per_day > 3000
)
SELECT 
    pb.poi_name,
    pb.visitors_per_day,
    a.area_name,
    ST_Area(ST_Intersection(a.geom, pb.buffer_geom)::geography) / 1000000 as overlap_area_km2
FROM poi_buffers pb
JOIN admin_boundaries a ON ST_Intersects(a.geom, pb.buffer_geom)
WHERE ST_Area(ST_Intersection(a.geom, pb.buffer_geom)::geography) > 0
ORDER BY pb.visitors_per_day DESC, overlap_area_km2 DESC;
```

### Challenge 3.3: Advanced Spatial Analysis

Perform sophisticated spatial analysis for urban planning insights.

#### Nearest Neighbor Analysis:
```sql
-- Find the nearest POI to each administrative area centroid
SELECT DISTINCT ON (a.area_name)
    a.area_name,
    a.area_type,
    p.poi_name,
    p.poi_type,
    ROUND(ST_Distance(ST_Centroid(a.geom)::geography, p.geom::geography), 0) as distance_meters
FROM admin_boundaries a
CROSS JOIN points_of_interest p
ORDER BY a.area_name, ST_Distance(ST_Centroid(a.geom)::geography, p.geom::geography);

-- Find clusters of POIs (POIs within 500m of each other)
SELECT 
    p1.poi_name as poi_1,
    p2.poi_name as poi_2,
    p1.poi_type as type_1,
    p2.poi_type as type_2,
    ROUND(ST_Distance(p1.geom::geography, p2.geom::geography), 0) as distance_meters
FROM points_of_interest p1
JOIN points_of_interest p2 ON p1.id < p2.id
WHERE ST_DWithin(p1.geom::geography, p2.geom::geography, 500)
ORDER BY distance_meters;
```

#### Road Network Analysis:
```sql
-- Calculate road density per administrative area
SELECT 
    a.area_name,
    a.area_type,
    COUNT(r.road_name) as road_segments,
    ROUND(SUM(ST_Length(ST_Intersection(r.geom, a.geom)::geography)) / 1000, 2) as total_road_km,
    ROUND(SUM(ST_Length(ST_Intersection(r.geom, a.geom)::geography)) / 1000 / a.area_km2, 2) as road_density_km_per_km2
FROM admin_boundaries a
LEFT JOIN road_network r ON ST_Intersects(a.geom, r.geom)
GROUP BY a.area_name, a.area_type, a.area_km2
ORDER BY road_density_km_per_km2 DESC;

-- Find road intersections (simplified - where roads cross administrative boundaries)
SELECT 
    r.road_name,
    r.road_type,
    a.area_name,
    ST_Length(ST_Intersection(r.geom, a.geom)::geography) / 1000 as length_in_area_km
FROM road_network r
JOIN admin_boundaries a ON ST_Intersects(r.geom, a.geom)
WHERE ST_Length(ST_Intersection(r.geom, a.geom)::geography) > 100
ORDER BY r.road_name, length_in_area_km DESC;
```

#### Urban Planning Analysis Queries:
```sql
-- Accessibility Analysis: Areas with good access to services
WITH area_accessibility AS (
    SELECT 
        a.area_name,
        a.population,
        COUNT(p.poi_name) as nearby_services,
        AVG(p.rating) as avg_service_rating,
        SUM(CASE WHEN p.poi_type = 'Transport' THEN 1 ELSE 0 END) as transport_hubs,
        SUM(CASE WHEN p.poi_type = 'Education' THEN 1 ELSE 0 END) as education_facilities,
        SUM(CASE WHEN p.poi_type = 'Recreation' THEN 1 ELSE 0 END) as recreation_facilities
    FROM admin_boundaries a
    LEFT JOIN points_of_interest p ON ST_DWithin(a.geom::geography, p.geom::geography, 1000)
    GROUP BY a.area_name, a.population
)
SELECT 
    area_name,
    population,
    nearby_services,
    ROUND(avg_service_rating, 2) as avg_rating,
    transport_hubs,
    education_facilities,
    recreation_facilities,
    CASE 
        WHEN nearby_services >= 5 AND avg_service_rating >= 4.0 THEN 'Excellent Access'
        WHEN nearby_services >= 3 AND avg_service_rating >= 3.5 THEN 'Good Access'
        WHEN nearby_services >= 2 THEN 'Moderate Access'
        ELSE 'Limited Access'
    END as accessibility_rating
FROM area_accessibility
ORDER BY nearby_services DESC, avg_service_rating DESC;

-- Development Potential Analysis
SELECT 
    a.area_name,
    a.area_type,
    a.population,
    a.area_km2,
    ROUND(a.population / a.area_km2, 0) as population_density,
    COUNT(p.poi_name) as poi_count,
    COUNT(r.road_name) as road_segments,
    CASE 
        WHEN a.population / a.area_km2 < 3000 AND COUNT(p.poi_name) < 2 THEN 'High Development Potential'
        WHEN a.population / a.area_km2 < 5000 AND COUNT(p.poi_name) < 3 THEN 'Moderate Development Potential'
        ELSE 'Limited Development Potential'
    END as development_rating
FROM admin_boundaries a
LEFT JOIN points_of_interest p ON ST_Contains(a.geom, p.geom)
LEFT JOIN road_network r ON ST_Intersects(a.geom, r.geom)
GROUP BY a.area_name, a.area_type, a.population, a.area_km2
ORDER BY population_density;
```

---

## Part 4: Django Integration and Admin Interface (50 minutes)

### Challenge 4.1: Django Project Setup for Spatial Analysis

Create a Django application to manage and display your spatial analysis data.

#### Create Django Project:
```bash
# Navigate to project directory
cd ~/dublin_spatial_analysis

# Create virtual environment
python3 -m venv venv_spatial
source venv_spatial/bin/activate

# Install required packages
cat > requirements.txt << 'EOF'
Django>=4.2.0
psycopg2-binary>=2.9.5
django-environ>=0.10.0
djangorestframework>=3.14.0
django-cors-headers>=4.0.0
Pillow>=9.5.0
EOF

pip install -r requirements.txt

# Create Django project
django-admin startproject dublin_planning .

# Create Django app
python manage.py startapp spatial_analysis
```

#### Configure Django Settings:
Create `.env` file:
```env
# Django Configuration
DEBUG=True
SECRET_KEY=dublin-spatial-analysis-secret-key-2025
DJANGO_SETTINGS_MODULE=dublin_planning.settings

# Database Configuration
DB_NAME=dublin_spatial_analysis
DB_USER=spatial_analyst
DB_PASSWORD=analyst2025!
DB_HOST=localhost
DB_PORT=5432
```

Edit `dublin_planning/settings.py`:
```python
import environ
import os
from pathlib import Path

# Initialize environment variables
env = environ.Env(
    DEBUG=(bool, False)
)

BASE_DIR = Path(__file__).resolve().parent.parent
environ.Env.read_env(os.path.join(BASE_DIR, '.env'))

SECRET_KEY = env('SECRET_KEY')
DEBUG = env('DEBUG')

ALLOWED_HOSTS = ['localhost', '127.0.0.1', '0.0.0.0']

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django.contrib.gis',  # Enable GeoDjango
    'rest_framework',
    'corsheaders',
    'spatial_analysis',  # Our spatial analysis app
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'dublin_planning.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'dublin_planning.wsgi.application'

# Database configuration for PostGIS
DATABASES = {
    'default': {
        'ENGINE': 'django.contrib.gis.db.backends.postgis',
        'NAME': env('DB_NAME'),
        'USER': env('DB_USER'),
        'PASSWORD': env('DB_PASSWORD'),
        'HOST': env('DB_HOST'),
        'PORT': env('DB_PORT'),
    }
}

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'Europe/Dublin'
USE_I18N = True
USE_TZ = True

STATIC_URL = '/static/'
STATICFILES_DIRS = [BASE_DIR / "static"]
STATIC_ROOT = BASE_DIR / "staticfiles"

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# CORS settings
CORS_ALLOW_ALL_ORIGINS = True
```

### Challenge 4.2: Create Django Models for Spatial Data

Create models that map to your imported spatial tables.

Edit `spatial_analysis/models.py`:
```python
from django.contrib.gis.db import models
from django.contrib.gis.geos import Point

class AdminBoundary(models.Model):
    """Administrative boundaries model"""
    
    AREA_TYPES = [
        ('City Center', 'City Center'),
        ('Cultural Quarter', 'Cultural Quarter'),
        ('Recreational', 'Recreational'),
        ('Business District', 'Business District'),
        ('Residential', 'Residential'),
    ]
    
    area_name = models.CharField(max_length=100)
    area_type = models.CharField(max_length=50, choices=AREA_TYPES)
    population = models.IntegerField()
    area_km2 = models.DecimalField(max_digits=10, decimal_places=2)
    geom = models.PolygonField(srid=4326)
    
    class Meta:
        db_table = 'admin_boundaries'
        managed = False  # Don't let Django manage this table
    
    def __str__(self):
        return f"{self.area_name} ({self.area_type})"
    
    @property
    def population_density(self):
        return round(float(self.population) / float(self.area_km2), 1)

class RoadNetwork(models.Model):
    """Road network model"""
    
    ROAD_TYPES = [
        ('Main Street', 'Main Street'),
        ('Pedestrian', 'Pedestrian'),
        ('Main Road', 'Main Road'),
        ('Motorway', 'Motorway'),
    ]
    
    road_name = models.CharField(max_length=100)
    road_type = models.CharField(max_length=50, choices=ROAD_TYPES)
    speed_limit = models.IntegerField()
    length_meters = models.DecimalField(max_digits=10, decimal_places=2)
    geom = models.LineStringField(srid=4326)
    
    class Meta:
        db_table = 'road_network'
        managed = False
    
    def __str__(self):
        return f"{self.road_name} ({self.road_type})"
    
    @property
    def length_km(self):
        return round(float(self.length_meters) / 1000, 2)

class PointOfInterest(models.Model):
    """Points of interest model"""
    
    POI_TYPES = [
        ('Education', 'Education'),
        ('Historic Site', 'Historic Site'),
        ('Entertainment', 'Entertainment'),
        ('Recreation', 'Recreation'),
        ('Transport Hub', 'Transport Hub'),
        ('Transport', 'Transport'),
        ('Commercial', 'Commercial'),
        ('Tourist Attraction', 'Tourist Attraction'),
    ]
    
    poi_name = models.CharField(max_length=100)
    poi_type = models.CharField(max_length=50, choices=POI_TYPES)
    visitors_per_day = models.IntegerField()
    rating = models.DecimalField(max_digits=3, decimal_places=2)
    geom = models.PointField(srid=4326)
    
    class Meta:
        db_table = 'points_of_interest'
        managed = False
    
    def __str__(self):
        return f"{self.poi_name} ({self.poi_type})"
    
    @property
    def latitude(self):
        return self.geom.y if self.geom else None
    
    @property
    def longitude(self):
        return self.geom.x if self.geom else None
    
    @property
    def rating_stars(self):
        return "⭐" * int(self.rating)

# Analysis models for storing computed results
class SpatialAnalysisResult(models.Model):
    """Store results from spatial analysis queries"""
    
    ANALYSIS_TYPES = [
        ('accessibility', 'Accessibility Analysis'),
        ('development', 'Development Potential'),
        ('density', 'Population Density'),
        ('road_analysis', 'Road Network Analysis'),
    ]
    
    analysis_type = models.CharField(max_length=50, choices=ANALYSIS_TYPES)
    area_name = models.CharField(max_length=100)
    result_data = models.JSONField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.get_analysis_type_display()} - {self.area_name}"
```

### Challenge 4.3: Configure Django Admin for Spatial Data

Create a comprehensive admin interface for managing spatial data.

Edit `spatial_analysis/admin.py`:
```python
from django.contrib.gis import admin
from django.contrib.gis.admin import OSMGeoAdmin
from django.db.models import Count, Avg
from .models import AdminBoundary, RoadNetwork, PointOfInterest, SpatialAnalysisResult

@admin.register(AdminBoundary)
class AdminBoundaryAdmin(OSMGeoAdmin):
    """Admin interface for administrative boundaries"""
    
    list_display = [
        'area_name', 
        'area_type', 
        'population', 
        'area_km2', 
        'population_density'
    ]
    list_filter = ['area_type']
    search_fields = ['area_name']
    readonly_fields = ['population_density']
    
    # Map configuration
    default_zoom = 11
    default_lon = -6.2603
    default_lat = 53.3498
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('area_name', 'area_type', 'population', 'area_km2')
        }),
        ('Calculated Fields', {
            'fields': ('population_density',),
            'classes': ('collapse',)
        }),
        ('Spatial Data', {
            'fields': ('geom',),
        }),
    )
    
    def get_queryset(self, request):
        return super().get_queryset(request).extra(
            select={
                'population_density': 'population / area_km2'
            }
        )

@admin.register(RoadNetwork)
class RoadNetworkAdmin(OSMGeoAdmin):
    """Admin interface for road network"""
    
    list_display = [
        'road_name',
        'road_type', 
        'speed_limit',
        'length_km'
    ]
    list_filter = ['road_type', 'speed_limit']
    search_fields = ['road_name']
    readonly_fields = ['length_km']
    
    # Map configuration  
    default_zoom = 12
    default_lon = -6.2603
    default_lat = 53.3498
    
    fieldsets = (
        ('Road Information', {
            'fields': ('road_name', 'road_type', 'speed_limit')
        }),
        ('Measurements', {
            'fields': ('length_meters', 'length_km'),
        }),
        ('Spatial Data', {
            'fields': ('geom',),
        }),
    )
    
    def changelist_view(self, request, extra_context=None):
        # Add summary statistics to changelist
        response = super().changelist_view(request, extra_context)
        
        try:
            qs = response.context_data['cl'].queryset
            summary = qs.aggregate(
                total_roads=Count('id'),
                total_length=models.Sum('length_meters'),
                avg_speed_limit=Avg('speed_limit')
            )
            
            response.context_data['summary'] = {
                'total_roads': summary['total_roads'],
                'total_length_km': round(summary['total_length'] / 1000, 1) if summary['total_length'] else 0,
                'avg_speed_limit': round(summary['avg_speed_limit'], 1) if summary['avg_speed_limit'] else 0,
            }
        except (AttributeError, KeyError):
            pass
            
        return response

@admin.register(PointOfInterest)
class PointOfInterestAdmin(OSMGeoAdmin):
    """Admin interface for points of interest"""
    
    list_display = [
        'poi_name',
        'poi_type',
        'visitors_per_day',
        'rating',
        'rating_stars',
        'latitude',
        'longitude'
    ]
    list_filter = ['poi_type', 'rating']
    search_fields = ['poi_name', 'poi_type']
    readonly_fields = ['latitude', 'longitude', 'rating_stars']
    
    # Map configuration
    default_zoom = 12
    default_lon = -6.2603
    default_lat = 53.3498
    
    fieldsets = (
        ('POI Information', {
            'fields': ('poi_name', 'poi_type', 'rating', 'rating_stars')
        }),
        ('Visitor Information', {
            'fields': ('visitors_per_day',)
        }),
        ('Location', {
            'fields': ('latitude', 'longitude', 'geom'),
        }),
    )
    
    def get_queryset(self, request):
        return super().get_queryset(request).order_by('-visitors_per_day')

@admin.register(SpatialAnalysisResult)
class SpatialAnalysisResultAdmin(admin.ModelAdmin):
    """Admin interface for spatial analysis results"""
    
    list_display = [
        'analysis_type',
        'area_name', 
        'created_at'
    ]
    list_filter = ['analysis_type', 'created_at']
    search_fields = ['area_name']
    readonly_fields = ['created_at']
    
    fieldsets = (
        ('Analysis Information', {
            'fields': ('analysis_type', 'area_name')
        }),
        ('Results', {
            'fields': ('result_data',),
            'classes': ('wide',)
        }),
        ('Metadata', {
            'fields': ('created_at',),
            'classes': ('collapse',)
        }),
    )

# Customize admin site
admin.site.site_header = "Dublin City Planning - Spatial Analysis"
admin.site.site_title = "Spatial Analysis Admin"
admin.site.index_title = "Spatial Data Management"
```

#### Setup Django URLs and Run Server:
```bash
# Create URL configuration
# Edit dublin_planning/urls.py
```

Edit `dublin_planning/urls.py`:
```python
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
]
```

```bash
# Create superuser and test
python manage.py createsuperuser

# Run development server
python manage.py runserver 0.0.0.0:8000
```

#### Test Admin Interface:
1. Visit `http://127.0.0.1:8000/admin/`
2. Login with superuser credentials
3. Explore each spatial data model:
   - **Admin boundaries**: View polygons on map
   - **Road network**: View road segments
   - **Points of Interest**: View POI locations
4. Test filtering, searching, and map interactions

---

## Part 5: Advanced Analysis and Reporting (20 minutes)

### Challenge 5.1: Create Management Commands for Spatial Analysis

Create Django management commands to run your spatial analysis queries.

Create `spatial_analysis/management/` directory structure:
```bash
mkdir -p spatial_analysis/management/commands
touch spatial_analysis/management/__init__.py
touch spatial_analysis/management/commands/__init__.py
```

Create `spatial_analysis/management/commands/run_accessibility_analysis.py`:
```python
from django.core.management.base import BaseCommand
from django.db import connection
from spatial_analysis.models import SpatialAnalysisResult
import json

class Command(BaseCommand):
    help = 'Run accessibility analysis for all administrative areas'
    
    def handle(self, *args, **options):
        self.stdout.write('Running accessibility analysis...')
        
        with connection.cursor() as cursor:
            cursor.execute("""
                WITH area_accessibility AS (
                    SELECT 
                        a.area_name,
                        a.population,
                        COUNT(p.poi_name) as nearby_services,
                        AVG(p.rating) as avg_service_rating,
                        SUM(CASE WHEN p.poi_type = 'Transport' THEN 1 ELSE 0 END) as transport_hubs,
                        SUM(CASE WHEN p.poi_type = 'Education' THEN 1 ELSE 0 END) as education_facilities,
                        SUM(CASE WHEN p.poi_type = 'Recreation' THEN 1 ELSE 0 END) as recreation_facilities
                    FROM admin_boundaries a
                    LEFT JOIN points_of_interest p ON ST_DWithin(a.geom::geography, p.geom::geography, 1000)
                    GROUP BY a.area_name, a.population
                )
                SELECT 
                    area_name,
                    population,
                    nearby_services,
                    ROUND(avg_service_rating, 2) as avg_rating,
                    transport_hubs,
                    education_facilities,
                    recreation_facilities,
                    CASE 
                        WHEN nearby_services >= 5 AND avg_service_rating >= 4.0 THEN 'Excellent Access'
                        WHEN nearby_services >= 3 AND avg_service_rating >= 3.5 THEN 'Good Access'
                        WHEN nearby_services >= 2 THEN 'Moderate Access'
                        ELSE 'Limited Access'
                    END as accessibility_rating
                FROM area_accessibility
                ORDER BY nearby_services DESC, avg_service_rating DESC;
            """)
            
            results = cursor.fetchall()
            columns = [desc[0] for desc in cursor.description]
            
            # Save results to database
            for row in results:
                result_dict = dict(zip(columns, row))
                area_name = result_dict['area_name']
                
                SpatialAnalysisResult.objects.update_or_create(
                    analysis_type='accessibility',
                    area_name=area_name,
                    defaults={'result_data': result_dict}
                )
                
                self.stdout.write(
                    f"Area: {area_name}, "
                    f"Rating: {result_dict['accessibility_rating']}, "
                    f"Services: {result_dict['nearby_services']}"
                )
        
        self.stdout.write(
            self.style.SUCCESS('Accessibility analysis completed!')
        )
```

Run the analysis:
```bash
python manage.py run_accessibility_analysis
```

### Challenge 5.2: Create Views for Analysis Results

Create views to display analysis results in the admin interface.

Add to `spatial_analysis/admin.py`:
```python
# Add this to the existing admin.py file

from django.contrib import admin
from django.shortcuts import render
from django.urls import path
from django.http import JsonResponse
from django.db import connection

class SpatialAnalysisAdmin(admin.ModelAdmin):
    """Custom admin for spatial analysis tools"""
    
    def get_urls(self):
        urls = super().get_urls()
        custom_urls = [
            path('analysis-dashboard/', self.analysis_dashboard, name='analysis_dashboard'),
            path('run-analysis/<str:analysis_type>/', self.run_analysis, name='run_analysis'),
        ]
        return custom_urls + urls
    
    def analysis_dashboard(self, request):
        """Custom dashboard for spatial analysis"""
        
        # Get latest results
        latest_results = SpatialAnalysisResult.objects.order_by(
            'analysis_type', '-created_at'
        ).distinct('analysis_type')
        
        context = {
            'title': 'Spatial Analysis Dashboard',
            'latest_results': latest_results,
        }
        
        return render(request, 'admin/spatial_analysis/dashboard.html', context)
    
    def run_analysis(self, request, analysis_type):
        """Run specific analysis and return results"""
        
        if analysis_type == 'summary':
            with connection.cursor() as cursor:
                cursor.execute("""
                    SELECT 
                        'Administrative Areas' as category,
                        COUNT(*) as count,
                        AVG(population) as avg_value
                    FROM admin_boundaries
                    UNION ALL
                    SELECT 
                        'Roads' as category,
                        COUNT(*) as count,
                        AVG(length_meters) as avg_value
                    FROM road_network
                    UNION ALL
                    SELECT 
                        'Points of Interest' as category,
                        COUNT(*) as count,
                        AVG(rating) as avg_value
                    FROM points_of_interest
                """)
                
                results = cursor.fetchall()
                
                return JsonResponse({
                    'success': True,
                    'data': [
                        {
                            'category': row[0],
                            'count': row[1],
                            'average': round(row[2], 2) if row[2] else 0
                        }
                        for row in results
                    ]
                })
        
        return JsonResponse({'success': False, 'error': 'Unknown analysis type'})

# Register the custom admin
admin.site.register(SpatialAnalysisResult, SpatialAnalysisAdmin)
```

---

## Deliverables and Assessment

### 1. Complete Spatial Data Pipeline
Your completed lab must demonstrate:
- ✅ GDAL/OGR tools properly installed and configured
- ✅ Successful import of shapefiles using ogr2ogr with various options
- ✅ PostGIS database containing all spatial datasets
- ✅ Complex spatial SQL queries answering urban planning questions
- ✅ Django models mapped to spatial tables
- ✅ Fully functional admin interface with spatial widgets

### 2. Spatial Analysis Documentation
Document your analysis with:
- ogr2ogr commands used for data import
- Spatial SQL queries and their results
- Interpretation of spatial analysis findings
- Django model design decisions
- Admin interface configuration choices

### 3. Urban Planning Insights
Provide analysis results for:
- Accessibility assessment by administrative area
- Development potential analysis
- Transportation network analysis
- POI distribution and clustering analysis

### 4. Live Demonstration
Prepare a 10-minute presentation showing:
- ogr2ogr import process
- Complex spatial queries execution
- Django admin interface navigation
- Spatial data visualization and interaction
- Analysis results interpretation

---

## Assessment Criteria

### Technical Implementation (40%)
- **GDAL/OGR Setup**: Proper installation and usage of spatial tools
- **Data Import**: Successful shapefile import with appropriate options
- **Spatial SQL**: Complex queries demonstrating PostGIS capabilities
- **Django Integration**: Models and admin interface working with spatial data

### Analysis Quality (30%)
- **Query Complexity**: Advanced spatial analysis using PostGIS functions
- **Urban Planning Insights**: Meaningful conclusions from spatial analysis
- **Data Interpretation**: Understanding of spatial relationships and patterns
- **Documentation**: Clear explanation of methodology and results

### User Interface (20%)
- **Admin Interface**: Well-configured spatial data management
- **Data Visualization**: Effective use of map widgets and spatial displays
- **User Experience**: Intuitive navigation and data presentation
- **Functionality**: All admin features working correctly

### Problem-Solving (10%)
- **Debugging Skills**: Resolution of import and configuration issues
- **Technical Understanding**: Grasp of spatial concepts and tools
- **Innovation**: Creative approaches to analysis challenges

---

## Troubleshooting Guide

### GDAL/OGR Issues
```bash
# Check GDAL installation
gdalinfo --version
ogr2ogr --formats | grep -i postgresql

# Fix PostgreSQL connection issues
export PGPASSWORD=analyst2025!
ogr2ogr -f "PostgreSQL" PG:"host=localhost user=spatial_analyst dbname=dublin_spatial_analysis" input.shp
```

### PostGIS Connection Problems
```sql
-- Check PostGIS installation
SELECT PostGIS_Version();

-- Verify spatial indexes
SELECT tablename, indexname FROM pg_indexes WHERE indexname LIKE '%geom%';

-- Check coordinate systems
SELECT srid, proj4text FROM spatial_ref_sys WHERE srid = 4326;
```

### Django Admin Issues
```python
# If spatial widgets not loading, check:
# 1. GeoDjango properly installed
# 2. GDAL libraries available
# 3. Admin using OSMGeoAdmin

# Test in Django shell:
from django.contrib.gis.gdal import HAS_GDAL
from django.contrib.gis.geos import HAS_GEOS
print(f"GDAL: {HAS_GDAL}, GEOS: {HAS_GEOS}")
```

---

**Congratulations!** You have successfully completed a comprehensive spatial data analysis workflow using industry-standard tools. You've learned to import spatial data, perform complex analysis, and create professional data management interfaces - skills directly applicable to GIS analysis, urban planning, and spatial data science careers.

Your spatial analysis of Dublin provides valuable insights for urban planning and demonstrates proficiency with the complete PostGIS/Django spatial development stack.
