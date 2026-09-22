# 🌍 Week 6: European Mapping - REST API with GeoJSON

A comprehensive Django-based web mapping application that serves spatial data through RESTful APIs with GeoJSON support. This project demonstrates advanced web mapping techniques, spatial database integration, and API development for geographic information systems.

## 🎯 **Project Overview**

This application provides a complete REST API for European cities and regions data, featuring:

- **Spatial Database**: PostGIS-powered PostgreSQL backend
- **REST API**: Django REST Framework with GeoJSON serialization
- **Advanced Filtering**: Population, area, and geographic queries
- **Interactive Dashboard**: Real-time analytics and visualization
- **Comprehensive Testing**: Full API endpoint coverage

## 🏗️ **Architecture**

```
european_mapping/
├── api/                 # REST API endpoints and serializers
├── cities/              # European cities data model and management
├── regions/             # European regions data model and management  
├── dashboard/           # Analytics dashboard and visualization
├── european_mapping/    # Django project configuration
└── tests/              # Comprehensive test suite
```

## ✨ **Key Features**

### 🗺️ **Spatial Data Models**
- **Cities**: European cities with coordinates, population, and metadata
- **Regions**: European regions with boundaries and geographic data

### 🔌 **REST API Endpoints**
- `GET /api/cities/` - List cities with filtering support
- `GET /api/cities/{id}/` - Retrieve specific city details
- `GET /api/regions/` - List regions with filtering support  
- `GET /api/regions/{id}/` - Retrieve specific region details

### 🎛️ **Advanced Filtering**
- **Population**: `?min_population=100000&max_population=1000000`
- **Area**: `?min_area=50&max_area=500`
- **Geography**: Spatial queries and geographic filtering
- **Combining Filters**: Multiple parameters for precise queries

### 📊 **Dashboard Features**
- Real-time analytics and statistics
- Interactive data visualization
- Aggregated metrics and insights
- Responsive design for all devices

## 🚀 **Quick Start**

### Prerequisites
- Python 3.8+
- PostgreSQL with PostGIS extension
- Django 4.2+
- Virtual environment (recommended)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/braufi-dev/awm.git
   cd awm/Week\ 6/european_mapping
   ```

2. **Set up virtual environment**:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**:
   ```bash
   pip install django djangorestframework django-filter psycopg2-binary
   ```

4. **Configure database** in `european_mapping/settings.py`:
   ```python
   DATABASES = {
       'default': {
           'ENGINE': 'django.contrib.gis.db.backends.postgis',
           'NAME': 'european_mapping_db',
           'USER': 'your_username',
           'PASSWORD': 'your_password',
           'HOST': 'localhost',
           'PORT': '5432',
       }
   }
   ```

5. **Run migrations**:
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

6. **Populate data**:
   ```bash
   python manage.py populate_cities
   python manage.py populate_regions
   # OR populate all data at once:
   python manage.py populate_all_data
   ```

7. **Start development server**:
   ```bash
   python manage.py runserver
   ```

## 📝 **API Usage Examples**

### Get All Cities
```bash
curl http://localhost:8000/api/cities/
```

### Filter Cities by Population
```bash
curl "http://localhost:8000/api/cities/?min_population=500000&max_population=2000000"
```

### Get Regions with Area Filtering
```bash
curl "http://localhost:8000/api/regions/?min_area=1000"
```

### Response Format (GeoJSON)
```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [2.3522, 48.8566]
      },
      "properties": {
        "id": 1,
        "name": "Paris",
        "country": "France",
        "population": 2165423,
        "area": 105.4
      }
    }
  ]
}
```

## 🧪 **Testing**

Run the comprehensive test suite:

```bash
# Run all tests
python manage.py test

# Run specific test modules
python manage.py test tests.test_api_endpoints
python manage.py test cities.tests
python manage.py test regions.tests

# Run with coverage (if coverage.py is installed)
coverage run --source='.' manage.py test
coverage report
```

## 📊 **Dashboard Access**

- **Main Dashboard**: http://localhost:8000/dashboard/
- **Analytics View**: http://localhost:8000/dashboard/analytics/
- **API Documentation**: http://localhost:8000/api/

## 🔧 **Management Commands**

### Data Population
```bash
# Populate cities data
python manage.py populate_cities

# Populate regions data  
python manage.py populate_regions

# Populate all data (cities + regions)
python manage.py populate_all_data
```

### Database Management
```bash
# Create and apply migrations
python manage.py makemigrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser
```

## 🎨 **Technology Stack**

- **Backend**: Django 4.2+ with Django REST Framework
- **Database**: PostgreSQL with PostGIS extension
- **API**: RESTful endpoints with GeoJSON serialization
- **Filtering**: django-filter for advanced query capabilities
- **Testing**: Django's built-in testing framework
- **Frontend**: HTML5, CSS3, JavaScript (for dashboard)

## 📚 **Learning Objectives**

This project demonstrates:

1. **Spatial Database Design**: PostGIS integration with Django
2. **REST API Development**: Building scalable web APIs
3. **GeoJSON Serialization**: Converting spatial data to web formats
4. **Advanced Filtering**: Complex query capabilities
5. **Testing Strategies**: Comprehensive API testing
6. **Dashboard Development**: Data visualization and analytics

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 **License**

This project is part of the CMPU4058 - Advanced Web Mapping course at Technological University Dublin.

## 🙋‍♂️ **Support**

For questions or issues:
- Create an issue in the GitHub repository
- Contact the course instructor
- Check the Django and PostGIS documentation

---

**🎓 Course**: CMPU4058 - Advanced Web Mapping  
**🏫 Institution**: Technological University Dublin  
**📅 Created**: October 2025  
**👨‍💻 Developer**: Braufi