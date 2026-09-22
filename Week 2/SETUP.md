# Setup Guide: Spatial Data Import and Analysis Lab
## CMPU4058 - Advanced Web Mapping - Week 2

This guide will help you set up your development environment for working with GDAL/OGR, PostGIS, and Django spatial capabilities.

---

## 1. Prerequisites Check

### Required from Week 1:
- ✅ PostgreSQL with PostGIS extension
- ✅ Python 3.8+ with Django experience
- ✅ Basic command-line interface familiarity
- ✅ VS Code or preferred code editor

### Verify Previous Setup:
```bash
# Check PostgreSQL is running
psql --version
# Expected: PostgreSQL 12+ with PostGIS support

# Check Python version
python3 --version
# Expected: Python 3.8+

# Test PostGIS connection (using Week 1 credentials)
psql -h localhost -U map_developer -d hello_map_dublin -c "SELECT PostGIS_Version();"
```

---

## 2. GDAL/OGR Installation

GDAL (Geospatial Data Abstraction Library) is essential for reading, writing, and transforming spatial data.

### macOS Installation (Recommended: Homebrew)

```bash
# Install Homebrew if not already installed
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install GDAL with all drivers
brew install gdal

# Install Python GDAL bindings
pip install GDAL==$(gdal-config --version)

# Verify installation
ogr2ogr --version
ogrinfo --version
gdalinfo --version

# Test PostgreSQL driver
ogr2ogr --formats | grep -i postgresql
```

#### macOS Troubleshooting:
```bash
# If GDAL Python bindings fail to install:
export CPPFLAGS=-I/opt/homebrew/include
export LDFLAGS=-L/opt/homebrew/lib
pip install GDAL==$(gdal-config --version)

# For Intel Macs:
export CPPFLAGS=-I/usr/local/include
export LDFLAGS=-L/usr/local/lib
```

### Ubuntu/Debian Linux Installation

```bash
# Update package manager
sudo apt update

# Install GDAL/OGR with development headers
sudo apt install gdal-bin libgdal-dev python3-gdal

# For Ubuntu 20.04+ - additional packages
sudo apt install software-properties-common
sudo add-apt-repository ppa:ubuntugis/ppa
sudo apt update
sudo apt install gdal-bin libgdal-dev

# Install Python bindings
pip3 install GDAL==$(gdal-config --version)

# Verify installation
ogr2ogr --version
ogrinfo --version
```

#### Linux Troubleshooting:
```bash
# If GDAL Python installation fails:
sudo apt install python3-dev
export CPPFLAGS=-I/usr/include/gdal
export LDFLAGS=-L/usr/lib
pip3 install GDAL==$(gdal-config --version) --global-option=build_ext --global-option="-I/usr/include/gdal"
```

### Windows Installation

#### Option 1: OSGeo4W (Recommended for Desktop GIS Users)
```bash
# Download OSGeo4W installer from:
# https://trac.osgeo.org/osgeo4w/

# During installation, select:
# - GDAL (complete package)
# - QGIS (optional, for spatial data visualization)
# - Python GDAL bindings

# Add to PATH (typically):
# C:\OSGeo4W64\bin
# C:\OSGeo4W64\apps\Python39\Scripts
```

#### Option 2: Conda Installation (Recommended for Python Developers)
```bash
# Install Miniconda/Anaconda first, then:
conda install -c conda-forge gdal

# Or create environment with GDAL
conda create -n spatial_env python=3.10 gdal
conda activate spatial_env

# Verify installation
ogr2ogr --version
```

#### Option 3: Pip Installation (Advanced)
```bash
# Download GDAL wheel from:
# https://www.lfd.uci.edu/~gohlke/pythonlibs/#gdal

# Install appropriate wheel for your Python version
pip install GDAL‑3.6.2‑cp310‑cp310‑win_amd64.whl

# Set GDAL environment variables
set GDAL_DATA=C:\path\to\gdal\data
set PROJ_LIB=C:\path\to\proj\share
```

---

## 3. Database Setup for Spatial Analysis

