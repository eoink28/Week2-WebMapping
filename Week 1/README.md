# Lab: Full-Stack Web Mapping Environment Setup & "Hello Map" Deployment
## CMPU4058 - Advanced Web Mapping - Week 1
**Duration:** 3 hours  
**Difficulty:** Intermediate to Advanced  
**Type:** Problem-Based Learning

## Learning Objectives
By the end of this lab, students will be able to:
1. Set up and configure a complete full-stack web mapping development environment
2. Install and configure PostgreSQL with PostGIS extension for spatial data storage
3. Create and configure a Django web application with spatial capabilities
4. Integrate Leaflet for interactive web mapping functionality
5. Deploy a functional "Hello Map" web application
6. Understand the architecture and data flow in a full-stack mapping application
7. Troubleshoot common setup and integration issues

## Problem Scenario
You are a junior web developer at "Dublin Tech Solutions," a startup specializing in location-based web applications. Your team has been tasked with creating a proof-of-concept "Hello Map" application for a new client - the Dublin Tourism Board. 

The client wants to see a demonstration of your technical capabilities before committing to a larger project. They've requested:

- A professional "Hello Map" web application centered on Dublin
- Interactive mapping capabilities with zoom and pan functionality
- A clean, modern interface suitable for tourists
- Demonstration of spatial data storage and retrieval
- Evidence that the system can handle real geographic data

Your challenge is to set up the complete development environment and deploy a working "Hello Map" application that showcases Dublin's location with interactive features, serving as the foundation for future tourism applications.

## Prerequisites
- Basic knowledge of Python programming
- Understanding of web development concepts (HTML, CSS, JavaScript)
- Familiarity with command-line operations
- Basic understanding of databases

## Required Software
Before starting, ensure you have:
- Python 3.8 or higher
- A code editor (VS Code recommended)
- Terminal/Command Prompt access
- Internet connection for package downloads

---

## Part 1: Development Environment Setup (45 minutes)

### Challenge 1.1: PostgreSQL and PostGIS Installation

Your first task is to install and configure PostgreSQL with PostGIS extension to handle spatial data efficiently.

**Why PostgreSQL + PostGIS?**
- Industry-standard spatial database
- Excellent performance with geographic data
- Strong integration with Django
- Supports complex spatial queries and operations

#### Installation Instructions by Platform:

**macOS (using Homebrew):**
```bash
# Install Homebrew if not already installed
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install PostgreSQL and PostGIS
brew install postgresql postgis

# Start PostgreSQL service
brew services start postgresql

# Verify installation
psql --version
```

**Ubuntu/Linux:**
```bash
# Update package manager
sudo apt update

# Install PostgreSQL and PostGIS
sudo apt install postgresql postgresql-contrib postgis postgresql-14-postgis-3

# Start and enable PostgreSQL service
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Verify installation
psql --version
```

**Windows:**
1. Download PostgreSQL installer from https://www.postgresql.org/download/windows/
2. Run installer and include pgAdmin and Stack Builder
3. Use Stack Builder to install PostGIS extension
4. Ensure PostgreSQL service is running in Services panel

#### Database Setup and Configuration:

```bash
# Connect to PostgreSQL (method varies by system)
# macOS/Linux with default setup:
sudo -u postgres psql

# Windows or systems with password:
psql -U postgres
```

