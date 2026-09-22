# Setup Guide: Full-Stack Web Mapping Environment
## CMPU4058 - Advanced Web Mapping - Week 1

This guide will help you set up a complete development environment for full-stack web mapping with Django, PostGIS, and Leaflet.

---

## System Requirements

### Minimum Requirements
- **Operating System**: macOS 10.14+, Windows 10+, or Ubuntu 18.04+
- **RAM**: 4GB minimum, 8GB recommended
- **Storage**: 5GB free space
- **Network**: Internet connection for downloads

### Required Software
- **Python 3.8+**: Core programming language
- **PostgreSQL 12+**: Database system
- **PostGIS**: Spatial database extension
- **Code Editor**: VS Code recommended
- **Git**: Version control (optional but recommended)

---

## Installation Guide

### Step 1: Python Installation

#### Check Current Python Version
```bash
python3 --version
```

#### macOS
```bash
# Install using Homebrew (recommended)
brew install python3

# Alternative: Download from python.org
```

#### Ubuntu/Linux
```bash
sudo apt update
sudo apt install python3 python3-pip python3-venv
```

#### Windows
1. Download from https://python.org/downloads/
2. Run installer, check "Add Python to PATH"
3. Verify installation: `python --version`

### Step 2: PostgreSQL and PostGIS Installation

#### macOS (using Homebrew)
```bash
# Install Homebrew if not present
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install PostgreSQL and PostGIS
brew install postgresql postgis

# Start PostgreSQL service
brew services start postgresql

# Verify installation
psql --version
```

#### Ubuntu/Linux
```bash
# Update package manager
sudo apt update

# Install PostgreSQL and PostGIS
sudo apt install postgresql postgresql-contrib postgis postgresql-14-postgis-3

# Start PostgreSQL service
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Set up PostgreSQL user (if needed)
sudo -u postgres createuser --interactive

# Verify installation
psql --version
```

#### Windows
1. **Download PostgreSQL**:
   - Visit https://www.postgresql.org/download/windows/
   - Download PostgreSQL installer (version 12+)
   - Run installer with default settings

2. **Install PostGIS**:
   - During PostgreSQL installation, select "Stack Builder"
   - After installation, run Stack Builder
   - Select PostGIS extension and install

3. **Verify Installation**:
   - Open Command Prompt
   - Run: `psql --version`

### Step 3: Database Setup

#### Access PostgreSQL
```bash
# Method 1: Default user (macOS/Linux)
sudo -u postgres psql

# Method 2: Your user account
psql -U your_username

# Method 3: With password prompt
psql -U postgres -h localhost
```

#### Create Project Database
```sql
-- Create database
CREATE DATABASE hello_map_dublin;

-- Create user
CREATE USER map_developer WITH PASSWORD 'dublin2025!';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE hello_map_dublin TO map_developer;

-- Connect to database
\c hello_map_dublin;

-- Enable PostGIS
CREATE EXTENSION IF NOT EXISTS postgis;

-- Verify PostGIS
SELECT PostGIS_Version();

-- Exit PostgreSQL
\q
```

### Step 4: Python Development Environment

#### Create Project Directory
```bash
mkdir hello_map_project
cd hello_map_project
```

#### Create Virtual Environment
```bash
# Create virtual environment
python3 -m venv venv_hello_map

# Activate virtual environment
# macOS/Linux:
source venv_hello_map/bin/activate

# Windows:
venv_hello_map\Scripts\activate

# Verify activation (should show (venv_hello_map) in prompt)
which python
```

#### Install Required Packages
```bash
# Create requirements file
cat > requirements.txt << 'EOF'
Django>=4.2.0
psycopg2-binary>=2.9.5
django-environ>=0.10.0
djangorestframework>=3.14.0
django-cors-headers>=4.0.0
Pillow>=9.5.0
EOF

# Update pip
pip install --upgrade pip

# Install packages
pip install -r requirements.txt

# Verify Django installation
python -c "import django; print('Django version:', django.get_version())"
```

---

## Development Tools Setup

### VS Code Configuration

#### Install VS Code
- **macOS**: `brew install --cask visual-studio-code`
- **Windows/Linux**: Download from https://code.visualstudio.com/

#### Recommended Extensions
Install these extensions for optimal development:

1. **Python** (Microsoft) - Python language support
2. **Django** - Django template support and snippets
3. **PostgreSQL** - Database management within VS Code
4. **GitLens** - Enhanced Git capabilities
5. **Bracket Pair Colorizer** - Code readability
6. **Auto Rename Tag** - HTML/XML tag editing

#### VS Code Settings
Create `.vscode/settings.json` in your project:
```json
{
    "python.defaultInterpreterPath": "./venv_hello_map/bin/python",
    "python.linting.enabled": true,
    "python.linting.pylintEnabled": true,
    "emmet.includeLanguages": {
        "django-html": "html"
    },
    "files.associations": {
        "**/*.html": "django-html"
    }
}
```

