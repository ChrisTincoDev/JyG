from rest_framework.routers import DefaultRouter
from .views import EmisorViewSet

router = DefaultRouter()
router.register('empresa', EmisorViewSet)

urlpatterns = router.urls
