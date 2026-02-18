from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TrabajadorViewSet, EstadoViewSet, login

router = DefaultRouter()
router.register(r'trabajadores', TrabajadorViewSet)
router.register(r'estados', EstadoViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('login/', login, name='login'),
]
