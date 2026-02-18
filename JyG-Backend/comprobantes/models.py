from decimal import Decimal
from django.db import models
from clientes.models import Cliente
from productos.models import Producto


class Comprobante(models.Model):
    TIPO_CHOICES = [
        ('boleta', 'Boleta'),
        ('factura', 'Factura'),
    ]
    MONEDA_CHOICES = [
        ('PEN', 'Soles'),
        ('USD', 'Dólares'),
    ]
    ESTADO_CHOICES = [
        ('vigente', 'Vigente'),
        ('anulado', 'Anulado'),
    ]

    cliente = models.ForeignKey(Cliente, on_delete=models.PROTECT, null=True, blank=True, related_name='comprobantes')
    tipo_comprobante = models.CharField(max_length=20, choices=TIPO_CHOICES)
    serie = models.CharField(max_length=10)
    correlativo = models.CharField(max_length=20)
    fecha_emision = models.DateTimeField()
    gravada = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    igv = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    total = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    moneda = models.CharField(max_length=5, choices=MONEDA_CHOICES, default='PEN')
    observaciones = models.TextField(blank=True, default='')
    estado = models.CharField(max_length=20, choices=ESTADO_CHOICES, default='vigente')
    motivo_anulacion = models.TextField(blank=True, default='')
    fecha_anulacion = models.DateTimeField(null=True, blank=True)

    # SUNAT
    sunat_enviada = models.BooleanField(default=False)
    sunat_aceptada = models.BooleanField(default=False)
    codigo_respuesta = models.IntegerField(null=True, blank=True)
    descripcion_respuesta = models.CharField(max_length=500, blank=True, default='')

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'comprobantes'
        unique_together = ['serie', 'correlativo']
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.serie}-{self.correlativo}'


class DetalleComprobante(models.Model):
    comprobante = models.ForeignKey(Comprobante, on_delete=models.CASCADE, related_name='items')
    producto = models.ForeignKey(Producto, on_delete=models.PROTECT)
    cantidad = models.DecimalField(max_digits=10, decimal_places=2)
    unidad = models.CharField(max_length=20, default='UNI')
    descripcion = models.CharField(max_length=250, blank=True, default='')
    detalle_adicional = models.CharField(max_length=250, blank=True, default='')
    precio_unitario = models.DecimalField(max_digits=10, decimal_places=2)
    valor_unitario = models.DecimalField(max_digits=10, decimal_places=2)
    importe = models.DecimalField(max_digits=12, decimal_places=2)

    class Meta:
        db_table = 'detalle_comprobante'

    def save(self, *args, **kwargs):
        self.valor_unitario = round(self.precio_unitario / Decimal('1.18'), 2)
        self.importe = round(self.cantidad * self.precio_unitario, 2)
        super().save(*args, **kwargs)

    def __str__(self):
        return f'{self.descripcion} x{self.cantidad}'