### Create New Database for Lab
```bash
# Connect to PostgreSQL as superuser
sudo -u postgres psql

# Or on macOS with Homebrew PostgreSQL:
psql postgres

# Create dedicated database for spatial analysis
CREATE DATABASE dublin_spatial_analysis;

# Create user with appropriate permissions
CREATE USER spatial_analyst WITH PASSWORD 'analyst2025!';

# Grant database privileges
GRANT ALL PRIVILEGES ON DATABASE dublin_spatial_analysis TO spatial_analyst;

# Connect to the new database
\c dublin_spatial_analysis;

# Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS postgis_topology;

# Verify PostGIS installation
SELECT PostGIS_Version();
SELECT PostGIS_Full_Version();

# Check available coordinate systems
SELECT count(*) FROM spatial_ref_sys;

# Exit PostgreSQL
\q
```

### Test Database Connection
```bash
# Test connection as new user
psql -h localhost -U spatial_analyst -d dublin_spatial_analysis

# Test spatial capabilities
SELECT ST_Distance(
    ST_GeomFromText('POINT(-6.2603 53.3498)', 4326),
    ST_GeomFromText('POINT(-6.2668 53.3453)', 4326)
) as distance_degrees;

# Test PostGIS functions
SELECT ST_X(ST_GeomFromText('POINT(-6.2603 53.3498)')) as longitude;

\q
```

---

## 4. Python Environment Setup

### Create Virtual Environment
```bash
# Navigate to your work directory
cd ~/Desktop # or your preferred directory
mkdir dublin_spatial_analysis
cd dublin_spatial_analysis

# Create virtual environment
python3 -m venv venv_spatial

# Activate virtual environment
# On macOS/Linux:
source venv_spatial/bin/activate

# On Windows:
venv_spatial\Scripts\activate

# Verify virtual environment
which python
which pip
```

### Install Python Dependencies
```bash
# Create requirements file
cat > requirements.txt << 'EOF'
Django>=4.2.0
psycopg2-binary>=2.9.5
django-environ>=0.10.0
djangorestframework>=3.14.0
django-cors-headers>=4.0.0
Pillow>=9.5.0
GDAL>=3.4.0
EOF

# Install all dependencies
pip install -r requirements.txt

# Verify GDAL Python bindings
python -c "from osgeo import gdal, ogr; print('GDAL version:', gdal.VersionInfo())"

# Test Django GIS capabilities
python -c "
from django.contrib.gis.gdal import HAS_GDAL
from django.contrib.gis.geos import HAS_GEOS
print('GDAL available:', HAS_GDAL)
print('GEOS available:', HAS_GEOS)
"
```

#### Troubleshooting Python Dependencies:

**GDAL Installation Issues:**
```bash
# Check GDAL configuration
gdal-config --version
gdal-config --cflags

# Reinstall GDAL Python bindings with specific version
pip uninstall GDAL
pip install GDAL==$(gdal-config --version)

# If still failing on macOS:
export GDAL_CONFIG=/opt/homebrew/bin/gdal-config
pip install GDAL==$(gdal-config --version)
```

**psycopg2 Issues:**
```bash
# On macOS, if psycopg2-binary fails:
brew install postgresql
pip install psycopg2-binary

# On Linux, if compilation fails:
sudo apt install libpq-dev python3-dev
pip install psycopg2-binary
```

---

## 5. Test Complete Environment

### Comprehensive Environment Test
Create a test script to verify all components:

