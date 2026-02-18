import json
from pathlib import Path
from django.core.management.base import BaseCommand
from productos.models import Categoria, Producto
from clientes.models import Cliente
from empresa.models import Emisor


class Command(BaseCommand):
    help = 'Carga datos iniciales desde data.json del frontend'

    def handle(self, *args, **options):
        data_path = Path(__file__).resolve().parent.parent.parent.parent.parent / 'JyG-Fronted' / 'src' / 'data' / 'data.json'

        if not data_path.exists():
            self.stderr.write(self.style.ERROR(f'No se encontró {data_path}'))
            return

        with open(data_path, 'r', encoding='utf-8') as f:
            data = json.load(f)

        # Categorías y Productos
        productos_creados = 0
        for p in data.get('productos', []):
            cat, _ = Categoria.objects.get_or_create(nombre=p['categoria'])
            _, created = Producto.objects.get_or_create(
                codigo=p['codigo'],
                defaults={
                    'nombre': p['nombre'],
                    'precio_costo': p['precioCosto'],
                    'precio_venta': p.get('precioVenta'),
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
        for c in data.get('clientes', []):
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
        emisor_data = data.get('emisor', {})
        if emisor_data:
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

        self.stdout.write(self.style.SUCCESS('Seed completado'))
