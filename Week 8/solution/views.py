"""
Spatial Analysis Views - Week 8 Complete Solution

Reference implementation for spatial API endpoints
"""

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.gis.geos import Polygon, Point, GEOSException
from django.contrib.gis.measure import D
from django.db import transaction
from django.core.cache import cache
from django.core.paginator import Paginator
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
import json
import logging
import time

from .models import SpatialQuery, SpatialAnalytics, BufferZone, calculate_polygon_statistics
from .serializers import (
    SpatialQuerySerializer, 
    SpatialAnalyticsSerializer,
    CitySerializer,
    BufferZoneSerializer
)

logger = logging.getLogger(__name__)


class CitiesInPolygonAPIView(APIView):
    """
    API endpoint to find cities within a drawn polygon
    """
    
    def post(self, request):
        """
        Find cities within the provided polygon
        """
        try:
            start_time = time.time()
            
            # Extract and validate polygon data
            polygon_data = request.data.get('polygon')
            if not polygon_data:
                return Response({'error': 'Polygon data required'}, status=400)
            
            # Validate GeoJSON structure
            if polygon_data.get('type') != 'Polygon':
                return Response({'error': 'GeoJSON must be of type Polygon'}, status=400)
            
            coordinates = polygon_data.get('coordinates')
            if not coordinates or not coordinates[0]:
                return Response({'error': 'Invalid polygon coordinates'}, status=400)
            
            # Create Django Polygon object
            try:
                polygon = Polygon(coordinates[0], srid=4326)
            except Exception as e:
                return Response({'error': f'Invalid polygon geometry: {str(e)}'}, status=400)
            
            # Validate polygon geometry
            if not polygon.valid:
                return Response({'error': 'Invalid polygon geometry (self-intersecting or malformed)'}, status=400)
            
            # Check polygon size limits
            area_km2 = polygon.transform(3857, clone=True).area / 1000000
            if area_km2 > 100000:  # 100,000 km² limit
                return Response({'error': f'Polygon too large ({area_km2:.2f} km²). Maximum allowed: 100,000 km²'}, status=400)
            
            if area_km2 < 0.01:  # 0.01 km² minimum
                return Response({'error': f'Polygon too small ({area_km2:.6f} km²). Minimum required: 0.01 km²'}, status=400)
            
            # Query cities within polygon
            from cities_api.models import City
            cities_queryset = City.objects.filter(point__within=polygon).select_related()
            cities = list(cities_queryset)
            
            # Calculate comprehensive analytics
            analytics = self._calculate_analytics(polygon, cities)
            
            # Serialize cities data
            cities_data = []
            for city in cities:
                city_data = {
                    'id': city.id,
                    'name': city.name,
                    'country': city.country,
                    'latitude': float(city.latitude),
                    'longitude': float(city.longitude),
                    'population': city.population,
                    'founded_year': getattr(city, 'founded_year', None),
                    'area_km2': getattr(city, 'area_km2', None),
                    'description': getattr(city, 'description', ''),
                }
                cities_data.append(city_data)
            
            # Prepare response
            response_data = {
                'cities': cities_data,
                'analytics': analytics,
                'query_info': {
                    'polygon_area_km2': area_km2,
                    'query_time_ms': round((time.time() - start_time) * 1000, 2),
                    'cities_found': len(cities),
                }
            }
            
            # Optionally save query
            if request.data.get('save_query'):
                query_name = request.data.get('query_name', f'Query {int(time.time())}')
                try:
                    spatial_query = SpatialQuery.objects.create(
                        name=query_name,
                        polygon=polygon,
                        user=request.user if request.user.is_authenticated else None,
                        description=request.data.get('query_description', '')
                    )
                    response_data['saved_query_id'] = spatial_query.id
                except Exception as e:
                    logger.warning(f"Failed to save query: {e}")
            
            # Cache results for a short time
            cache_key = f"spatial_query_{hash(str(coordinates))}"
            cache.set(cache_key, response_data, timeout=300)  # 5 minutes
            
            return Response(response_data)
            
        except GEOSException as e:
            logger.error(f"Geometry error in polygon query: {e}")
            return Response({'error': 'Invalid geometry data'}, status=400)
        except Exception as e:
            logger.error(f"Error in polygon query: {e}")
            return Response({'error': 'Internal server error'}, status=500)
    
    def _calculate_analytics(self, polygon, cities):
        """
        Calculate comprehensive analytics for polygon and cities
        """
        # Basic polygon metrics
        polygon_3857 = polygon.transform(3857, clone=True)
        area_km2 = polygon_3857.area / 1000000
        perimeter_km = polygon_3857.length / 1000
        centroid = polygon.centroid
        
        # City statistics
        cities_count = len(cities)
        populations = [city.population for city in cities if city.population]
        total_population = sum(populations) if populations else 0
        avg_population = total_population / len(populations) if populations else 0
        
        # Find largest and smallest cities
        largest_city = max(cities, key=lambda c: c.population or 0) if cities else None
        smallest_city = min(cities, key=lambda c: c.population or float('inf')) if cities else None
        
        # Density calculations
        city_density = cities_count / area_km2 if area_km2 > 0 else 0
        pop_density = total_population / area_km2 if area_km2 > 0 else 0
        
        return {
            'polygon': {
                'area_km2': round(area_km2, 3),
                'perimeter_km': round(perimeter_km, 2),
                'centroid': {
                    'latitude': round(centroid.y, 6),
                    'longitude': round(centroid.x, 6)
                }
            },
            'cities': {
                'count': cities_count,
                'total_population': total_population,
                'average_population': round(avg_population, 0) if avg_population else 0,
                'largest_city': {
                    'name': largest_city.name,
                    'population': largest_city.population
                } if largest_city else None,
                'smallest_city': {
                    'name': smallest_city.name,
                    'population': smallest_city.population
                } if smallest_city and smallest_city.population else None
            },
            'density': {
                'cities_per_km2': round(city_density, 3),
                'population_per_km2': round(pop_density, 0)
            }
        }


