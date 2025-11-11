"""
Spatial Analysis Models - Week 8 Complete Solution

Reference implementation for spatial analysis functionality
"""

from django.contrib.gis.db import models
from django.contrib.gis.geos import Polygon, Point
from django.core.exceptions import ValidationError
from django.utils import timezone
from django.contrib.auth.models import User
import json
import math


class SpatialQuery(models.Model):
    """
    Model to store spatial query polygons for analysis
    """
    
    name = models.CharField(max_length=200, help_text="Name for this spatial query")
    polygon = models.PolygonField(srid=4326, help_text="Polygon boundary for spatial analysis")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True,
                            help_text="User who created this query")
    is_active = models.BooleanField(default=True, help_text="Whether this query is active")
    description = models.TextField(blank=True, help_text="Optional description of the query")
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = "Spatial Query"
        verbose_name_plural = "Spatial Queries"
        indexes = [
            models.Index(fields=['created_at']),
            models.Index(fields=['user', 'is_active']),
        ]
    
    def __str__(self):
        return f"{self.name} ({self.created_at.strftime('%Y-%m-%d %H:%M')})"
    
    def clean(self):
        """
        Validate the polygon geometry
        """
        super().clean()
        
        if self.polygon:
            # Check if polygon is valid
            if not self.polygon.valid:
                raise ValidationError("Polygon geometry is not valid (self-intersecting or malformed)")
            
            # Check polygon has minimum vertices
            if len(self.polygon.exterior_ring.coords) < 4:  # 4 because first/last point are same
                raise ValidationError("Polygon must have at least 3 vertices")
            
            # Check polygon is not too large (max 100,000 km²)
            area_km2 = self.get_area_km2()
            if area_km2 > 100000:
                raise ValidationError(f"Polygon area ({area_km2:.2f} km²) exceeds maximum allowed (100,000 km²)")
            
            # Check polygon is not too small (min 1 km²)
            if area_km2 < 1:
                raise ValidationError(f"Polygon area ({area_km2:.2f} km²) is too small (minimum 1 km²)")
    
    def get_cities_inside(self):
        """
        Get all cities that fall within this polygon
        """
        from cities_api.models import City
        return City.objects.filter(point__within=self.polygon)
    
    def get_area_km2(self):
        """
        Calculate polygon area in square kilometers
        """
        # Transform to Web Mercator (3857) for area calculation
        polygon_3857 = self.polygon.transform(3857, clone=True)
        area_m2 = polygon_3857.area
        return area_m2 / 1000000  # Convert to km²
    
    def get_perimeter_km(self):
        """
        Calculate polygon perimeter in kilometers
        """
        # Transform to Web Mercator (3857) for length calculation
        polygon_3857 = self.polygon.transform(3857, clone=True)
        perimeter_m = polygon_3857.length
        return perimeter_m / 1000  # Convert to km
    
    def get_centroid(self):
        """
        Get the centroid point of the polygon
        """
        return self.polygon.centroid
    
    def to_geojson(self):
        """
        Convert polygon to GeoJSON format
        """
        return json.loads(self.polygon.geojson)
    
    @classmethod
    def from_geojson(cls, geojson_data, name="Unnamed Query", user=None):
        """
        Create SpatialQuery from GeoJSON data
        """
        if geojson_data['type'] != 'Polygon':
            raise ValueError("GeoJSON must be of type 'Polygon'")
        
        coordinates = geojson_data['coordinates'][0]  # Exterior ring
        
        # Create Polygon object (ensure SRID 4326)
        polygon = Polygon(coordinates, srid=4326)
        
        # Create and return SpatialQuery instance
        return cls.objects.create(
            name=name,
            polygon=polygon,
            user=user
        )
    
    def get_buffer_zone(self, distance_m):
        """
        Create buffer zone around polygon
        
        Args:
            distance_m: Buffer distance in meters
        Returns:
            Buffered polygon geometry
        """
        # Convert meters to degrees (approximate)
        # 1 degree ≈ 111,000 meters at equator
        distance_degrees = distance_m / 111000
        
        return self.polygon.buffer(distance_degrees)


class SpatialAnalytics(models.Model):
    """
    Model to store analytics results for spatial queries
    """
    
    spatial_query = models.ForeignKey(SpatialQuery, on_delete=models.CASCADE, 
                                     related_name='analytics')
    cities_count = models.IntegerField(default=0, help_text="Number of cities in polygon")
    total_population = models.BigIntegerField(default=0, help_text="Total population in polygon")
    average_population = models.FloatField(default=0, help_text="Average city population")
    area_km2 = models.FloatField(default=0, help_text="Polygon area in square kilometers")
    perimeter_km = models.FloatField(default=0, help_text="Polygon perimeter in kilometers")
    density_per_km2 = models.FloatField(default=0, help_text="Cities per square kilometer")
    population_density_per_km2 = models.FloatField(default=0, help_text="Population per square kilometer")
    calculated_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = "Spatial Analytics"
        verbose_name_plural = "Spatial Analytics"
        ordering = ['-calculated_at']
        indexes = [
            models.Index(fields=['spatial_query', '-calculated_at']),
        ]
    
    def __str__(self):
        return f"Analytics for {self.spatial_query.name} ({self.cities_count} cities)"
    
    @classmethod
    def calculate_for_query(cls, spatial_query):
        """
        Calculate analytics for a given spatial query
        """
        cities = spatial_query.get_cities_inside()
        cities_count = cities.count()
        
        # Calculate population statistics
        populations = [city.population for city in cities if city.population]
        total_population = sum(populations) if populations else 0
        average_population = sum(populations) / len(populations) if populations else 0
        
        # Calculate geometric statistics
        area_km2 = spatial_query.get_area_km2()
        perimeter_km = spatial_query.get_perimeter_km()
        
        # Calculate densities
        density_per_km2 = cities_count / area_km2 if area_km2 > 0 else 0
        population_density_per_km2 = total_population / area_km2 if area_km2 > 0 else 0
        
        # Create analytics record
        analytics = cls.objects.create(
            spatial_query=spatial_query,
            cities_count=cities_count,
            total_population=total_population,
            average_population=average_population,
            area_km2=area_km2,
            perimeter_km=perimeter_km,
            density_per_km2=density_per_km2,
            population_density_per_km2=population_density_per_km2
        )
        
        return analytics