**Create your project database:**
```sql
-- Create database for our Hello Map project
CREATE DATABASE hello_map_dublin;

-- Create a dedicated user for our application
CREATE USER map_developer WITH PASSWORD 'dublin2025!';

-- Grant all privileges on the database to our user
GRANT ALL PRIVILEGES ON DATABASE hello_map_dublin TO map_developer;

-- Connect to the new database
\c hello_map_dublin;

-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- Verify PostGIS installation
SELECT PostGIS_Version();

-- Create a sample table for Dublin landmarks (we'll use this later)
CREATE TABLE dublin_landmarks (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    location GEOMETRY(POINT, 4326),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert some sample Dublin landmarks
INSERT INTO dublin_landmarks (name, description, location) VALUES
('Trinity College Dublin', 'Historic university in Dublin city center', 
 ST_GeomFromText('POINT(-6.2603 53.3441)', 4326)),
('Dublin Castle', 'Medieval castle and former British administrative center', 
 ST_GeomFromText('POINT(-6.2674 53.3429)', 4326)),
('Temple Bar', 'Cultural quarter famous for nightlife and traditional music', 
 ST_GeomFromText('POINT(-6.2668 53.3453)', 4326)),
('Phoenix Park', 'Large enclosed park in Dublin', 
 ST_GeomFromText('POINT(-6.3298 53.3558)', 4326));

-- Verify data insertion
SELECT name, ST_AsText(location) as coordinates FROM dublin_landmarks;

-- Exit PostgreSQL
\q
```

**Verification Steps:**
1. Test database connection: `psql -h localhost -U map_developer -d hello_map_dublin`
2. Verify PostGIS is working: Run `SELECT PostGIS_Version();`
3. Check sample data: `SELECT count(*) FROM dublin_landmarks;`

### Challenge 1.2: Python Environment and Django Setup

Now you'll create a proper Python development environment with all necessary packages for spatial web development.

#### Create Project Structure:
```bash
# Create main project directory
mkdir hello_map_project
cd hello_map_project

# Create virtual environment
python3 -m venv venv_hello_map

# Activate virtual environment
# macOS/Linux:
source venv_hello_map/bin/activate

# Windows:
venv_hello_map\Scripts\activate

# Verify virtual environment is active (should show (venv_hello_map) in prompt)
which python
```

#### Install Required Packages:
Create a requirements file with all necessary dependencies:

```bash
# Create requirements.txt
cat > requirements.txt << 'EOF'
Django>=4.2.0
psycopg2-binary>=2.9.5
django-environ>=0.10.0
djangorestframework>=3.14.0
django-cors-headers>=4.0.0
Pillow>=9.5.0
EOF

# Install all packages
pip install --upgrade pip
pip install -r requirements.txt

# Verify Django installation
python -c "import django; print('Django version:', django.get_version())"
```

#### Project Initialization:
```bash
# Create Django project
django-admin startproject hello_map_django .

# Create Django app for our mapping functionality
python manage.py startapp mapping

# Create directory structure for static files and templates
mkdir -p static/{css,js,images}
mkdir -p templates/mapping
mkdir -p media
```

**Expected Project Structure:**
```
hello_map_project/
├── manage.py
├── requirements.txt
├── hello_map_django/
│   ├── __init__.py
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
├── mapping/
│   ├── __init__.py
│   ├── admin.py
│   ├── apps.py
│   ├── models.py
│   ├── tests.py
│   └── views.py
├── static/
├── templates/
└── venv_hello_map/
```

---

## Part 2: Django Configuration for Spatial Development (45 minutes)

### Challenge 2.1: Configure Django Settings for PostGIS

You need to configure Django to work with your PostGIS database and enable spatial functionality.

#### Environment Variables Setup:
Create a `.env` file for secure configuration:

```bash
# Create .env file in project root
cat > .env << 'EOF'
# Django Configuration
DEBUG=True
SECRET_KEY=hello-map-super-secret-key-change-in-production
DJANGO_SETTINGS_MODULE=hello_map_django.settings

# Database Configuration
DB_NAME=hello_map_dublin
DB_USER=map_developer
DB_PASSWORD=dublin2025!
DB_HOST=localhost
DB_PORT=5432

# Application Settings
ALLOWED_HOSTS=localhost,127.0.0.1,0.0.0.0
EOF
```

#### Configure Django Settings:
Edit `hello_map_django/settings.py`:

