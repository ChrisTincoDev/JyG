from rest_framework import serializers
from .models import Emisor


class EmisorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Emisor
        fields = '__all__'
