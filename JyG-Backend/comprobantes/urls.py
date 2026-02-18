from rest_framework.routers import DefaultRouter
from .views import ComprobanteViewSet

router = DefaultRouter()
router.register('comprobantes', ComprobanteViewSet)

urlpatterns = router.urls
