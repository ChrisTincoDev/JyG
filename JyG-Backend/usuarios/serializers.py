from rest_framework import serializers
from .models import Trabajador, Estado


class EstadoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Estado
        fields = ['id_estado', 'estado']


class TrabajadorSerializer(serializers.ModelSerializer):
    estado = serializers.CharField(source='id_estado.estado', read_only=True)
    activo = serializers.BooleanField(read_only=True)

    class Meta:
        model = Trabajador
        fields = ['id_trabajador', 'nombre_usuario', 'rol', 'estado', 'activo']


class TrabajadorCreateSerializer(serializers.ModelSerializer):
    contraseña = serializers.CharField(write_only=True, min_length=4)

    class Meta:
        model = Trabajador
        fields = ['id_trabajador', 'nombre_usuario', 'contraseña', 'rol', 'id_estado']

    def create(self, validated_data):
        trabajador = Trabajador.objects.create(**validated_data)
        return trabajador


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField()