```python
import environ
import os
from pathlib import Path

# Initialize environment variables
env = environ.Env(
    DEBUG=(bool, False)
)

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# Read .env file
environ.Env.read_env(os.path.join(BASE_DIR, '.env'))

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = env('SECRET_KEY')

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = env('DEBUG')

ALLOWED_HOSTS = ['localhost', '127.0.0.1', '0.0.0.0']

# Application definition
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django.contrib.gis',  # Enable GeoDjango for spatial functionality
    'rest_framework',      # For API development
    'corsheaders',         # For cross-origin requests
    'mapping',             # Our custom app
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

ROOT_URLCONF = 'hello_map_django.urls'

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

WSGI_APPLICATION = 'hello_map_django.wsgi.application'

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

# Internationalization
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'Europe/Dublin'
USE_I18N = True
USE_TZ = True

# Static files (CSS, JavaScript, Images)
STATIC_URL = '/static/'
STATICFILES_DIRS = [
    BASE_DIR / "static",
]
STATIC_ROOT = BASE_DIR / "staticfiles"

# Media files
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / "media"

# Default primary key field type
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# CORS settings for development
CORS_ALLOW_ALL_ORIGINS = True  # Only for development!
CORS_ALLOWED_ORIGINS = [
    "http://localhost:8000",
    "http://127.0.0.1:8000",
]

# REST Framework configuration
REST_FRAMEWORK = {
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.AllowAny',
    ],
}
```

### Challenge 2.2: Create Spatial Models

Create Django models that can work with the spatial data in your PostGIS database.

#### Edit `mapping/models.py`:
```python
from django.contrib.gis.db import models
from django.contrib.gis.geos import Point

class DublinLandmark(models.Model):
    """Model for Dublin landmarks with spatial data"""
    
    name = models.CharField(max_length=200, help_text="Name of the landmark")
    description = models.TextField(help_text="Description of the landmark")
    location = models.PointField(srid=4326, help_text="Geographic location (latitude/longitude)")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['name']
        db_table = 'dublin_landmarks'  # Use existing table
        
    def __str__(self):
        return self.name
    
    @property
    def latitude(self):
        return self.location.y if self.location else None
    
    @property
    def longitude(self):
        return self.location.x if self.location else None

class HelloMapConfig(models.Model):
    """Configuration model for Hello Map application"""
    
    title = models.CharField(max_length=100, default="Hello Map - Dublin")
    center_latitude = models.FloatField(default=53.3498)  # Dublin city center
    center_longitude = models.FloatField(default=-6.2603)
    default_zoom = models.IntegerField(default=13)
    welcome_message = models.TextField(
        default="Welcome to Dublin! Explore our beautiful city through this interactive map."
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = "Hello Map Configuration"
        verbose_name_plural = "Hello Map Configurations"
    
    def __str__(self):
        return self.title
```

#### Configure Django Admin for Spatial Data:
Edit `mapping/admin.py`:

```python
from django.contrib.gis import admin
from django.contrib.gis.admin import OSMGeoAdmin
from .models import DublinLandmark, HelloMapConfig

@admin.register(DublinLandmark)
class DublinLandmarkAdmin(OSMGeoAdmin):
    """Admin interface for Dublin landmarks with map widget"""
    
    list_display = ['name', 'latitude', 'longitude', 'created_at']
    list_filter = ['created_at']
    search_fields = ['name', 'description']
    readonly_fields = ['created_at', 'updated_at']
    
    # Map widget configuration
    default_zoom = 12
    default_lon = -6.2603  # Dublin longitude
    default_lat = 53.3498  # Dublin latitude
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'description')
        }),
        ('Location', {
            'fields': ('location',)
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

@admin.register(HelloMapConfig)
class HelloMapConfigAdmin(admin.ModelAdmin):
    """Admin interface for Hello Map configuration"""
    
    list_display = ['title', 'center_latitude', 'center_longitude', 'is_active']
    fields = ['title', 'center_latitude', 'center_longitude', 'default_zoom', 'welcome_message', 'is_active']
    
    def has_delete_permission(self, request, obj=None):
        # Prevent deletion to maintain configuration
        return False
```

