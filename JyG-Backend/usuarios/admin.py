from django.contrib import admin
from .models import Trabajador, Estado


@admin.register(Estado)
class EstadoAdmin(admin.ModelAdmin):
    list_display = ['id_estado', 'estado']


@admin.register(Trabajador)
class TrabajadorAdmin(admin.ModelAdmin):
    list_display = ['id_trabajador', 'nombre_usuario', 'rol', 'id_estado']
    list_filter = ['id_estado', 'rol']
    search_fields = ['nombre_usuario', 'rol']
