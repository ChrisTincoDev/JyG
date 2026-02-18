from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('productos.urls')),
    path('api/', include('clientes.urls')),
    path('api/', include('comprobantes.urls')),
    path('api/', include('empresa.urls')),
]