#### Database Migration:
```bash
# Create and apply migrations
python manage.py makemigrations mapping
python manage.py migrate

# Create superuser for admin access
python manage.py createsuperuser

# Test the setup
python manage.py runserver 0.0.0.0:8000
```

Visit `http://127.0.0.1:8000/admin` to verify the admin interface works and shows your spatial models.

---

## Part 3: "Hello Map" Frontend Development (60 minutes)

### Challenge 3.1: Create Views and URL Configuration

Create Django views to serve your "Hello Map" application.

#### Edit `mapping/views.py`:
```python
from django.shortcuts import render
from django.http import JsonResponse
from django.contrib.gis.serializers import geojson
from .models import DublinLandmark, HelloMapConfig

def hello_map_view(request):
    """Main Hello Map view"""
    # Get configuration or create default
    config, created = HelloMapConfig.objects.get_or_create(
        is_active=True,
        defaults={
            'title': 'Hello Map - Dublin',
            'center_latitude': 53.3498,
            'center_longitude': -6.2603,
            'default_zoom': 13,
            'welcome_message': 'Welcome to Dublin! Explore our beautiful city through this interactive map.'
        }
    )
    
    # Get landmarks count for display
    landmarks_count = DublinLandmark.objects.count()
    
    context = {
        'config': config,
        'landmarks_count': landmarks_count,
        'page_title': config.title,
    }
    
    return render(request, 'mapping/hello_map.html', context)

def landmarks_api(request):
    """API endpoint to serve landmarks as GeoJSON"""
    landmarks = DublinLandmark.objects.all()
    
    # Convert to GeoJSON format
    landmarks_geojson = {
        'type': 'FeatureCollection',
        'features': []
    }
    
    for landmark in landmarks:
        if landmark.location:
            feature = {
                'type': 'Feature',
                'geometry': {
                    'type': 'Point',
                    'coordinates': [landmark.longitude, landmark.latitude]
                },
                'properties': {
                    'id': landmark.id,
                    'name': landmark.name,
                    'description': landmark.description,
                }
            }
            landmarks_geojson['features'].append(feature)
    
    return JsonResponse(landmarks_geojson)

def map_config_api(request):
    """API endpoint for map configuration"""
    try:
        config = HelloMapConfig.objects.filter(is_active=True).first()
        if not config:
            config = HelloMapConfig.objects.create()  # Create default
        
        return JsonResponse({
            'title': config.title,
            'center': [config.center_latitude, config.center_longitude],
            'zoom': config.default_zoom,
            'welcome_message': config.welcome_message
        })
    except Exception as e:
        return JsonResponse({
            'title': 'Hello Map - Dublin',
            'center': [53.3498, -6.2603],
            'zoom': 13,
            'welcome_message': 'Welcome to Dublin!'
        })
```

#### Create URL Configuration:
Create `mapping/urls.py`:

```python
from django.urls import path
from . import views

app_name = 'mapping'

urlpatterns = [
    path('', views.hello_map_view, name='hello_map'),
    path('api/landmarks/', views.landmarks_api, name='landmarks_api'),
    path('api/config/', views.map_config_api, name='config_api'),
]
```

#### Update main URLs in `hello_map_django/urls.py`:
```python
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('mapping.urls')),
]

# Serve static files in development
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
```

### Challenge 3.2: Build the "Hello Map" Interface

Create an attractive, professional "Hello Map" interface using Leaflet for interactive mapping.

