![Logo](https://i.ibb.co/k0v9cqQ/Imagen-de-Whats-App-2023-09-19-a-las-11-07-43.jpg)
# Appetito 🥕

RCS 55i Proyecto Final

## Documentación 📄

[Documento de Especificación de Requerimientos de Software](https://docs.google.com/document/d/1uAP5x-o56ntXXSe2EhxKEeV8BmiLFum0SrK-pNrD9_g/edit?usp=sharing)
## API Reference 🧩
*https://resto-rolling.onrender.com/*
### Contenido
#### /users
#### /products
#### /orders
#### /stats
### Rutas
#### /api/users
Registro (**Required** Admin):
```http
POST /register
```
Login:
```http
GET /login
```
Datos del cliente:
```http
GET /profile
```
Actualizar datos del cliente (**Required** Admin): 
```http
POST /update
```
#### /api/products
Menú para clientes:
```http
POST /menu
```
Lista de productos (**Required** Admin):
```http
POST /list
```
Ruta producto unico (**Required** Admin):
```http
GET /one/:id
```
Ruta modificar producto (**Required** Admin):
```http
POST /update/:id
```
Ruta crear producto (**Required** Admin):
```http
POST /create
```
Ruta eliminar producto (**Required** Admin):
```http
POST /delete/:id
```
#### /api/orders
Ruta para realizar pedidos por el cliente
```http
POST /create
```
Visualizar pedidos en espera (**Required** Admin) (/api/orders/en%20espera)
```http
GET /:status
```
Cambiar estado del pedido
```http
POST /status/:id
```

## Deployment 🚀

Para desplegar el proyecto ejecutar:

```bash
  npm install
  npm run dev
```
## Tech Stack 🛠

**Client:** React

**Server:** Node, Express, MongoDB
