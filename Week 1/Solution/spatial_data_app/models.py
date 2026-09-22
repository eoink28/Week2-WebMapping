# filepath: Week 1/spatial_data_app/models.py
from django.contrib.gis.db import models

from django.contrib.gis.db import models
from django.contrib.gis.measure import Distance


class IrishCounty(models.Model):
    """Model for Irish county boundaries"""
    countyname = models.CharField(max_length=100)
    geom = models.PolygonField(srid=4326)
    
    class Meta:
        db_table = 'irish_counties'  # Use existing table
        managed = False  # Don't let Django manage this table
        verbose_name = "Irish County"
        verbose_name_plural = "Irish Counties"
    
    def __str__(self):
        return self.countyname
    
    @property
    def area_km2(self):
        """Calculate area in square kilometers"""
        return self.geom.area * 12365.181  # Convert to km2 (approximate for Ireland)

class EuropeanCity(models.Model):
    """Model for European cities"""
    name = models.CharField(max_length=100)
    population = models.IntegerField()
    country = models.CharField(max_length=100)
    geom = models.PointField(srid=4326)
    
    class Meta:
        db_table = 'european_cities'  # Use existing table
        managed = False  # Don't let Django manage this table
        verbose_name = "European City"
        verbose_name_plural = "European Cities"
        ordering = ['-population']
    
    def __str__(self):
        return f"{self.name}, {self.country}"
    
    @property
    def latitude(self):
        return self.geom.y
    
    @property
    def longitude(self):
        return self.geom.x
    
    @property
    def population_category(self):
        """Categorize cities by population"""
        if self.population >= 5000000:
            return "Megacity"
        elif self.population >= 1000000:
            return "Major City"
        elif self.population >= 500000:
            return "Large City"
        else:
            return "City"

class TransportationRoute(models.Model):
    """Model for transportation routes"""
    ROUTE_TYPES = [
        ('highway', 'Highway'),
        ('railway', 'Railway'),
        ('waterway', 'Waterway'),
        ('airway', 'Airway'),
    ]
    
    route_name = models.CharField(max_length=100)
    route_type = models.CharField(max_length=50, choices=ROUTE_TYPES)
    geom = models.LineStringField(srid=4326)
    
    class Meta:
        db_table = 'transportation_routes'  # Use existing table
        managed = False  # Don't let Django manage this table
        verbose_name = "Transportation Route"
        verbose_name_plural = "Transportation Routes"
    
    def __str__(self):
        return f"{self.route_name} ({self.get_route_type_display()})"
    
    @property
    def length_km(self):
        """Calculate route length in kilometers"""
        return self.geom.length * 111.32  # Convert degrees to km (approximate)
    

class EuropeanCityManager(models.Manager):
    """Custom manager for European cities with spatial methods"""
    
    def major_cities(self):
        """Return cities with population > 1 million"""
        return self.filter(population__gt=1000000)
    
    def in_country(self, country_name):
        """Filter cities by country"""
        return self.filter(country__icontains=country_name)
    
    def within_distance_of_point(self, point, distance_km):
        """Find cities within specified distance of a point"""
        return self.filter(
            geom__distance_lte=(point, Distance(km=distance_km))
        )
    
    def nearest_to_point(self, point, limit=5):
        """Find nearest cities to a point"""
        return self.filter(
            geom__distance_lte=(point, Distance(km=2000))  # 2000km max
        ).annotate(
            distance=models.Distance('geom', point)
        ).order_by('distance')[:limit]

# Update EuropeanCity model to use custom manager
class EuropeanCity(models.Model):
    # ... existing fields ...
    
    objects = EuropeanCityManager()