```bash
# Create test script
cat > test_environment.py << 'EOF'
#!/usr/bin/env python3
"""Test script to verify spatial development environment"""

import sys
import os

def test_python_version():
    """Test Python version"""
    version = sys.version_info
    if version.major >= 3 and version.minor >= 8:
        print("✅ Python version:", f"{version.major}.{version.minor}.{version.micro}")
        return True
    else:
        print("❌ Python version too old:", f"{version.major}.{version.minor}.{version.micro}")
        return False

def test_gdal():
    """Test GDAL/OGR availability"""
    try:
        from osgeo import gdal, ogr, osr
        print("✅ GDAL version:", gdal.VersionInfo())
        print("✅ OGR drivers available:", ogr.GetDriverCount())
        return True
    except ImportError as e:
        print("❌ GDAL import failed:", e)
        return False

def test_django_gis():
    """Test Django GIS capabilities"""
    try:
        import django
        print("✅ Django version:", django.get_version())
        
        from django.contrib.gis.gdal import HAS_GDAL
        from django.contrib.gis.geos import HAS_GEOS
        
        if HAS_GDAL:
            print("✅ Django GDAL support available")
        else:
            print("❌ Django GDAL support not available")
            
        if HAS_GEOS:
            print("✅ Django GEOS support available")
        else:
            print("❌ Django GEOS support not available")
            
        return HAS_GDAL and HAS_GEOS
        
    except ImportError as e:
        print("❌ Django GIS import failed:", e)
        return False

def test_database_connection():
    """Test PostGIS database connection"""
    try:
        import psycopg2
        
        # Attempt connection
        conn = psycopg2.connect(
            host="localhost",
            database="dublin_spatial_analysis",
            user="spatial_analyst",
            password="analyst2025!"
        )
        
        cursor = conn.cursor()
        
        # Test PostGIS
        cursor.execute("SELECT PostGIS_Version();")
        version = cursor.fetchone()[0]
        print("✅ PostGIS version:", version)
        
        # Test spatial operation
        cursor.execute("""
            SELECT ST_Distance(
                ST_GeomFromText('POINT(-6.2603 53.3498)', 4326),
                ST_GeomFromText('POINT(-6.2668 53.3453)', 4326)
            );
        """)
        distance = cursor.fetchone()[0]
        print("✅ Spatial calculation successful, distance:", f"{distance:.6f} degrees")
        
        cursor.close()
        conn.close()
        return True
        
    except Exception as e:
        print("❌ Database connection failed:", e)
        return False

def test_ogr_postgresql():
    """Test ogr2ogr PostgreSQL connectivity"""
    try:
        from osgeo import ogr
        
        # Test PostgreSQL driver
        driver = ogr.GetDriverByName('PostgreSQL')
        if driver:
            print("✅ OGR PostgreSQL driver available")
            return True
        else:
            print("❌ OGR PostgreSQL driver not available")
            return False
    except Exception as e:
        print("❌ OGR PostgreSQL test failed:", e)
        return False

if __name__ == "__main__":
    print("🧪 Testing Spatial Development Environment")
    print("=" * 50)
    
    tests = [
        ("Python Version", test_python_version),
        ("GDAL/OGR", test_gdal),
        ("Django GIS", test_django_gis),
        ("PostGIS Database", test_database_connection),
        ("OGR PostgreSQL", test_ogr_postgresql),
    ]
    
    passed = 0
    total = len(tests)
    
    for test_name, test_func in tests:
        print(f"\n🔍 Testing {test_name}...")
        if test_func():
            passed += 1
        
    print("\n" + "=" * 50)
    print(f"📊 Test Results: {passed}/{total} passed")
    
    if passed == total:
        print("🎉 All tests passed! Environment is ready for spatial analysis.")
    else:
        print("⚠️  Some tests failed. Please review the errors above.")
        sys.exit(1)
EOF

# Run the test
python test_environment.py
```

### Test ogr2ogr Command Line Tools
```bash
# Test ogr2ogr with PostgreSQL
echo "Testing ogr2ogr PostgreSQL connection..."

# Create a simple test CSV file
cat > test_points.csv << 'EOF'
name,lat,lon
"Test Point 1",53.3498,-6.2603
"Test Point 2",53.3453,-6.2668
EOF

# Create VRT file for CSV with coordinates
cat > test_points.vrt << 'EOF'
<OGRVRTDataSource>
    <OGRVRTLayer name="test_points">
        <SrcDataSource>test_points.csv</SrcDataSource>
        <GeometryType>wkbPoint</GeometryType>
        <LayerSRS>WGS84</LayerSRS>
        <GeometryField encoding="PointFromColumns" x="lon" y="lat"/>
    </OGRVRTLayer>
</OGRVRTDataSource>
EOF

# Test import to PostGIS
ogr2ogr -f "PostgreSQL" \
    PG:"host=localhost user=spatial_analyst dbname=dublin_spatial_analysis password=analyst2025!" \
    test_points.vrt \
    -nln test_import \
    -overwrite

# Verify import
psql -h localhost -U spatial_analyst -d dublin_spatial_analysis -c \
    "SELECT name, ST_AsText(wkb_geometry) FROM test_import;"

# Clean up test files
rm test_points.csv test_points.vrt

# Drop test table
psql -h localhost -U spatial_analyst -d dublin_spatial_analysis -c \
    "DROP TABLE IF EXISTS test_import;"

echo "✅ ogr2ogr test completed successfully!"
```

---

## 6. Development Tools Setup

### VS Code Extensions (Optional but Recommended)
```bash
# Install VS Code extensions for spatial development
code --install-extension ms-python.python
code --install-extension ms-toolsai.jupyter
code --install-extension bradlc.vscode-tailwindcss
code --install-extension ms-vscode.vscode-json
```