#### Create Base Template:
Create `templates/base.html`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{% block title %}{{ page_title|default:"Hello Map - Dublin" }}{% endblock %}</title>
    
    <!-- Leaflet CSS -->
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    
    <!-- Bootstrap CSS for styling -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    
    <!-- Custom CSS -->
    <style>
        body {
            font-family: 'Arial', sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            margin: 0;
        }
        
        .hello-header {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            padding: 20px 0;
            box-shadow: 0 2px 20px rgba(0,0,0,0.1);
            border-radius: 0 0 20px 20px;
            margin-bottom: 20px;
        }
        
        .hello-title {
            color: #333;
            font-size: 2.5em;
            font-weight: bold;
            text-align: center;
            margin: 0;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
        }
        
        .hello-subtitle {
            text-align: center;
            color: #666;
            font-size: 1.2em;
            margin-top: 10px;
        }
        
        .map-container {
            background: white;
            border-radius: 20px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.2);
            overflow: hidden;
            margin: 20px;
        }
        
        #map {
            height: 70vh;
            width: 100%;
        }
        
        .info-panel {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            border-radius: 15px;
            padding: 20px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
            margin: 20px;
        }
        
        .welcome-message {
            background: linear-gradient(45deg, #4CAF50, #45a049);
            color: white;
            padding: 20px;
            border-radius: 15px;
            text-align: center;
            margin: 20px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        }
        
        .stats-card {
            background: rgba(255, 255, 255, 0.9);
            border-radius: 10px;
            padding: 15px;
            text-align: center;
            margin: 10px 0;
        }
        
        .stats-number {
            font-size: 2em;
            font-weight: bold;
            color: #4CAF50;
        }
        
        .loading {
            text-align: center;
            padding: 40px;
            color: #666;
        }
        
        .loading-spinner {
            border: 4px solid #f3f3f3;
            border-top: 4px solid #4CAF50;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            animation: spin 2s linear infinite;
            margin: 0 auto 20px;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        @media (max-width: 768px) {
            .hello-title {
                font-size: 2em;
            }
            .map-container {
                margin: 10px;
            }
            #map {
                height: 50vh;
            }
        }
    </style>
</head>
<body>
    <div class="hello-header">
        <h1 class="hello-title">🗺️ Hello Map</h1>
        <p class="hello-subtitle">Discover Dublin Through Interactive Mapping</p>
    </div>
    
    <div class="container-fluid">
        {% block content %}{% endblock %}
    </div>
    
    <!-- Scripts -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    
    {% block scripts %}{% endblock %}
</body>
</html>
```

#### Create Hello Map Template:
Create `templates/mapping/hello_map.html`:

```html
{% extends 'base.html' %}

{% block content %}
<div class="row">
    <!-- Map Column -->
    <div class="col-lg-9">
        <div class="map-container">
            <div id="loading" class="loading">
                <div class="loading-spinner"></div>
                <p>Loading your Hello Map experience...</p>
            </div>
            <div id="map" style="display: none;"></div>
        </div>
    </div>
    
    <!-- Information Panel -->
    <div class="col-lg-3">
        <div class="welcome-message">
            <h4>🎉 Welcome!</h4>
            <p id="welcome-text">{{ config.welcome_message }}</p>
        </div>
        
        <div class="info-panel">
            <h5>📊 Map Statistics</h5>
            <div class="stats-card">
                <div class="stats-number" id="landmarks-count">{{ landmarks_count }}</div>
                <div>Landmarks Loaded</div>
            </div>
            
            <div class="stats-card">
                <div class="stats-number" id="zoom-level">{{ config.default_zoom }}</div>
                <div>Current Zoom Level</div>
            </div>
        </div>
        
        <div class="info-panel">
            <h5>🎯 Map Features</h5>
            <ul class="list-unstyled">
                <li>✅ Interactive Dublin Map</li>
                <li>✅ Landmark Markers</li>
                <li>✅ Zoom & Pan Controls</li>
                <li>✅ Responsive Design</li>
                <li>✅ Real-time Data</li>
            </ul>
        </div>
        
        <div class="info-panel">
            <h5>🔧 Technical Stack</h5>
            <small class="text-muted">
                <strong>Backend:</strong> Django + PostGIS<br>
                <strong>Frontend:</strong> Leaflet + Bootstrap<br>
                <strong>Database:</strong> PostgreSQL
            </small>
        </div>
    </div>
</div>
{% endblock %}

{% block scripts %}
<script>
// Global variables
let map;
let mapConfig;
let landmarks = [];

// Initialize the Hello Map
async function initializeHelloMap() {
    console.log('🗺️ Initializing Hello Map...');
    
    try {
        // Load map configuration
        const configResponse = await fetch('/api/config/');
        mapConfig = await configResponse.json();
        
        // Load landmarks data
        const landmarksResponse = await fetch('/api/landmarks/');
        const landmarksData = await landmarksResponse.json();
        landmarks = landmarksData.features || [];
        
        // Create the map
        createMap();
        
        // Add landmarks to map
        addLandmarksToMap();
        
        // Show success message
        showSuccessMessage();
        
    } catch (error) {
        console.error('❌ Error initializing Hello Map:', error);
        showErrorMessage(error);
    }
}

// Create the Leaflet map
function createMap() {
    console.log('🗺️ Creating map with config:', mapConfig);
    
    // Create map instance
    map = L.map('map').setView(mapConfig.center, mapConfig.zoom);
    
    // Add OpenStreetMap tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);
    
    // Add map event listeners
    map.on('zoomend', function() {
        document.getElementById('zoom-level').textContent = map.getZoom();
    });
    
    // Add scale control
    L.control.scale().addTo(map);
    
    console.log('✅ Map created successfully');
}

// Add landmarks to the map
function addLandmarksToMap() {
    console.log(`🏛️ Adding ${landmarks.length} landmarks to map`);
    
    landmarks.forEach((landmark, index) => {
        const { coordinates } = landmark.geometry;
        const { name, description } = landmark.properties;
        
        // Create marker
        const marker = L.marker([coordinates[1], coordinates[0]])
            .addTo(map)
            .bindPopup(`
                <div style="min-width: 200px;">
                    <h6 style="color: #4CAF50; margin-bottom: 10px;">${name}</h6>
                    <p style="margin-bottom: 10px;">${description}</p>
                    <small style="color: #666;">
                        📍 Lat: ${coordinates[1].toFixed(4)}, Lng: ${coordinates[0].toFixed(4)}
                    </small>
                </div>
            `);
        
        // Add click event
        marker.on('click', function() {
            console.log(`📍 Landmark clicked: ${name}`);
        });
    });
    
    console.log('✅ All landmarks added successfully');
}

// Show success message
function showSuccessMessage() {
    // Hide loading
    document.getElementById('loading').style.display = 'none';
    document.getElementById('map').style.display = 'block';
    
    // Trigger map resize
    setTimeout(() => {
        map.invalidateSize();
        console.log('✅ Map resized and displayed');
        
        // Show welcome popup
        setTimeout(() => {
            L.popup()
                .setLatLng(mapConfig.center)
                .setContent(`
                    <div style="text-align: center; padding: 15px;">
                        <h4 style="color: #4CAF50;">🎉 Hello Map!</h4>
                        <p>${mapConfig.welcome_message}</p>
                        <small>Click on markers to explore landmarks!</small>
                    </div>
                `)
                .openOn(map);
        }, 1000);
        
    }, 100);
}

// Show error message
function showErrorMessage(error) {
    document.getElementById('loading').innerHTML = `
        <div class="alert alert-danger" role="alert">
            <h5>❌ Error Loading Hello Map</h5>
            <p>We encountered an issue while loading your map:</p>
            <code>${error.message}</code>
            <br><br>
            <button class="btn btn-primary" onclick="location.reload()">
                🔄 Try Again
            </button>
        </div>
    `;
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Hello Map application starting...');
    initializeHelloMap();
});

