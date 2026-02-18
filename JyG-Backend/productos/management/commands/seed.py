from decimal import Decimal
from django.core.management.base import BaseCommand
from productos.models import Categoria, Producto
from clientes.models import Cliente
from empresa.models import Emisor
from usuarios.models import Estado, Trabajador

SEED_DATA = {
    "productos": [
        {"codigo": "ABR001", "nombre": "Arroz Costeño 1kg", "precioCosto": 4.50, "precioVenta": None, "stock": 150, "unidad": "UNI", "categoria": "Granos"},
        {"codigo": "ABR002", "nombre": "Azúcar Rubia 1kg", "precioCosto": 3.80, "precioVenta": None, "stock": 200, "unidad": "UNI", "categoria": "Granos"},
        {"codigo": "ABR003", "nombre": "Aceite Vegetal Primor 1L", "precioCosto": 8.90, "precioVenta": None, "stock": 80, "unidad": "UNI", "categoria": "Aceites"},
        {"codigo": "ABR004", "nombre": "Leche Gloria Evaporada 400g", "precioCosto": 4.20, "precioVenta": None, "stock": 120, "unidad": "UNI", "categoria": "Lácteos"},
        {"codigo": "ABR005", "nombre": "Fideos Don Vittorio Spaghetti 500g", "precioCosto": 3.50, "precioVenta": None, "stock": 100, "unidad": "UNI", "categoria": "Pastas"},
        {"codigo": "ABR006", "nombre": "Atún Florida en Aceite 170g", "precioCosto": 6.50, "precioVenta": None, "stock": 60, "unidad": "UNI", "categoria": "Conservas"},
        {"codigo": "ABR007", "nombre": "Sal de Mesa Emsal 1kg", "precioCosto": 1.50, "precioVenta": None, "stock": 180, "unidad": "UNI", "categoria": "Condimentos"},
        {"codigo": "ABR008", "nombre": "Café Nescafé Clásico 200g", "precioCosto": 18.90, "precioVenta": None, "stock": 45, "unidad": "UNI", "categoria": "Bebidas"},
        {"codigo": "ABR009", "nombre": "Galletas Soda Field 6 pack", "precioCosto": 4.80, "precioVenta": None, "stock": 90, "unidad": "UNI", "categoria": "Snacks"},
        {"codigo": "ABR010", "nombre": "Jabón Bolívar 230g", "precioCosto": 3.20, "precioVenta": None, "stock": 110, "unidad": "UNI", "categoria": "Limpieza"},
        {"codigo": "ABR011", "nombre": "Papel Higiénico Elite 4 rollos", "precioCosto": 6.90, "precioVenta": None, "stock": 75, "unidad": "UNI", "categoria": "Limpieza"},
        {"codigo": "ABR012", "nombre": "Detergente Ace 900g", "precioCosto": 12.50, "precioVenta": None, "stock": 55, "unidad": "UNI", "categoria": "Limpieza"},
        {"codigo": "ABR013", "nombre": "Avena 3 Ositos 1kg", "precioCosto": 7.80, "precioVenta": None, "stock": 65, "unidad": "UNI", "categoria": "Cereales"},
        {"codigo": "ABR014", "nombre": "Mayonesa Alacena 500g", "precioCosto": 9.90, "precioVenta": None, "stock": 40, "unidad": "UNI", "categoria": "Salsas"},
        {"codigo": "ABR015", "nombre": "Gaseosa Inca Kola 2.25L", "precioCosto": 8.50, "precioVenta": None, "stock": 100, "unidad": "UNI", "categoria": "Bebidas"},
        {"codigo": "ABR016", "nombre": "Lentejas 500g", "precioCosto": 5.20, "precioVenta": None, "stock": 70, "unidad": "KG", "categoria": "Granos"},
        {"codigo": "ABR017", "nombre": "Frijoles Canario 500g", "precioCosto": 6.80, "precioVenta": None, "stock": 85, "unidad": "KG", "categoria": "Granos"},
        {"codigo": "ABR018", "nombre": "Mantequilla Gloria 200g", "precioCosto": 7.50, "precioVenta": None, "stock": 50, "unidad": "UNI", "categoria": "Lácteos"},
        {"codigo": "ABR019", "nombre": "Huevos de Gallina x 15", "precioCosto": 9.00, "precioVenta": None, "stock": 30, "unidad": "UNI", "categoria": "Lácteos"},
        {"codigo": "ABR020", "nombre": "Agua San Luis 2.5L", "precioCosto": 3.50, "precioVenta": None, "stock": 140, "unidad": "UNI", "categoria": "Bebidas"},
    ],
    "clientes": [
        {"tipoDoc": "dni", "numeroDoc": "12345678", "nombre": "Juan Pérez García", "direccion": "Av. Lima 123", "email": "juan@email.com"},
        {"tipoDoc": "dni", "numeroDoc": "87654321", "nombre": "María López Ruiz", "direccion": "Jr. Cusco 456", "email": "maria@email.com"},
        {"tipoDoc": "ruc", "numeroDoc": "20123456789", "nombre": "Empresa ABC S.A.C.", "direccion": "Av. Industrial 789", "email": "contacto@abc.com"},
    ],
    "emisor": {
        "ruc": "20512345678",
        "razonSocial": "Abarrotes JyG S.A.C.",
        "nombreComercial": "JyG Abarrotes",
        "direccion": "Av. Los Próceres 456, San Juan de Lurigancho, Lima",
        "telefono": "(01) 555-1234",
        "encargado": "José García Mendoza",
    },
}


