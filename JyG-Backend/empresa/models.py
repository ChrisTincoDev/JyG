from django.db import models


class Emisor(models.Model):
    ruc = models.CharField(max_length=11, unique=True)
    razon_social = models.CharField(max_length=200)
    nombre_comercial = models.CharField(max_length=200, blank=True, default='')
    direccion = models.CharField(max_length=300, blank=True, default='')
    telefono = models.CharField(max_length=20, blank=True, default='')
    encargado = models.CharField(max_length=200, blank=True, default='')

    class Meta:
        db_table = 'emisor'
        verbose_name_plural = 'emisores'

    def __str__(self):
        return self.razon_social