// Handle window resize
window.addEventListener('resize', function() {
    if (map) {
        map.invalidateSize();
    }
});
</script>
{% endblock %}
```

---

## Part 4: Testing, Integration & Deployment (30 minutes)

### Challenge 4.1: System Testing and Verification

Test all components of your Hello Map application to ensure they work together seamlessly.

#### Backend Testing:
```bash
# Test Django server
python manage.py runserver 0.0.0.0:8000

# In another terminal, test API endpoints:
curl http://127.0.0.1:8000/api/config/
curl http://127.0.0.1:8000/api/landmarks/

# Test database connection
python manage.py shell
>>> from mapping.models import DublinLandmark
>>> print(DublinLandmark.objects.count())
>>> landmarks = DublinLandmark.objects.all()
>>> for landmark in landmarks: print(f"{landmark.name}: {landmark.location}")
```

#### Frontend Testing Checklist:
1. **Map Display**: Visit `http://127.0.0.1:8000/` and verify map loads
2. **Landmarks**: Check that Dublin landmarks appear as markers
3. **Interactivity**: Test zoom, pan, and marker clicks
4. **Responsive Design**: Test on different screen sizes
5. **Welcome Message**: Verify popup appears after map loads

#### Admin Interface Testing:
1. Visit `http://127.0.0.1:8000/admin/`
2. Login with your superuser credentials
3. Navigate to "Dublin landmarks" - verify map widget works
4. Try adding a new landmark using the map interface
5. Check "Hello Map Configurations" settings