### Configure VS Code for Django
Create `.vscode/settings.json`:
```json
{
    "python.defaultInterpreterPath": "./venv_spatial/bin/python",
    "python.envFile": "${workspaceFolder}/.env",
    "python.linting.enabled": true,
    "python.linting.pylintEnabled": true,
    "files.associations": {
        "*.html": "html"
    }
}
```

### Git Setup (Optional)
```bash
# Initialize git repository
git init

# Create .gitignore
cat > .gitignore << 'EOF'
# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
venv_spatial/
*.egg-info/

# Django
*.log
local_settings.py
db.sqlite3
staticfiles/

# Environment variables
.env

# macOS
.DS_Store

# VS Code
.vscode/

# Spatial data files
*.shp
*.shx
*.dbf
*.prj
*.cpg
*.qpj
*.sbn
*.sbx
EOF
```

---

## 7. Quick Start Verification

### Final Environment Check
Run this quick verification before starting the lab:

```bash
# 1. Check virtual environment is active
echo $VIRTUAL_ENV
# Should show path to venv_spatial

# 2. Test all command-line tools
echo "=== Command Line Tools ==="
python --version
django-admin --version
ogr2ogr --version
psql --version

# 3. Test database connection
echo "=== Database Connection ==="
psql -h localhost -U spatial_analyst -d dublin_spatial_analysis -c "SELECT 'Connection successful' as status;"

# 4. Test Python imports
echo "=== Python Imports ==="
python -c "
import django
from django.contrib.gis import admin
from osgeo import gdal, ogr
import psycopg2
print('All imports successful!')
"

echo "🎉 Environment verification complete!"
```

---

## Troubleshooting Common Issues

### Issue 1: GDAL Import Errors
**Error:** `ImportError: No module named 'osgeo'`

**Solution:**
```bash
# Reinstall GDAL with proper version matching
pip uninstall GDAL
gdal-config --version
pip install GDAL==$(gdal-config --version)

# On macOS with Apple Silicon:
arch -arm64 pip install GDAL==$(gdal-config --version)
```

### Issue 2: PostGIS Connection Refused
**Error:** `psql: FATAL: database "dublin_spatial_analysis" does not exist`

**Solution:**
```bash
# Restart PostgreSQL service
# On macOS:
brew services restart postgresql

# On Linux:
sudo systemctl restart postgresql

# Recreate database
sudo -u postgres psql -c "CREATE DATABASE dublin_spatial_analysis;"
```

### Issue 3: ogr2ogr PostgreSQL Driver Not Found
**Error:** `Unable to find driver PostgreSQL`

**Solution:**
```bash
# Check available drivers
ogr2ogr --formats | grep -i post

# Reinstall GDAL with PostgreSQL support
# On macOS:
brew reinstall gdal --with-postgresql

# On Linux:
sudo apt install gdal-bin libgdal-dev postgresql-client
```

### Issue 4: Django Admin Map Widget Not Loading
**Error:** Map widget shows blank or error in admin

**Solution:**
```bash
# Check Django GIS requirements
python -c "
from django.contrib.gis.gdal import HAS_GDAL
from django.contrib.gis.geos import HAS_GEOS
print('GDAL:', HAS_GDAL, 'GEOS:', HAS_GEOS)
"

# Ensure collectstatic ran
python manage.py collectstatic

# Check settings.py has correct GDAL path
python -c "from django.conf import settings; print(settings.GDAL_LIBRARY_PATH)"
```

---

## Next Steps

Once your environment is successfully set up:

1. ✅ **Confirmed:** All test scripts pass
2. ✅ **Ready:** ogr2ogr can connect to PostGIS
3. ✅ **Verified:** Django GIS imports work
4. ✅ **Tested:** Database connections successful

**You're ready to begin the lab!** Proceed to the main README.md file to start with Challenge 1.1: GDAL/OGR Installation and Dataset Preparation.

---

## Support Resources

- **GDAL Documentation**: https://gdal.org/
- **PostGIS Manual**: https://postgis.net/docs/
- **Django GIS Documentation**: https://docs.djangoproject.com/en/4.2/ref/contrib/gis/
- **ogr2ogr Reference**: https://gdal.org/programs/ogr2ogr.html

**Remember:** Keep your virtual environment activated throughout the lab session!
