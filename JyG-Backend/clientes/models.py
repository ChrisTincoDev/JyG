from django.db import models


class Cliente(models.Model):
    TIPO_DOC_CHOICES = [
        ('dni', 'DNI'),
        ('ruc', 'RUC'),
        ('ce', 'Carné de Extranjería'),
        ('pasaporte', 'Pasaporte'),
    ]

    nombre = models.CharField(max_length=200)
    tipo_documento = models.CharField(max_length=20, choices=TIPO_DOC_CHOICES)
    numero_documento = models.CharField(max_length=20, unique=True)
    direccion = models.CharField(max_length=300, blank=True, default='')
    email = models.EmailField(blank=True, default='')
    telefono = models.CharField(max_length=20, blank=True, default='')

    class Meta:
        db_table = 'clientes'

    def __str__(self):
        return f'{self.nombre} ({self.numero_documento})'
