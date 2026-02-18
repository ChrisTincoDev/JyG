from django.db import models
from django.contrib.auth.hashers import make_password, check_password


class Estado(models.Model):
    id_estado = models.AutoField(primary_key=True, verbose_name='ID Estado')
    estado = models.CharField(max_length=20, verbose_name='Estado')

    class Meta:
        db_table = 'estado'
        verbose_name = 'Estado'
        verbose_name_plural = 'Estados'

    def __str__(self):
        return self.estado


class Trabajador(models.Model):
    id_trabajador = models.AutoField(primary_key=True, verbose_name='ID Trabajador')
    nombre_usuario = models.CharField(max_length=50, unique=True, verbose_name='Nombre de Usuario')
    contraseña = models.CharField(max_length=128, verbose_name='Contraseña')
    rol = models.CharField(max_length=50, verbose_name='Rol')
    id_estado = models.ForeignKey(
        Estado,
        on_delete=models.PROTECT,
        db_column='id_estado',
        verbose_name='Estado'
    )

    class Meta:
        db_table = 'trabajador'
        verbose_name = 'Trabajador'
        verbose_name_plural = 'Trabajadores'
        ordering = ['nombre_usuario']

    def __str__(self):
        return self.nombre_usuario

    def set_password(self, raw_password):
        self.contraseña = make_password(raw_password)

    def check_password(self, raw_password):
        return check_password(raw_password, self.contraseña)

    @property
    def activo(self):
        return self.id_estado.estado.lower() == 'activo'

    def save(self, *args, **kwargs):
        # Si es un trabajador nuevo, hashear la contraseña
        if not self.pk and not self.contraseña.startswith('pbkdf2_'):
            self.set_password(self.contraseña)
        super().save(*args, **kwargs)