class PolygonAnalyticsAPIView(APIView):
    """
    API endpoint to get detailed analytics for a polygon
    """
    
    def post(self, request):
        """
        Calculate detailed analytics for a polygon
        """
        try:
            polygon_data = request.data.get('polygon')
            if not polygon_data:
                return Response({'error': 'Polygon data required'}, status=400)
            
            # Parse polygon
            polygon = Polygon(polygon_data['coordinates'][0], srid=4326)
            
            # Calculate comprehensive statistics
            stats = calculate_polygon_statistics(polygon)
            
            # Optional demographic analysis
            demographics = {}
            if request.data.get('include_demographics'):
                demographics = self._calculate_demographics(polygon)
            
            # Optional buffer analysis
            buffer_analysis = {}
            buffer_distance = request.data.get('buffer_distance')
            if buffer_distance:
                buffer_analysis = self._analyze_buffer_zone(polygon, buffer_distance)
            
            return Response({
                'statistics': stats,
                'demographics': demographics,
                'buffer_analysis': buffer_analysis
            })
            
        except Exception as e:
            logger.error(f"Error calculating analytics: {e}")
            return Response({'error': 'Analytics calculation failed'}, status=500)
    
    def _calculate_demographics(self, polygon):
        """
        Calculate demographic statistics for cities in polygon
        """
        from cities_api.models import City
        cities = City.objects.filter(point__within=polygon)
        
        # Population distribution
        populations = [city.population for city in cities if city.population]
        if not populations:
            return {'message': 'No population data available'}
        
        populations.sort()
        n = len(populations)
        
        return {
            'population_stats': {
                'min': min(populations),
                'max': max(populations),
                'median': populations[n//2] if n > 0 else 0,
                'total': sum(populations),
                'average': sum(populations) / n if n > 0 else 0
            },
            'size_distribution': {
                'small_cities': sum(1 for p in populations if p < 100000),
                'medium_cities': sum(1 for p in populations if 100000 <= p < 1000000),
                'large_cities': sum(1 for p in populations if p >= 1000000)
            }
        }
    
    def _analyze_buffer_zone(self, polygon, distance_m):
        """
        Analyze buffer zone around polygon
        """
        try:
            # Create buffer (convert meters to degrees approximately)
            distance_degrees = distance_m / 111000
            buffered_polygon = polygon.buffer(distance_degrees)
            
            # Find cities in buffer zone (excluding original polygon)
            from cities_api.models import City
            cities_in_buffer = City.objects.filter(point__within=buffered_polygon)
            cities_in_original = City.objects.filter(point__within=polygon)
            buffer_only_cities = cities_in_buffer.exclude(
                id__in=cities_in_original.values_list('id', flat=True)
            )
            
            return {
                'buffer_distance_m': distance_m,
                'cities_in_buffer_only': buffer_only_cities.count(),
                'total_cities_with_buffer': cities_in_buffer.count(),
                'buffer_area_km2': round(buffered_polygon.transform(3857, clone=True).area / 1000000, 3)
            }
        except Exception as e:
            return {'error': f'Buffer analysis failed: {str(e)}'}


class SavedQueriesAPIView(APIView):
    """
    API endpoint to manage saved spatial queries
    """
    
    def get(self, request):
        """
        Get list of saved spatial queries with pagination
        """
        try:
            # Filter queries by user if authenticated
            if request.user.is_authenticated:
                queries = SpatialQuery.objects.filter(
                    user=request.user, 
                    is_active=True
                ).order_by('-created_at')
            else:
                # Return public queries for anonymous users
                queries = SpatialQuery.objects.filter(
                    is_active=True,
                    user__isnull=True
                ).order_by('-created_at')[:10]  # Limit for anonymous users
            
            # Pagination
            page_size = min(int(request.GET.get('page_size', 20)), 50)  # Max 50
            paginator = Paginator(queries, page_size)
            page_number = request.GET.get('page', 1)
            page_obj = paginator.get_page(page_number)
            
            # Serialize queries
            serializer = SpatialQuerySerializer(page_obj.object_list, many=True)
            
            return Response({
                'queries': serializer.data,
                'pagination': {
                    'current_page': page_obj.number,
                    'total_pages': paginator.num_pages,
                    'total_queries': paginator.count,
                    'has_next': page_obj.has_next(),
                    'has_previous': page_obj.has_previous()
                }
            })
            
        except Exception as e:
            logger.error(f"Error fetching saved queries: {e}")
            return Response({'error': 'Failed to fetch queries'}, status=500)
    
    def post(self, request):
        """
        Save a new spatial query
        """
        try:
            polygon_data = request.data.get('polygon')
            name = request.data.get('name', f'Query {int(time.time())}')
            description = request.data.get('description', '')
            
            if not polygon_data:
                return Response({'error': 'Polygon data required'}, status=400)
            
            # Create polygon object
            polygon = Polygon(polygon_data['coordinates'][0], srid=4326)
            
            # Create spatial query
            spatial_query = SpatialQuery.objects.create(
                name=name,
                polygon=polygon,
                description=description,
                user=request.user if request.user.is_authenticated else None
            )
            
            # Calculate and save analytics
            analytics = SpatialAnalytics.calculate_for_query(spatial_query)
            
            serializer = SpatialQuerySerializer(spatial_query)
            
            return Response({
                'message': 'Query saved successfully',
                'query': serializer.data,
                'analytics': SpatialAnalyticsSerializer(analytics).data
            }, status=201)
            
        except Exception as e:
            logger.error(f"Error saving query: {e}")
            return Response({'error': 'Failed to save query'}, status=500)
    
    def delete(self, request, query_id):
        """
        Delete a saved spatial query
        """
        try:
            query = SpatialQuery.objects.get(
                id=query_id,
                user=request.user if request.user.is_authenticated else None
            )
            query.delete()
            
            return Response({'message': 'Query deleted successfully'})
            
        except SpatialQuery.DoesNotExist:
            return Response({'error': 'Query not found'}, status=404)
        except Exception as e:
            logger.error(f"Error deleting query: {e}")
            return Response({'error': 'Failed to delete query'}, status=500)


class BufferAnalysisAPIView(APIView):
    """
    API endpoint for buffer zone analysis around polygons
    """
    
    def post(self, request):
        """
        Create buffer zone around polygon and analyze
        """
        try:
            polygon_data = request.data.get('polygon')
            buffer_distance = request.data.get('buffer_distance', 1000)
            analysis_type = request.data.get('analysis_type', 'cities')
            
            if not polygon_data:
                return Response({'error': 'Polygon data required'}, status=400)
            
            # Create polygon object
            polygon = Polygon(polygon_data['coordinates'][0], srid=4326)
            
            # Create buffer zone (convert meters to degrees)
            distance_degrees = buffer_distance / 111000
            buffered_polygon = polygon.buffer(distance_degrees)
            
            # Analyze content based on type
            if analysis_type == 'cities':
                analysis_results = self._analyze_cities_in_buffer(
                    polygon, buffered_polygon, buffer_distance
                )
            else:
                analysis_results = {'error': 'Unsupported analysis type'}
            
            return Response({
                'buffer_polygon': json.loads(buffered_polygon.geojson),
                'original_polygon': json.loads(polygon.geojson),
                'buffer_distance_m': buffer_distance,
                'analysis': analysis_results
            })
            
        except Exception as e:
            logger.error(f"Error in buffer analysis: {e}")
            return Response({'error': 'Buffer analysis failed'}, status=500)
    
    def _analyze_cities_in_buffer(self, original_polygon, buffered_polygon, buffer_distance):
        """
        Analyze cities within buffer zone
        """
        from cities_api.models import City
        
        # Cities in original polygon
        cities_original = City.objects.filter(point__within=original_polygon)
        original_count = cities_original.count()
        
        # Cities in buffered area
        cities_buffered = City.objects.filter(point__within=buffered_polygon)
        buffered_count = cities_buffered.count()
        
        # Cities only in buffer zone (not in original)
        buffer_only_cities = cities_buffered.exclude(
            id__in=cities_original.values_list('id', flat=True)
        )
        buffer_only_count = buffer_only_cities.count()
        
        # Population analysis
        buffer_only_populations = [
            city.population for city in buffer_only_cities 
            if city.population
        ]
        buffer_population = sum(buffer_only_populations) if buffer_only_populations else 0
        
        # Calculate areas
        original_area = original_polygon.transform(3857, clone=True).area / 1000000
        buffer_area = buffered_polygon.transform(3857, clone=True).area / 1000000
        buffer_zone_area = buffer_area - original_area
        
        return {
            'cities_in_original': original_count,
            'cities_in_buffer_zone': buffer_only_count,
            'total_cities_with_buffer': buffered_count,
            'buffer_zone_population': buffer_population,
            'areas': {
                'original_km2': round(original_area, 3),
                'buffer_zone_km2': round(buffer_zone_area, 3),
                'total_area_km2': round(buffer_area, 3)
            },
            'density_in_buffer_zone': {
                'cities_per_km2': round(buffer_only_count / buffer_zone_area, 3) if buffer_zone_area > 0 else 0,
                'population_per_km2': round(buffer_population / buffer_zone_area, 0) if buffer_zone_area > 0 else 0
            }
        }


class SpatialStatisticsAPIView(APIView):
    """
    API endpoint for advanced spatial statistics
    """
    
    @method_decorator(cache_page(300))  # Cache for 5 minutes
    def get(self, request):
        """
        Get overall spatial statistics from the database
        """
        try:
            from cities_api.models import City
            
            # Overall statistics
            total_cities = City.objects.count()
            total_queries = SpatialQuery.objects.filter(is_active=True).count()
            
            # Recent query statistics
            recent_analytics = SpatialAnalytics.objects.select_related('spatial_query')[:10]
            
            # Calculate average metrics
            if recent_analytics.exists():
                avg_cities_per_query = sum(a.cities_count for a in recent_analytics) / len(recent_analytics)
                avg_area_per_query = sum(a.area_km2 for a in recent_analytics) / len(recent_analytics)
            else:
                avg_cities_per_query = 0
                avg_area_per_query = 0
            
            return Response({
                'overview': {
                    'total_cities': total_cities,
                    'total_queries': total_queries,
                    'average_cities_per_query': round(avg_cities_per_query, 1),
                    'average_area_per_query_km2': round(avg_area_per_query, 2)
                },
                'recent_queries': [
                    {
                        'name': analytics.spatial_query.name,
                        'cities_count': analytics.cities_count,
                        'area_km2': analytics.area_km2,
                        'created_at': analytics.calculated_at.isoformat()
                    }
                    for analytics in recent_analytics
                ]
            })
            
        except Exception as e:
            logger.error(f"Error calculating statistics: {e}")
            return Response({'error': 'Statistics calculation failed'}, status=500)


class ExportSpatialDataAPIView(APIView):
    """
    API endpoint to export spatial query results
    """
    
    def post(self, request):
        """
        Export spatial data in various formats
        """
        try:
            export_format = request.data.get('format', 'geojson')
            polygon_data = request.data.get('polygon')
            include_cities = request.data.get('include_cities', True)
            
            if not polygon_data:
                return Response({'error': 'Polygon data required'}, status=400)
            
            polygon = Polygon(polygon_data['coordinates'][0], srid=4326)
            
            if export_format == 'geojson':
                export_data = self._export_as_geojson(polygon, include_cities)
            elif export_format == 'csv':
                export_data = self._export_as_csv(polygon, include_cities)
            elif export_format == 'kml':
                export_data = self._export_as_kml(polygon, include_cities)
            else:
                return Response({'error': 'Unsupported export format'}, status=400)
            
            return Response({
                'format': export_format,
                'data': export_data,
                'filename': f'spatial_export_{int(time.time())}.{export_format}'
            })
            
        except Exception as e:
            logger.error(f"Error exporting data: {e}")
            return Response({'error': 'Export failed'}, status=500)
    
    def _export_as_geojson(self, polygon, include_cities):
        """Export as GeoJSON format"""
        features = [
            {
                'type': 'Feature',
                'geometry': json.loads(polygon.geojson),
                'properties': {
                    'type': 'query_polygon',
                    'area_km2': polygon.transform(3857, clone=True).area / 1000000
                }
            }
        ]
        
        if include_cities:
            from cities_api.models import City
            cities = City.objects.filter(point__within=polygon)
            
            for city in cities:
                features.append({
                    'type': 'Feature',
                    'geometry': {
                        'type': 'Point',
                        'coordinates': [float(city.longitude), float(city.latitude)]
                    },
                    'properties': {
                        'type': 'city',
                        'name': city.name,
                        'country': city.country,
                        'population': city.population
                    }
                })
        
        return {
            'type': 'FeatureCollection',
            'features': features
        }
    
    def _export_as_csv(self, polygon, include_cities):
        """Export cities as CSV format"""
        if not include_cities:
            return "No city data requested for CSV export"
        
        from cities_api.models import City
        cities = City.objects.filter(point__within=polygon)
        
        csv_lines = ['Name,Country,Latitude,Longitude,Population']
        
        for city in cities:
            csv_lines.append(f'"{city.name}","{city.country}",{city.latitude},{city.longitude},{city.population or 0}')
        
        return '\n'.join(csv_lines)
    
    def _export_as_kml(self, polygon, include_cities):
        """Export as KML format for Google Earth"""
        kml_content = """<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>Spatial Analysis Export</name>
    <description>Exported from Spatial Analysis Tool</description>
"""
        
        # Add polygon
        coords = ','.join([f'{coord[0]},{coord[1]},0' for coord in polygon.exterior_ring.coords])
        kml_content += f"""
    <Placemark>
      <name>Query Polygon</name>
      <Polygon>
        <outerBoundaryIs>
          <LinearRing>
            <coordinates>{coords}</coordinates>
          </LinearRing>
        </outerBoundaryIs>
      </Polygon>
    </Placemark>
"""
        
        # Add cities if requested
        if include_cities:
            from cities_api.models import City
            cities = City.objects.filter(point__within=polygon)
            
            for city in cities:
                kml_content += f"""
    <Placemark>
      <name>{city.name}</name>
      <description>Country: {city.country}, Population: {city.population or 'Unknown'}</description>
      <Point>
        <coordinates>{city.longitude},{city.latitude},0</coordinates>
      </Point>
    </Placemark>
"""
        
        kml_content += """
  </Document>
</kml>
"""
        return kml_content