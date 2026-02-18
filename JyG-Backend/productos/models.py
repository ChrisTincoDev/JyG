from decimal import Decimal
from django.db import models


class Categoria(models.Model):
    nombre = models.CharField(max_length=100, unique=True)

    class Meta:
        db_table = 'categoria'
        verbose_name_plural = 'categorias'

    def __str__(self):
        return self.nombre


class Producto(models.Model):
    UNIDAD_CHOICES = [
        ('UNI', 'Unidad'),
        ('KG', 'Kilogramo'),
    ]

    codigo = models.CharField(max_length=20, unique=True)
    nombre = models.CharField(max_length=150)
    descripcion = models.CharField(max_length=255, blank=True, default='')
    precio_costo = models.DecimalField(max_digits=10, decimal_places=2)
    precio_venta = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    stock = models.IntegerField(default=0)
    unidad_medida = models.CharField(max_length=20, choices=UNIDAD_CHOICES, default='UNI')
    categoria = models.ForeignKey(Categoria, on_delete=models.PROTECT, related_name='productos')

    class Meta:
        db_table = 'productos'

    def save(self, *args, **kwargs):
        if self.precio_venta is None:
            self.precio_venta = round(self.precio_costo * Decimal('1.18'), 2)
        super().save(*args, **kwargs)

    def __str__(self):
        return f'{self.codigo} - {self.nombre}'