### Challenge 4.2: Production Preparation and Deployment

Prepare your Hello Map application for deployment with proper configuration and documentation.

#### Create Production Settings:
Create `hello_map_django/production_settings.py`:

```python
from .settings import *
import os

# Production overrides
DEBUG = False
ALLOWED_HOSTS = ['your-domain.com', 'localhost', '127.0.0.1']

# Static files for production
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

# Security settings for production
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = 'DENY'

# Database configuration for production (environment variables)
DATABASES = {
    'default': {
        'ENGINE': 'django.contrib.gis.db.backends.postgis',
        'NAME': os.environ.get('DB_NAME', 'hello_map_dublin'),
        'USER': os.environ.get('DB_USER', 'map_developer'),
        'PASSWORD': os.environ.get('DB_PASSWORD', 'dublin2025!'),
        'HOST': os.environ.get('DB_HOST', 'localhost'),
        'PORT': os.environ.get('DB_PORT', '5432'),
    }
}
```

#### Create Deployment Script:
Create `deploy.sh`:

```bash
#!/bin/bash
echo "🚀 Deploying Hello Map Application..."

# Activate virtual environment
source venv_hello_map/bin/activate

# Install/update dependencies
pip install -r requirements.txt

# Collect static files
python manage.py collectstatic --noinput

# Run database migrations
python manage.py makemigrations
python manage.py migrate

# Create configuration if it doesn't exist
python manage.py shell << EOF
from mapping.models import HelloMapConfig
if not HelloMapConfig.objects.filter(is_active=True).exists():
    HelloMapConfig.objects.create(
        title="Hello Map - Dublin",
        center_latitude=53.3498,
        center_longitude=-6.2603,
        default_zoom=13,
        welcome_message="Welcome to Dublin! Explore our beautiful city through this interactive map."
    )
    print("✅ Default Hello Map configuration created")
else:
    print("✅ Hello Map configuration already exists")
EOF

# Test deployment
python manage.py check --deploy

echo "✅ Hello Map deployment complete!"
echo "🌐 Start server with: python manage.py runserver 0.0.0.0:8000"
```

Make it executable:
```bash
chmod +x deploy.sh
```

#### Create Documentation:
Create `DEPLOYMENT_README.md`:

```markdown
# Hello Map - Deployment Guide

## Quick Start
1. Run deployment script: `./deploy.sh`
2. Start server: `python manage.py runserver 0.0.0.0:8000`
3. Access Hello Map: http://localhost:8000
4. Access Admin: http://localhost:8000/admin

## Configuration
- Modify map settings in Django Admin under "Hello Map Configurations"
- Add/edit landmarks in Django Admin under "Dublin landmarks"
- Environment variables in `.env` file

## API Endpoints
- GET /api/config/ - Map configuration
- GET /api/landmarks/ - Landmarks as GeoJSON

## Troubleshooting
- Ensure PostgreSQL is running: `brew services start postgresql` (macOS)
- Check database connection: `python manage.py shell`
- Verify PostGIS extension: `SELECT PostGIS_Version();`
```