class SavedPolygon(models.Model):
    """
    Model for saving user-drawn polygons for later use
    """
    
    name = models.CharField(max_length=200)
    polygon = models.PolygonField(srid=4326)
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    is_public = models.BooleanField(default=False, help_text="Allow other users to see this polygon")
    tags = models.JSONField(default=list, blank=True, help_text="Tags for categorizing polygons")
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = "Saved Polygon"
        verbose_name_plural = "Saved Polygons"
    
    def __str__(self):
        return f"{self.name} by {self.user.username if self.user else 'Anonymous'}"


class BufferZone(models.Model):
    """
    Model for storing buffer zones around polygons
    """
    
    original_polygon = models.ForeignKey(SpatialQuery, on_delete=models.CASCADE,
                                        related_name='buffer_zones')
    buffer_distance_m = models.IntegerField(help_text="Buffer distance in meters")
    buffered_polygon = models.PolygonField(srid=4326, help_text="Buffered polygon geometry")
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = "Buffer Zone"
        verbose_name_plural = "Buffer Zones"
        unique_together = ['original_polygon', 'buffer_distance_m']
    
    def __str__(self):
        return f"Buffer {self.buffer_distance_m}m around {self.original_polygon.name}"
    
    def get_cities_in_buffer(self):
        """
        Get cities within the buffer zone (excluding original polygon)
        """
        from cities_api.models import City
        
        # Cities in buffer zone
        cities_in_buffer = City.objects.filter(point__within=self.buffered_polygon)
        
        # Cities in original polygon
        cities_in_original = City.objects.filter(point__within=self.original_polygon.polygon)
        
        # Return cities in buffer but not in original
        return cities_in_buffer.exclude(id__in=cities_in_original.values_list('id', flat=True))


# Utility functions

def validate_polygon_complexity(polygon):
    """
    Validate that polygon is not too complex for efficient processing
    """
    # Check number of vertices
    vertex_count = len(polygon.exterior_ring.coords)
    if vertex_count > 1000:
        return False, f"Polygon has too many vertices ({vertex_count}, max 1000)"
    
    # Check for self-intersections
    if not polygon.valid:
        return False, "Polygon has self-intersections or other validity issues"
    
    # Check overall complexity (ratio of perimeter² to area)
    try:
        polygon_3857 = polygon.transform(3857, clone=True)
        area = polygon_3857.area
        perimeter = polygon_3857.length
        
        if area > 0:
            complexity_ratio = (perimeter * perimeter) / area
            # High ratio indicates very thin/complex shape
            if complexity_ratio > 1000000:  # Adjust threshold as needed
                return False, "Polygon shape is too complex (very thin or convoluted)"
    except:
        return False, "Error calculating polygon complexity"
    
    return True, "Polygon complexity is acceptable"


def optimize_polygon_for_query(polygon, tolerance_m=100):
    """
    Optimize polygon geometry for spatial queries
    """
    try:
        # Transform to projected coordinate system for operations
        polygon_3857 = polygon.transform(3857, clone=True)
        
        # Simplify polygon to reduce complexity
        simplified = polygon_3857.simplify(tolerance_m, preserve_topology=True)
        
        # Transform back to WGS84
        optimized = simplified.transform(4326, clone=True)
        
        # Ensure polygon is still valid
        if not optimized.valid:
            return polygon  # Return original if simplification broke it
        
        return optimized
        
    except Exception:
        # Return original polygon if optimization fails
        return polygon


def calculate_polygon_statistics(polygon):
    """
    Calculate comprehensive statistics for a polygon
    """
    from cities_api.models import City
    
    # Basic geometric properties
    area_km2 = polygon.transform(3857, clone=True).area / 1000000
    perimeter_km = polygon.transform(3857, clone=True).length / 1000
    centroid = polygon.centroid
    
    # Find cities within polygon
    cities = City.objects.filter(point__within=polygon)
    cities_count = cities.count()
    
    # Population statistics
    populations = [city.population for city in cities if city.population]
    total_population = sum(populations) if populations else 0
    avg_population = total_population / len(populations) if populations else 0
    
    # Density calculations
    city_density = cities_count / area_km2 if area_km2 > 0 else 0
    pop_density = total_population / area_km2 if area_km2 > 0 else 0
    
    return {
        'area_km2': round(area_km2, 2),
        'perimeter_km': round(perimeter_km, 2),
        'centroid': {'lat': centroid.y, 'lng': centroid.x},
        'cities_count': cities_count,
        'total_population': total_population,
        'average_population': round(avg_population, 0) if avg_population else 0,
        'city_density_per_km2': round(city_density, 2),
        'population_density_per_km2': round(pop_density, 0),
        'vertex_count': len(polygon.exterior_ring.coords),
    }