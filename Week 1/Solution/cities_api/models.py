from django.contrib.gis.db import models
from django.contrib.gis.measure import Distance
from django.contrib.gis.geos import Point, Polygon

class CityManager(models.Manager):
    """Custom manager for City model with spatial queries"""
    
    def within_radius(self, center_point, radius_km):
        """
        Find cities within a specified radius of a point
        
        Args:
            center_point: Point object (longitude, latitude)
            radius_km: Radius in kilometers
        
        Returns:
            QuerySet of cities within the radius
        """
        return self.filter(
            location__distance_lte=(center_point, Distance(km=radius_km))
        )
    
    def in_bounding_box(self, bbox):
        """
        Find cities within a bounding box
        
        Args:
            bbox: List [min_lng, min_lat, max_lng, max_lat]
        
        Returns:
            QuerySet of cities within the bounding box
        """
        min_lng, min_lat, max_lng, max_lat = bbox
        
        # Create polygon from bounding box coordinates
        bbox_polygon = Polygon.from_bbox((min_lng, min_lat, max_lng, max_lat))
        
        return self.filter(location__within=bbox_polygon)
    
    def nearest_to_point(self, point, limit=10):
        """
        Find nearest cities to a point
        
        Args:
            point: Point object (longitude, latitude)
            limit: Maximum number of cities to return
        
        Returns:
            QuerySet of nearest cities ordered by distance
        """
        from django.contrib.gis.db.models.functions import Distance as DistanceFunction
        
        return self.annotate(
            distance=DistanceFunction('location', point)
        ).order_by('distance')[:limit]

class City(models.Model):
    """City model with spatial capabilities"""
    name = models.CharField(max_length=100)
    country = models.CharField(max_length=100)
    region = models.CharField(max_length=100, blank=True)
    population = models.IntegerField()
    is_capital = models.BooleanField(default=False)
    founded_year = models.IntegerField(null=True, blank=True)
    
    # Spatial field
    location = models.PointField(srid=4326, help_text="Geographic coordinates")
    
    # Add the custom manager
    objects = CityManager()
    
    class Meta:
        verbose_name_plural = "Cities"
        ordering = ['-population']
        indexes = [
            models.Index(fields=['name']),
            models.Index(fields=['country']),
            models.Index(fields=['population']),
        ]
    
    def __str__(self):
        return f"{self.name}, {self.country}"
    
    @property
    def latitude(self):
        return self.location.y if self.location else None
    
    @property
    def longitude(self):
        return self.location.x if self.location else None