---

## Deliverables and Assessment

### 1. Functional "Hello Map" Application
Your completed application must demonstrate:
- ✅ Interactive map centered on Dublin
- ✅ Professional "Hello Map" branding and interface
- ✅ Dublin landmarks displayed as interactive markers
- ✅ Responsive design working on desktop and mobile
- ✅ Django admin interface for data management
- ✅ RESTful API endpoints serving spatial data

### 2. Technical Documentation
Document your implementation with:
- Setup and installation instructions
- Configuration guide for map settings
- API documentation
- Troubleshooting guide
- Deployment instructions

### 3. Live Demonstration
Prepare a 5-minute presentation showing:
- Complete application walkthrough
- Admin interface for managing landmarks
- API endpoints returning data
- Mobile responsiveness
- Technical architecture overview

---

## Assessment Criteria

### Technical Implementation (40%)
- **Database Setup**: PostGIS properly configured with spatial data
- **Django Integration**: Models, views, and admin interface working correctly
- **Frontend Development**: Professional Leaflet map with full functionality
- **API Development**: Clean, functional RESTful endpoints

### User Experience (25%)
- **Interface Design**: Attractive, professional "Hello Map" interface
- **Functionality**: Smooth map interactions and landmark display
- **Responsiveness**: Works well on different devices and screen sizes
- **User Feedback**: Loading states, error handling, success messages

### Problem-Solving Skills (20%)
- **Debugging Ability**: Successfully resolving setup and integration issues
- **Code Quality**: Well-structured, maintainable, commented code
- **Testing Approach**: Systematic verification of functionality
- **Documentation**: Clear, comprehensive setup and usage instructions

### Innovation and Polish (15%)
- **Beyond Requirements**: Additional features or enhancements
- **Visual Design**: Attractive styling and professional presentation
- **Performance**: Optimized loading and smooth operation
- **Deployment Readiness**: Production-ready configuration

---

## Troubleshooting Guide

### Common Issues and Solutions

**1. PostgreSQL Connection Error**
```bash
# Check if PostgreSQL is running
brew services list | grep postgresql  # macOS
sudo systemctl status postgresql      # Linux

# Start PostgreSQL if needed
brew services start postgresql        # macOS
sudo systemctl start postgresql       # Linux
```

**2. PostGIS Extension Missing**
```sql
-- Connect to database and install PostGIS
\c hello_map_dublin
CREATE EXTENSION IF NOT EXISTS postgis;
SELECT PostGIS_Version();
```

**3. Django Migration Issues**
```bash
# Reset migrations if needed
rm mapping/migrations/0*.py
python manage.py makemigrations mapping
python manage.py migrate
```

**4. Map Not Loading**
- Check browser console for JavaScript errors
- Verify API endpoints return data: `/api/landmarks/` and `/api/config/`
- Ensure static files are being served correctly

**5. Admin Interface Issues**
- Create superuser: `python manage.py createsuperuser`
- Check `INSTALLED_APPS` includes `'django.contrib.gis'`
- Verify spatial widgets load correctly

---

## Extension Challenges

### For Advanced Students:
1. **Enhanced Features**: Add search functionality for landmarks
2. **Additional Data**: Import real Dublin tourism data
3. **Advanced Styling**: Custom marker icons and map styling
4. **User Interaction**: Allow users to add their own landmarks
5. **Performance**: Implement caching for API responses

### For Additional Learning:
1. **Docker Deployment**: Containerize the entire application
2. **Cloud Deployment**: Deploy to AWS, Google Cloud, or Heroku
3. **Testing Suite**: Implement unit and integration tests
4. **Monitoring**: Add application performance monitoring
5. **Analytics**: Track user interactions with the map