---

## Environment Configuration

### Create Environment Variables
Create `.env` file in project root:
```env
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
```

### Create .gitignore
```bash
cat > .gitignore << 'EOF'
# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
build/
develop-eggs/
dist/
downloads/
eggs/
.eggs/
lib/
lib64/
parts/
sdist/
var/
wheels/
share/python-wheels/
*.egg-info/
.installed.cfg
*.egg
MANIFEST

# Django
*.log
local_settings.py
db.sqlite3
db.sqlite3-journal

# Environment variables
.env

# Virtual environment
venv_hello_map/
ENV/
env/
venv/

# IDEs
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db
EOF
```

---

## Verification Steps

### Test Database Connection
```bash
# Test PostgreSQL connection
psql -h localhost -U map_developer -d hello_map_dublin -c "SELECT version();"

# Test PostGIS functionality
psql -h localhost -U map_developer -d hello_map_dublin -c "SELECT PostGIS_Version();"
```

### Test Python Environment
```bash
# Activate virtual environment
source venv_hello_map/bin/activate

# Test Django
python -c "import django; print('Django:', django.get_version())"

# Test PostgreSQL adapter
python -c "import psycopg2; print('psycopg2: OK')"

# Test environment variables
python -c "import environ; print('django-environ: OK')"
```

### Test Spatial Capabilities
```bash
python -c "
from django.contrib.gis.gdal import HAS_GDAL
from django.contrib.gis.geos import HAS_GEOS
print('GDAL available:', HAS_GDAL)
print('GEOS available:', HAS_GEOS)
"
```

---

## Troubleshooting

### PostgreSQL Issues

**Problem**: PostgreSQL not starting
```bash
# macOS
brew services list | grep postgresql
brew services start postgresql

# Linux
sudo systemctl status postgresql
sudo systemctl start postgresql

# Windows
# Check Services panel, start PostgreSQL service
```

**Problem**: Permission denied
```bash
# Create PostgreSQL user
sudo -u postgres createuser --interactive --pwprompt map_developer

# Grant database permissions
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE hello_map_dublin TO map_developer;"
```

**Problem**: PostGIS extension not available
```sql
-- Connect as superuser
sudo -u postgres psql

-- Check available extensions
SELECT * FROM pg_available_extensions WHERE name = 'postgis';

-- Install if available
CREATE EXTENSION IF NOT EXISTS postgis;
```

### Python Environment Issues

**Problem**: Virtual environment not activating
```bash
# Remove and recreate virtual environment
rm -rf venv_hello_map
python3 -m venv venv_hello_map
source venv_hello_map/bin/activate
```

**Problem**: Package installation errors
```bash
# Update pip and setuptools
pip install --upgrade pip setuptools wheel

# Install packages individually to isolate issues
pip install Django
pip install psycopg2-binary
```

**Problem**: Django imports failing
```bash
# Verify Django installation
pip show Django

# Check Python path
python -c "import sys; print('\n'.join(sys.path))"
```

### Django Configuration Issues

**Problem**: Database connection errors
- Verify PostgreSQL is running
- Check database credentials in `.env` file
- Test manual connection: `psql -h localhost -U map_developer -d hello_map_dublin`

**Problem**: Static files not loading
- Ensure `STATIC_URL` is configured
- Run `python manage.py collectstatic` for production
- Check `STATICFILES_DIRS` in settings

---

## Next Steps

After completing this setup:

1. **Test Environment**: Run all verification steps
2. **Start Development**: Begin Django project creation
3. **Follow Lab Guide**: Proceed with main lab instructions
4. **Documentation**: Keep notes on any custom configurations

---

## Additional Resources

### Documentation Links
- **Django**: https://docs.djangoproject.com/
- **PostGIS**: https://postgis.net/documentation/
- **Leaflet**: https://leafletjs.com/reference.html
- **PostgreSQL**: https://www.postgresql.org/docs/

### Learning Resources
- **GeoDjango Tutorial**: https://docs.djangoproject.com/en/stable/ref/contrib/gis/tutorial/
- **PostGIS Workshop**: https://postgis.net/workshops/postgis-intro/
- **Leaflet Tutorials**: https://leafletjs.com/examples.html

### Community Support
- **Django Forum**: https://forum.djangoproject.com/
- **PostGIS Users List**: https://lists.osgeo.org/mailman/listinfo/postgis-users
- **Stack Overflow**: Use tags `django`, `postgis`, `leaflet`

---

## Success Checklist

Before proceeding with the lab, ensure you can:

- [ ] Connect to PostgreSQL database
- [ ] Create and activate Python virtual environment
- [ ] Import Django without errors
- [ ] Access PostGIS functions from Python
- [ ] View spatial data in PostgreSQL
- [ ] Open and configure VS Code for development

If all items are checked, you're ready to begin the Hello Map lab! 🚀
