# Advanced Web Mapping Labs - Solutions

This repository contains complete solutions for the CMPU4058 Advanced Web Mapping course labs at Technological University Dublin (TUD).

## 📋 Overview

These solutions demonstrate progressive web mapping concepts using Django, PostGIS, and modern web technologies. Each week builds upon previous concepts to create comprehensive spatial web applications.

## 🗂️ Repository Structure

```
├── Week 1/
│   └── Solution/          # Django web mapping fundamentals /maps
├── Week 2/
│   └── Solution/          # Spatial queries and data management / spatial data app
├── Week 3/
│   └── Solution/          # Advanced PostGIS operations / cities
├── Week 4/
│   └── Solution/          # RESTful API development /cities_api
├── Week 5/
│   └── Solution/          # Interactive mapping interfaces /cities_query
├── Week 6/
│   └── european_mapping/  # European mapping dashboard with analytics (separate project with multiple apps)
└── Week 7-8/              # Advanced topics and final projects
```

## 🚀 Technologies Used

- **Backend**: Django 4.2+ with PostGIS
- **Database**: PostgreSQL with PostGIS extension
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Mapping**: Leaflet.js
- **APIs**: Django REST Framework
- **Styling**: Bootstrap 5
- **Data Format**: GeoJSON

## 📚 Lab Solutions Summary

### Week 1: Django Web Mapping Fundamentals
**Location**: `Week 1/Solution/`

- **Basic Django setup** with spatial capabilities
- **Multiple applications**: cities, cities_api, cities_query, maps, spatial_data_app
- **PostGIS integration** for spatial data storage
- **Leaflet integration** for interactive maps
- **Template-based rendering** with spatial context

**Key Features**:
- Environment setup and configuration
- Basic spatial models with Point geometry
- Simple map visualization
- Data management commands

### Week 6: European Urban Planning Dashboard
**Location**: `Week 6/Solution/european_mapping/`

Advanced spatial web application featuring European cities and regions data.

**Key Features**:
- **Comprehensive API**: RESTful endpoints with GeoJSON serialization
- **Advanced Filtering**: Population, area, and category-based filters
- **Interactive Dashboard**: Real-time map controls and layer management
- **Analytics System**: Statistical aggregation and data insights
- **Responsive Design**: Bootstrap-based UI with mobile support

**Applications**:
- `cities/` - City data models and management
- `regions/` - Regional administrative boundaries
- `api/` - REST API endpoints with filtering
- `dashboard/` - Web interface with analytics

## 🔧 Quick Start

### Prerequisites
- Python 3.8+
- PostgreSQL 12+ with PostGIS extension
- Git

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/braufi-dev/awm.git
   cd awm
   ```

2. **Set up virtual environment**:
   ```bash
   python -m venv webmapping_env
   source webmapping_env/bin/activate  # On Windows: webmapping_env\Scripts\activate
   ```

3. **Navigate to a solution** (e.g., Week 6):
   ```bash
   cd "Week 6/european_mapping"
   ```

4. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

5. **Configure database** (PostgreSQL with PostGIS):
   ```sql
   CREATE DATABASE european_mapping;
   CREATE EXTENSION postgis;
   ```

6. **Update settings**:
   ```python
   # In settings.py, update database configuration
   DATABASES = {
       'default': {
           'ENGINE': 'django.contrib.gis.db.backends.postgis',
           'NAME': 'european_mapping',
           'USER': 'your_db_user',
           'PASSWORD': 'your_db_password',
           'HOST': 'localhost',
           'PORT': '5432',
       }
   }
   ```

7. **Run migrations and start server**:
   ```bash
   python manage.py migrate
   python manage.py runserver
   ```

## 🌐 API Endpoints (Week 6 Example)

### Cities API
- `GET /api/cities/` - List all cities (GeoJSON)
- `GET /api/cities/statistics/` - City statistics
- **Filters**: `population_min`, `population_max`, `country`, `city_type`, `urban_area_min`, `urban_area_max`

### Regions API
- `GET /api/regions/` - List all regions (GeoJSON)
- `GET /api/regions/statistics/` - Region statistics
- **Filters**: `population_min`, `population_max`, `area_min`, `area_max`, `country`, `region_type`

### Example Usage
```bash
# Get cities with population > 1,000,000
curl "http://localhost:8000/api/cities/?population_min=1000000"

# Get regions in Germany
curl "http://localhost:8000/api/regions/?country=Germany"

# Get city statistics
curl "http://localhost:8000/api/cities/statistics/"
```

## 🎯 Learning Objectives

### Technical Skills
- **Spatial Database Management**: PostGIS operations, spatial queries
- **Web API Development**: RESTful services, GeoJSON serialization
- **Interactive Mapping**: Leaflet.js, layer management, user interactions
- **Full-Stack Development**: Django backend, responsive frontend
- **Data Visualization**: Statistical aggregation, dashboard design

### Spatial Concepts
- **Coordinate Systems**: Projections, transformations
- **Geometry Types**: Points, polygons, spatial relationships
- **Spatial Queries**: Distance, containment, intersection
- **Performance Optimization**: Spatial indexing, query optimization

## 📊 Features Showcase

### Week 6 Dashboard Features
- **Real-time Filtering**: Dynamic data updates without page refresh
- **Layer Control**: Toggle cities/regions visibility
- **Interactive Maps**: Click for details, hover information
- **Export Functionality**: GeoJSON and statistics download
- **Analytics Page**: Comprehensive data insights
- **Responsive Design**: Works on desktop, tablet, mobile

### Data Management
- **Population Commands**: Automated data loading
- **Data Validation**: Spatial data integrity checks
- **Migration System**: Version-controlled database changes
- **Test Coverage**: Comprehensive API and model testing

## 🧪 Testing

Each solution includes comprehensive tests:

```bash
# Run all tests
python manage.py test

# Run specific app tests
python manage.py test cities_api.tests

# Run with coverage
coverage run --source='.' manage.py test
coverage report
```

## 🔍 Troubleshooting

### Common Issues

1. **PostGIS Not Found**:
   ```bash
   # Install PostGIS
   sudo apt-get install postgresql-12-postgis-3  # Ubuntu
   brew install postgis  # macOS
   ```

2. **Migration Errors**:
   ```bash
   python manage.py makemigrations --empty appname
   python manage.py migrate --fake-initial
   ```

3. **Static Files Issues**:
   ```bash
   python manage.py collectstatic
   ```

## 📈 Performance Considerations

- **Spatial Indexing**: All geometry fields use GiST indexes
- **Query Optimization**: Efficient filtering with database-level operations
- **Caching**: Static file serving, database query optimization
- **Data Pagination**: Large datasets handled efficiently

## 🤝 Contributing

This is an educational repository. For improvements:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

Educational use - Technological University Dublin

## 👨‍💻 Author

**CMPU4058 Student**  
Advanced Web Mapping Course  
Technological University Dublin

## 📞 Support

For questions about these solutions:
- Review lab documentation in each week's folder
- Check Django and PostGIS documentation
- Consult course materials and lectures

## 🔗 Related Resources

- [Django Documentation](https://docs.djangoproject.com/)
- [PostGIS Documentation](https://postgis.net/docs/)
- [Leaflet Documentation](https://leafletjs.com/reference.html)
- [GeoJSON Specification](https://geojson.org/)
- [Django REST Framework](https://www.django-rest-framework.org/)

---

**Last Updated**: October 2025  
**Course**: CMPU4058 - Advanced Web Mapping  
**Institution**: Technological University Dublin