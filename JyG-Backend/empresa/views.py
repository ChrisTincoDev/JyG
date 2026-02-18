from rest_framework import viewsets, mixins
from .models import Emisor
from .serializers import EmisorSerializer


class EmisorViewSet(mixins.ListModelMixin,
                    mixins.RetrieveModelMixin,
                    mixins.UpdateModelMixin,
                    viewsets.GenericViewSet):
    queryset = Emisor.objects.all()
    serializer_class = EmisorSerializer
