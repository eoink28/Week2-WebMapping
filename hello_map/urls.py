from django.contrib import admin
from django.urls import path, include
from mapping.views import map_view

urlpatterns = [
    path('admin/', admin.site.urls),
    path('spatial/', include('spatial_analysis.urls')),
    path('', map_view, name='map'),
]   