class Command(BaseCommand):
    help = 'Carga datos iniciales de ejemplo'

    def handle(self, *args, **options):
        # Categorías y Productos
        productos_creados = 0
        for p in SEED_DATA['productos']:
            cat, _ = Categoria.objects.get_or_create(nombre=p['categoria'])
            _, created = Producto.objects.get_or_create(
                codigo=p['codigo'],
                defaults={
                    'nombre': p['nombre'],
                    'precio_costo': Decimal(str(p['precioCosto'])),
                    'precio_venta': Decimal(str(p['precioVenta'])) if p.get('precioVenta') else None,
                    'stock': p['stock'],
                    'unidad_medida': p['unidad'],
                    'categoria': cat,
                }
            )
            if created:
                productos_creados += 1
        self.stdout.write(self.style.SUCCESS(f'{productos_creados} productos creados'))

        # Clientes
        clientes_creados = 0
        for c in SEED_DATA['clientes']:
            _, created = Cliente.objects.get_or_create(
                numero_documento=c['numeroDoc'],
                defaults={
                    'nombre': c['nombre'],
                    'tipo_documento': c['tipoDoc'],
                    'direccion': c.get('direccion', ''),
                    'email': c.get('email', ''),
                }
            )
            if created:
                clientes_creados += 1
        self.stdout.write(self.style.SUCCESS(f'{clientes_creados} clientes creados'))

        # Emisor
        emisor_data = SEED_DATA['emisor']
        _, created = Emisor.objects.get_or_create(
            ruc=emisor_data['ruc'],
            defaults={
                'razon_social': emisor_data['razonSocial'],
                'nombre_comercial': emisor_data.get('nombreComercial', ''),
                'direccion': emisor_data.get('direccion', ''),
                'telefono': emisor_data.get('telefono', ''),
                'encargado': emisor_data.get('encargado', ''),
            }
        )
        if created:
            self.stdout.write(self.style.SUCCESS('Emisor creado'))
        else:
            self.stdout.write('Emisor ya existía')

        # Estados
        estado_activo, _ = Estado.objects.get_or_create(id_estado=1, defaults={'estado': 'Activo'})
        Estado.objects.get_or_create(id_estado=2, defaults={'estado': 'Inactivo'})
        self.stdout.write(self.style.SUCCESS('Estados creados'))

        # Trabajador por defecto
        _, created = Trabajador.objects.get_or_create(
            nombre_usuario='admin',
            defaults={
                'contraseña': 'admin123',
                'rol': 'Administrador',
                'id_estado': estado_activo,
            }
        )
        if created:
            self.stdout.write(self.style.SUCCESS('Trabajador admin creado (usuario: admin, contraseña: admin123)'))
        else:
            self.stdout.write('Trabajador admin ya existía')

        self.stdout.write(self.style.SUCCESS('Seed completado'))
