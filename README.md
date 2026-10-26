# Simulador de Tienda

Pre-entrega 9 - Asincronismo y promesas

Este es el simulador de tienda que vengo armando en las entregas anteriores. En esta entrega le agregué asincronismo: un temporizador, una promesa con async/await y manejo de errores.

## Qué hace
- Muestra, agrega, busca, compra y elimina productos
- Guarda el catálogo y el carrito en el localStorage
- A los 3 segundos de entrar aparece un aviso con un cupón de descuento
- El cupón se escribe en el carrito y baja el total un 10%
- Los productos se cargan con una promesa y se ve un mensaje de "Cargando..." mientras tanto
- El botón "Recargar productos" vuelve a cargar los productos

## Qué usé en esta entrega
- `setTimeout` para mostrar el aviso del cupón y para simular el tiempo de carga
- Una función `obtenerProductos` que devuelve una `Promise`
- `async/await` dentro de `cargarProductos`
- `try / catch / finally`: si falla la carga se muestra un mensaje y se vuelven a usar los productos iniciales, y en el `finally` se vuelve a habilitar el botón

## Estructura
```
index.html
css/style.css
js/main.js
README.md
```

Para usarlo hay que abrir `index.html` en el navegador.