from decimal import Decimal
from rest_framework import serializers
from .models import Comprobante, DetalleComprobante
from clientes.serializers import ClienteSerializer


class DetalleComprobanteSerializer(serializers.ModelSerializer):
    producto_nombre = serializers.CharField(source='producto.nombre', read_only=True)
    producto_codigo = serializers.CharField(source='producto.codigo', read_only=True)

    class Meta:
        model = DetalleComprobante
        fields = [
            'id', 'producto', 'producto_nombre', 'producto_codigo',
            'cantidad', 'unidad', 'descripcion', 'detalle_adicional',
            'precio_unitario', 'valor_unitario', 'importe',
        ]
        read_only_fields = ['valor_unitario', 'importe']


class ComprobanteSerializer(serializers.ModelSerializer):
    items = DetalleComprobanteSerializer(many=True)
    cliente_detalle = ClienteSerializer(source='cliente', read_only=True)

    class Meta:
        model = Comprobante
        fields = [
            'id', 'cliente', 'cliente_detalle',
            'tipo_comprobante', 'serie', 'correlativo',
            'fecha_emision', 'gravada', 'igv', 'total', 'moneda',
            'observaciones', 'sunat_enviada', 'sunat_aceptada',
            'codigo_respuesta', 'descripcion_respuesta',
            'items', 'created_at',
        ]
        read_only_fields = ['gravada', 'igv', 'total', 'created_at']

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        comprobante = Comprobante.objects.create(**validated_data)

        total = 0
        for item_data in items_data:
            detalle = DetalleComprobante.objects.create(
                comprobante=comprobante, **item_data
            )
            total += detalle.importe

        comprobante.total = round(total, 2)
        comprobante.gravada = round(total / Decimal('1.18'), 2)
        comprobante.igv = comprobante.total - comprobante.gravada
        comprobante.save()
        return comprobante


class ComprobanteListSerializer(serializers.ModelSerializer):
    cliente_nombre = serializers.CharField(source='cliente.nombre', read_only=True, default='')
    items_count = serializers.IntegerField(source='items.count', read_only=True)

    class Meta:
        model = Comprobante
        fields = [
            'id', 'tipo_comprobante', 'serie', 'correlativo',
            'fecha_emision', 'gravada', 'igv', 'total', 'moneda',
            'cliente_nombre', 'items_count',
            'sunat_enviada', 'sunat_aceptada', 'created_at',
        ]
