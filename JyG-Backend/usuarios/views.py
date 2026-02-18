from rest_framework import viewsets, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Trabajador, Estado
from .serializers import TrabajadorSerializer, TrabajadorCreateSerializer, LoginSerializer, EstadoSerializer


class EstadoViewSet(viewsets.ModelViewSet):
    queryset = Estado.objects.all()
    serializer_class = EstadoSerializer


class TrabajadorViewSet(viewsets.ModelViewSet):
    queryset = Trabajador.objects.all()

    def get_serializer_class(self):
        if self.action == 'create':
            return TrabajadorCreateSerializer
        return TrabajadorSerializer


@api_view(['POST'])
def login(request):
    serializer = LoginSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    username = serializer.validated_data['username']
    password = serializer.validated_data['password']

    try:
        trabajador = Trabajador.objects.get(nombre_usuario=username)
    except Trabajador.DoesNotExist:
        return Response(
            {'error': 'Usuario o contraseña incorrectos'},
            status=status.HTTP_401_UNAUTHORIZED
        )

    if not trabajador.activo:
        return Response(
            {'error': 'Trabajador desactivado'},
            status=status.HTTP_401_UNAUTHORIZED
        )

    if not trabajador.check_password(password):
        return Response(
            {'error': 'Usuario o contraseña incorrectos'},
            status=status.HTTP_401_UNAUTHORIZED
        )

    return Response({
        'message': 'Login exitoso',
        'usuario': TrabajadorSerializer(trabajador).data
    })

