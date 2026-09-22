"""
Django management command to populate the database with sample European city data.
This command creates 50 major European cities with realistic population, economic,
and geographic data for testing and demonstration purposes.
"""

from django.core.management.base import BaseCommand, CommandError
from django.contrib.gis.geos import Point
from django.db import transaction
from django.db import models
from advanced_js_mapping.models import AdvancedCity
import logging

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = 'Populate the database with 50 sample European cities'

    def add_arguments(self, parser):
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Clear existing city data before populating',
        )
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would be created without actually creating it',
        )

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Starting European cities data population...'))

        # European cities data with realistic information
        cities_data = [
            # Western Europe
            {
                'name': 'London',
                'country': 'United Kingdom',
                'latitude': 51.5074,
                'longitude': -0.1278,
                'population': 9648110,
                'area_km2': 1572.0,
                'city_type': 'capital',
                'gdp_per_capita': 56000,
                'unemployment_rate': 4.2,
                'avg_temperature': 11.0,
                'climate_zone': 'temperate'
            },
            {
                'name': 'Paris',
                'country': 'France',
                'latitude': 48.8566,
                'longitude': 2.3522,
                'population': 11017230,
                'area_km2': 105.4,
                'city_type': 'capital',
                'gdp_per_capita': 67000,
                'unemployment_rate': 7.8,
                'avg_temperature': 12.0,
                'climate_zone': 'temperate'
            },
            {
                'name': 'Berlin',
                'country': 'Germany',
                'latitude': 52.5200,
                'longitude': 13.4050,
                'population': 3669491,
                'area_km2': 891.7,
                'city_type': 'capital',
                'gdp_per_capita': 42000,
                'unemployment_rate': 8.1,
                'avg_temperature': 9.6,
                'climate_zone': 'temperate'
            },
            {
                'name': 'Madrid',
                'country': 'Spain',
                'latitude': 40.4168,
                'longitude': -3.7038,
                'population': 6752983,
                'area_km2': 604.3,
                'city_type': 'capital',
                'gdp_per_capita': 38000,
                'unemployment_rate': 13.2,
                'avg_temperature': 15.0,
                'climate_zone': 'mediterranean'
            },
            {
                'name': 'Rome',
                'country': 'Italy',
                'latitude': 41.9028,
                'longitude': 12.4964,
                'population': 4342212,
                'area_km2': 1285.0,
                'city_type': 'capital',
                'gdp_per_capita': 35000,
                'unemployment_rate': 9.7,
                'avg_temperature': 16.0,
                'climate_zone': 'mediterranean'
            },
            {
                'name': 'Amsterdam',
                'country': 'Netherlands',
                'latitude': 52.3676,
                'longitude': 4.9041,
                'population': 2431000,
                'area_km2': 219.3,
                'city_type': 'capital',
                'gdp_per_capita': 63000,
                'unemployment_rate': 3.4,
                'avg_temperature': 10.2,
                'climate_zone': 'temperate'
            },
            {
                'name': 'Brussels',
                'country': 'Belgium',
                'latitude': 50.8503,
                'longitude': 4.3517,
                'population': 1218255,
                'area_km2': 161.4,
                'city_type': 'capital',
                'gdp_per_capita': 58000,
                'unemployment_rate': 5.9,
                'avg_temperature': 10.5,
                'climate_zone': 'temperate'
            },
            {
                'name': 'Vienna',
                'country': 'Austria',
                'latitude': 48.2082,
                'longitude': 16.3738,
                'population': 2600000,
                'area_km2': 414.6,
                'city_type': 'capital',
                'gdp_per_capita': 55000,
                'unemployment_rate': 6.1,
                'avg_temperature': 10.4,
                'climate_zone': 'temperate'
            },
            {
                'name': 'Zurich',
                'country': 'Switzerland',
                'latitude': 47.3769,
                'longitude': 8.5417,
                'population': 1553423,
                'area_km2': 87.9,
                'city_type': 'major',
                'gdp_per_capita': 95000,
                'unemployment_rate': 2.1,
                'avg_temperature': 9.3,
                'climate_zone': 'temperate'
            },
            {
                'name': 'Munich',
                'country': 'Germany',
                'latitude': 48.1351,
                'longitude': 11.5820,
                'population': 2761295,
                'area_km2': 310.4,
                'city_type': 'major',
                'gdp_per_capita': 68000,
                'unemployment_rate': 3.2,
                'avg_temperature': 9.3,
                'climate_zone': 'temperate'
            },
            
            # Northern Europe
            {
                'name': 'Stockholm',
                'country': 'Sweden',
                'latitude': 59.3293,
                'longitude': 18.0686,
                'population': 2415000,
                'area_km2': 188.0,
                'city_type': 'capital',
                'gdp_per_capita': 61000,
                'unemployment_rate': 6.8,
                'avg_temperature': 7.4,
                'climate_zone': 'continental'
            },
            {
                'name': 'Copenhagen',
                'country': 'Denmark',
                'latitude': 55.6761,
                'longitude': 12.5683,
                'population': 2057142,
                'area_km2': 86.4,
                'city_type': 'capital',
                'gdp_per_capita': 67000,
                'unemployment_rate': 4.9,
                'avg_temperature': 8.9,
                'climate_zone': 'temperate'
            },
            {
                'name': 'Oslo',
                'country': 'Norway',
                'latitude': 59.9139,
                'longitude': 10.7522,
                'population': 1546706,
                'area_km2': 454.0,
                'city_type': 'capital',
                'gdp_per_capita': 89000,
                'unemployment_rate': 3.7,
                'avg_temperature': 6.4,
                'climate_zone': 'continental'
            },
            {
                'name': 'Helsinki',
                'country': 'Finland',
                'latitude': 60.1699,
                'longitude': 24.9384,
                'population': 1305893,
                'area_km2': 715.5,
                'city_type': 'capital',
                'gdp_per_capita': 54000,
                'unemployment_rate': 6.7,
                'avg_temperature': 5.9,
                'climate_zone': 'continental'
            },
            {
                'name': 'Dublin',
                'country': 'Ireland',
                'latitude': 53.3441,
                'longitude': -6.2675,
                'population': 1388000,
                'area_km2': 318.0,
                'city_type': 'capital',
                'gdp_per_capita': 89000,
                'unemployment_rate': 4.2,
                'avg_temperature': 9.8,
                'climate_zone': 'temperate'
            },
            
            # Eastern Europe
            {
                'name': 'Warsaw',
                'country': 'Poland',
                'latitude': 52.2297,
                'longitude': 21.0122,
                'population': 3100844,
                'area_km2': 517.2,
                'city_type': 'capital',
                'gdp_per_capita': 25000,
                'unemployment_rate': 3.2,
                'avg_temperature': 8.5,
                'climate_zone': 'continental'
            },
            {
                'name': 'Prague',
                'country': 'Czech Republic',
                'latitude': 50.0755,
                'longitude': 14.4378,
                'population': 2709418,
                'area_km2': 496.2,
                'city_type': 'capital',
                'gdp_per_capita': 27000,
                'unemployment_rate': 2.1,
                'avg_temperature': 9.0,
                'climate_zone': 'temperate'
            },
            {
                'name': 'Budapest',
                'country': 'Hungary',
                'latitude': 47.4979,
                'longitude': 19.0402,
                'population': 3303786,
                'area_km2': 525.2,
                'city_type': 'capital',
                'gdp_per_capita': 22000,
                'unemployment_rate': 3.4,
                'avg_temperature': 11.0,
                'climate_zone': 'temperate'
            },
            {
                'name': 'Krakow',
                'country': 'Poland',
                'latitude': 50.0647,
                'longitude': 19.9450,
                'population': 1725000,
                'area_km2': 327.0,
                'city_type': 'major',
                'gdp_per_capita': 23000,
                'unemployment_rate': 2.8,
                'avg_temperature': 8.7,
                'climate_zone': 'continental'
            },
            {
                'name': 'Bucharest',
                'country': 'Romania',
                'latitude': 44.4268,
                'longitude': 26.1025,
                'population': 2161000,
                'area_km2': 228.0,
                'city_type': 'capital',
                'gdp_per_capita': 18000,
                'unemployment_rate': 5.2,
                'avg_temperature': 11.1,
                'climate_zone': 'continental'
            },
            
            # Southern Europe
            {
                'name': 'Barcelona',
                'country': 'Spain',
                'latitude': 41.3851,
                'longitude': 2.1734,
                'population': 5664579,
                'area_km2': 101.4,
                'city_type': 'major',
                'gdp_per_capita': 35000,
                'unemployment_rate': 11.8,
                'avg_temperature': 16.0,
                'climate_zone': 'mediterranean'
            },
            {
                'name': 'Milan',
                'country': 'Italy',
                'latitude': 45.4642,
                'longitude': 9.1900,
                'population': 3250315,
                'area_km2': 181.8,
                'city_type': 'major',
                'gdp_per_capita': 45000,
                'unemployment_rate': 6.1,
                'avg_temperature': 13.2,
                'climate_zone': 'temperate'
            },
            {
                'name': 'Naples',
                'country': 'Italy',
                'latitude': 40.8518,
                'longitude': 14.2681,
                'population': 2186853,
                'area_km2': 119.0,
                'city_type': 'major',
                'gdp_per_capita': 25000,
                'unemployment_rate': 15.7,
                'avg_temperature': 16.0,
                'climate_zone': 'mediterranean'
            },
            {
                'name': 'Athens',
                'country': 'Greece',
                'latitude': 37.9838,
                'longitude': 23.7275,
                'population': 3168846,
                'area_km2': 412.0,
                'city_type': 'capital',
                'gdp_per_capita': 20000,
                'unemployment_rate': 16.3,
                'avg_temperature': 19.2,
                'climate_zone': 'mediterranean'
            },
            {
                'name': 'Lisbon',
                'country': 'Portugal',
                'latitude': 38.7223,
                'longitude': -9.1393,
                'population': 2963929,
                'area_km2': 100.1,
                'city_type': 'capital',
                'gdp_per_capita': 28000,
                'unemployment_rate': 6.1,
                'avg_temperature': 17.4,
                'climate_zone': 'mediterranean'
            },
            
            # Additional major cities
            {
                'name': 'Hamburg',
                'country': 'Germany',
                'latitude': 53.5511,
                'longitude': 9.9937,
                'population': 2448000,
                'area_km2': 755.0,
                'city_type': 'major',
                'gdp_per_capita': 65000,
                'unemployment_rate': 6.1,
                'avg_temperature': 9.1,
                'climate_zone': 'temperate'
            },
            {
                'name': 'Lyon',
                'country': 'France',
                'latitude': 45.7640,
                'longitude': 4.8357,
                'population': 2323221,
                'area_km2': 47.9,
                'city_type': 'major',
                'gdp_per_capita': 52000,
                'unemployment_rate': 7.8,
                'avg_temperature': 12.5,
                'climate_zone': 'temperate'
            },
            {
                'name': 'Marseille',
                'country': 'France',
                'latitude': 43.2965,
                'longitude': 5.3698,
                'population': 2029273,
                'area_km2': 240.6,
                'city_type': 'major',
                'gdp_per_capita': 35000,
                'unemployment_rate': 9.5,
                'avg_temperature': 15.8,
                'climate_zone': 'mediterranean'
            },
            {
                'name': 'Turin',
                'country': 'Italy',
                'latitude': 45.0703,
                'longitude': 7.6869,
                'population': 1702845,
                'area_km2': 130.2,
                'city_type': 'major',
                'gdp_per_capita': 32000,
                'unemployment_rate': 7.9,
                'avg_temperature': 12.2,
                'climate_zone': 'temperate'
            },
            {
                'name': 'Seville',
                'country': 'Spain',
                'latitude': 37.3891,
                'longitude': -5.9845,
                'population': 1950219,
                'area_km2': 140.0,
                'city_type': 'major',
                'gdp_per_capita': 28000,
                'unemployment_rate': 17.2,
                'avg_temperature': 19.2,
                'climate_zone': 'mediterranean'
            },
            {
                'name': 'Rotterdam',
                'country': 'Netherlands',
                'latitude': 51.9244,
                'longitude': 4.4777,
                'population': 1466000,
                'area_km2': 324.1,
                'city_type': 'major',
                'gdp_per_capita': 57000,
                'unemployment_rate': 4.1,
                'avg_temperature': 10.3,
                'climate_zone': 'temperate'
            },
            
            # Smaller European cities
            {
                'name': 'Gothenburg',
                'country': 'Sweden',
                'latitude': 57.7089,
                'longitude': 11.9746,
                'population': 1025000,
                'area_km2': 203.7,
                'city_type': 'medium',
                'gdp_per_capita': 58000,
                'unemployment_rate': 7.2,
                'avg_temperature': 8.2,
                'climate_zone': 'temperate'
            },
            {
                'name': 'Cologne',
                'country': 'Germany',
                'latitude': 50.9375,
                'longitude': 6.9603,
                'population': 1188000,
                'area_km2': 405.2,
                'city_type': 'major',
                'gdp_per_capita': 59000,
                'unemployment_rate': 7.8,
                'avg_temperature': 10.6,
                'climate_zone': 'temperate'
            },
            {
                'name': 'Frankfurt',
                'country': 'Germany',
                'latitude': 50.1109,
                'longitude': 8.6821,
                'population': 2320000,
                'area_km2': 248.3,
                'city_type': 'major',
                'gdp_per_capita': 73000,
                'unemployment_rate': 5.6,
                'avg_temperature': 10.6,
                'climate_zone': 'temperate'
            },
            {
                'name': 'Valencia',
                'country': 'Spain',
                'latitude': 39.4699,
                'longitude': -0.3763,
                'population': 2581147,
                'area_km2': 134.6,
                'city_type': 'major',
                'gdp_per_capita': 30000,
                'unemployment_rate': 12.4,
                'avg_temperature': 18.4,
                'climate_zone': 'mediterranean'
            },
            {
                'name': 'Porto',
                'country': 'Portugal',
                'latitude': 41.1579,
                'longitude': -8.6291,
                'population': 1757000,
                'area_km2': 41.4,
                'city_type': 'major',
                'gdp_per_capita': 25000,
                'unemployment_rate': 7.8,
                'avg_temperature': 15.1,
                'climate_zone': 'temperate'
            },
            {
                'name': 'Florence',
                'country': 'Italy',
                'latitude': 43.7696,
                'longitude': 11.2558,
                'population': 1014423,
                'area_km2': 102.4,
                'city_type': 'medium',
                'gdp_per_capita': 35000,
                'unemployment_rate': 6.8,
                'avg_temperature': 15.8,
                'climate_zone': 'mediterranean'
            },
            {
                'name': 'Antwerp',
                'country': 'Belgium',
                'latitude': 51.2194,
                'longitude': 4.4025,
                'population': 1200000,
                'area_km2': 204.5,
                'city_type': 'major',
                'gdp_per_capita': 52000,
                'unemployment_rate': 6.1,
                'avg_temperature': 10.8,
                'climate_zone': 'temperate'
            },
            {
                'name': 'Edinburgh',
                'country': 'United Kingdom',
                'latitude': 55.9533,
                'longitude': -3.1883,
                'population': 901455,
                'area_km2': 264.0,
                'city_type': 'major',
                'gdp_per_capita': 48000,
                'unemployment_rate': 3.8,
                'avg_temperature': 8.8,
                'climate_zone': 'temperate'
            },
            {
                'name': 'Thessaloniki',
                'country': 'Greece',
                'latitude': 40.6401,
                'longitude': 22.9444,
                'population': 1110000,
                'area_km2': 19.3,
                'city_type': 'major',
                'gdp_per_capita': 18000,
                'unemployment_rate': 18.5,
                'avg_temperature': 16.0,
                'climate_zone': 'mediterranean'
            },
            {
                'name': 'Bilbao',
                'country': 'Spain',
                'latitude': 43.2627,
                'longitude': -2.9253,
                'population': 875000,
                'area_km2': 41.5,
                'city_type': 'medium',
                'gdp_per_capita': 39000,
                'unemployment_rate': 10.2,
                'avg_temperature': 14.5,
                'climate_zone': 'temperate'
            },
            {
                'name': 'Bologna',
                'country': 'Italy',
                'latitude': 44.4949,
                'longitude': 11.3426,
                'population': 1017196,
                'area_km2': 140.9,
                'city_type': 'medium',
                'gdp_per_capita': 38000,
                'unemployment_rate': 5.8,
                'avg_temperature': 14.2,
                'climate_zone': 'temperate'
            },
            {
                'name': 'Gdansk',
                'country': 'Poland',
                'latitude': 54.3520,
                'longitude': 18.6466,
                'population': 1120000,
                'area_km2': 262.0,
                'city_type': 'major',
                'gdp_per_capita': 24000,
                'unemployment_rate': 3.1,
                'avg_temperature': 8.2,
                'climate_zone': 'temperate'
            },
            {
                'name': 'Bratislava',
                'country': 'Slovakia',
                'latitude': 48.1486,
                'longitude': 17.1077,
                'population': 432000,
                'area_km2': 367.6,
                'city_type': 'capital',
                'gdp_per_capita': 28000,
                'unemployment_rate': 4.9,
                'avg_temperature': 10.5,
                'climate_zone': 'temperate'
            },
            {
                'name': 'Ljubljana',
                'country': 'Slovenia',
                'latitude': 46.0569,
                'longitude': 14.5058,
                'population': 295000,
                'area_km2': 163.8,
                'city_type': 'capital',
                'gdp_per_capita': 32000,
                'unemployment_rate': 4.4,
                'avg_temperature': 10.8,
                'climate_zone': 'temperate'
            },
            {
                'name': 'Zagreb',
                'country': 'Croatia',
                'latitude': 45.8150,
                'longitude': 15.9819,
                'population': 1088841,
                'area_km2': 641.4,
                'city_type': 'capital',
                'gdp_per_capita': 19000,
                'unemployment_rate': 6.8,
                'avg_temperature': 12.7,
                'climate_zone': 'temperate'
            },
            {
                'name': 'Tallinn',
                'country': 'Estonia',
                'latitude': 59.4370,
                'longitude': 24.7536,
                'population': 461000,
                'area_km2': 159.2,
                'city_type': 'capital',
                'gdp_per_capita': 29000,
                'unemployment_rate': 4.4,
                'avg_temperature': 6.4,
                'climate_zone': 'continental'
            },
            {
                'name': 'Riga',
                'country': 'Latvia',
                'latitude': 56.9496,
                'longitude': 24.1052,
                'population': 742572,
                'area_km2': 304.0,
                'city_type': 'capital',
                'gdp_per_capita': 22000,
                'unemployment_rate': 6.2,
                'avg_temperature': 7.1,
                'climate_zone': 'continental'
            },
            {
                'name': 'Vilnius',
                'country': 'Lithuania',
                'latitude': 54.6872,
                'longitude': 25.2797,
                'population': 840000,
                'area_km2': 401.0,
                'city_type': 'capital',
                'gdp_per_capita': 26000,
                'unemployment_rate': 6.1,
                'avg_temperature': 7.4,
                'climate_zone': 'continental'
            },
            {
                'name': 'Nice',
                'country': 'France',
                'latitude': 43.7102,
                'longitude': 7.2620,
                'population': 1006402,
                'area_km2': 71.9,
                'city_type': 'medium',
                'gdp_per_capita': 42000,
                'unemployment_rate': 8.2,
                'avg_temperature': 15.9,
                'climate_zone': 'mediterranean'
            },
            {
                'name': 'Geneva',
                'country': 'Switzerland',
                'latitude': 46.2044,
                'longitude': 6.1432,
                'population': 599700,
                'area_km2': 15.9,
                'city_type': 'major',
                'gdp_per_capita': 92000,
                'unemployment_rate': 3.1,
                'avg_temperature': 10.1,
                'climate_zone': 'temperate'
            }
        ]

        if options['dry_run']:
            self.stdout.write(
                self.style.WARNING('DRY RUN: Would create the following cities:')
            )
            for city in cities_data:
                self.stdout.write(f"- {city['name']}, {city['country']}")
            return

        if options['clear']:
            self.stdout.write('Clearing existing city data...')
            deleted_count = AdvancedCity.objects.all().count()
            AdvancedCity.objects.all().delete()
            self.stdout.write(
                self.style.WARNING(f'Deleted {deleted_count} existing cities')
            )

        created_count = 0
        skipped_count = 0

        try:
            with transaction.atomic():
                for city_data in cities_data:
                    # Check if city already exists
                    existing_city = AdvancedCity.objects.filter(
                        name=city_data['name'],
                        country=city_data['country']
                    ).first()

                    if existing_city:
                        self.stdout.write(
                            self.style.WARNING(
                                f'Skipping {city_data["name"]}, {city_data["country"]} - already exists'
                            )
                        )
                        skipped_count += 1
                        continue

                    # Create Point geometry
                    location = Point(city_data['longitude'], city_data['latitude'])

                    # Create the city (population_density is calculated automatically as a property)
                    city = AdvancedCity.objects.create(
                        name=city_data['name'],
                        country=city_data['country'],
                        location=location,
                        latitude=city_data['latitude'],
                        longitude=city_data['longitude'],
                        population=city_data['population'],
                        area_km2=city_data['area_km2'],
                        city_type=city_data['city_type'],
                        gdp_per_capita=city_data['gdp_per_capita'],
                        unemployment_rate=city_data['unemployment_rate'],
                        data_source='populate_command'
                    )

                    self.stdout.write(
                        self.style.SUCCESS(
                            f'Created: {city.name}, {city.country} '
                            f'(Pop: {city.population:,}, Type: {city.city_type}, '
                            f'Density: {city.population_density} per km²)'
                        )
                    )
                    created_count += 1

        except Exception as e:
            raise CommandError(f'Error creating cities: {str(e)}')

        # Summary
        self.stdout.write('\n' + '='*60)
        self.stdout.write(self.style.SUCCESS('POPULATION SUMMARY:'))
        self.stdout.write(f'✅ Created: {created_count} cities')
        self.stdout.write(f'⚠️  Skipped: {skipped_count} cities (already existed)')
        self.stdout.write(f'📊 Total cities in database: {AdvancedCity.objects.count()}')

        # Statistics by country
        self.stdout.write('\n📈 Cities by Country:')
        country_stats = AdvancedCity.objects.values('country').annotate(
            count=models.Count('id')
        ).order_by('-count')

        for stat in country_stats:
            self.stdout.write(f"   {stat['country']}: {stat['count']} cities")

        # Statistics by city type
        self.stdout.write('\n🏙️  Cities by Type:')
        type_stats = AdvancedCity.objects.values('city_type').annotate(
            count=models.Count('id')
        ).order_by('-count')

        for stat in type_stats:
            self.stdout.write(f"   {stat['city_type']}: {stat['count']} cities")

        self.stdout.write('\n' + '='*60)
        self.stdout.write(
            self.style.SUCCESS(
                f'✅ Successfully populated database with {created_count} European cities!'
            )
        )
        self.stdout.write(
            'You can now use the interactive map to draw polygons and search for cities.'
        )