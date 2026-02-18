from django.utils import timezone
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Comprobante
from .serializers import ComprobanteSerializer, ComprobanteListSerializer


class ComprobanteViewSet(viewsets.ModelViewSet):
    queryset = Comprobante.objects.select_related('cliente').prefetch_related('items__producto').all()

    def get_serializer_class(self):
        if self.action == 'list':
            return ComprobanteListSerializer
        return ComprobanteSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        tipo = self.request.query_params.get('tipo')
        if tipo:
            qs = qs.filter(tipo_comprobante=tipo)
        desde = self.request.query_params.get('desde')
        hasta = self.request.query_params.get('hasta')
        if desde:
            qs = qs.filter(fecha_emision__date__gte=desde)
        if hasta:
            qs = qs.filter(fecha_emision__date__lte=hasta)
        return qs

    @action(detail=False, methods=['get'])
    def siguiente_correlativo(self, request):
        tipo = request.query_params.get('tipo', 'boleta')
        serie = 'B001' if tipo == 'boleta' else 'F001'
        ultimo = Comprobante.objects.filter(serie=serie).order_by('-correlativo').first()
        if ultimo:
            siguiente = str(int(ultimo.correlativo) + 1).zfill(8)
        else:
            siguiente = '00000001'
        return Response({'serie': serie, 'correlativo': siguiente})

    @action(detail=True, methods=['post'])
    def anular(self, request, pk=None):
        comprobante = self.get_object()
        if comprobante.estado == 'anulado':
            return Response(
                {'detail': 'Este comprobante ya fue anulado.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        motivo = request.data.get('motivo', '')
        if not motivo.strip():
            return Response(
                {'detail': 'Debe indicar un motivo de anulación.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        comprobante.estado = 'anulado'
        comprobante.motivo_anulacion = motivo
        comprobante.fecha_anulacion = timezone.now()
        comprobante.save()
        return Response({'detail': 'Comprobante anulado correctamente.', 'id': comprobante.id})
