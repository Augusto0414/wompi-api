# Wompi API - Payment Gateway Integration

API REST para integración con el pasarela de pagos Wompi, desarrollada con NestJS siguiendo arquitectura hexagonal (Ports & Adapters).

## 🏗️ Arquitectura

El proyecto implementa **Arquitectura Hexagonal** con los siguientes patrones:

- **Ports & Adapters**: Separación clara entre dominio e infraestructura
- **Railway Oriented Programming (ROP)**: Manejo de errores con el patrón Result
- **Clean Architecture**: Capas de dominio, aplicación, infraestructura y presentación

### Estructura de Módulos

```
src/
├── modules/
│   ├── product/          # Gestión de productos
│   ├── transaction/      # Transacciones de pago
│   ├── customer/         # Gestión de clientes
│   └── delivery/         # Información de entregas
├── shared/               # Utilidades compartidas
└── config/               # Configuración de la aplicación
```

## 🚀 Inicio Rápido

### Prerrequisitos

- Node.js >= 18.x
- pnpm >= 8.x

### Instalación

```bash
pnpm install
```

### Ejecución

```bash
# Desarrollo (watch mode)
pnpm run start:dev

# Producción
pnpm run build
pnpm run start:prod
```

### URLs

- **API Base**: http://localhost:3000/api
- **Swagger Docs**: http://localhost:3000/docs

## 📚 Documentación API (Swagger)

La documentación interactiva está disponible en `/docs` una vez la aplicación está corriendo.

### Endpoints Principales

#### Products

| Método | Endpoint            | Descripción                |
| ------ | ------------------- | -------------------------- |
| GET    | `/api/products`     | Listar todos los productos |
| GET    | `/api/products/:id` | Obtener producto por ID    |

#### Transactions

| Método | Endpoint                    | Descripción                  |
| ------ | --------------------------- | ---------------------------- |
| POST   | `/api/transactions`         | Crear nueva transacción      |
| GET    | `/api/transactions/:id`     | Obtener transacción por ID   |
| POST   | `/api/transactions/:id/pay` | Procesar pago de transacción |

#### Customers

| Método | Endpoint             | Descripción            |
| ------ | -------------------- | ---------------------- |
| POST   | `/api/customers`     | Crear nuevo cliente    |
| GET    | `/api/customers/:id` | Obtener cliente por ID |

#### Deliveries

| Método | Endpoint                                     | Descripción                     |
| ------ | -------------------------------------------- | ------------------------------- |
| POST   | `/api/deliveries`                            | Crear entrega                   |
| GET    | `/api/deliveries/:id`                        | Obtener entrega por ID          |
| GET    | `/api/deliveries/transaction/:transactionId` | Obtener entrega por transacción |

#### Wompi Integration

| Método | Endpoint                      | Descripción                  |
| ------ | ----------------------------- | ---------------------------- |
| GET    | `/api/wompi/acceptance-token` | Obtener token de aceptación  |
| POST   | `/api/wompi/tokenize-card`    | Tokenizar tarjeta de crédito |

## 📊 Modelo de Datos

### Product

```typescript
{
  id: string;           // UUID
  name: string;         // Nombre del producto
  description: string;  // Descripción
  price: number;        // Precio en centavos (COP)
  stock: number;        // Cantidad disponible
  imageUrl?: string;    // URL de imagen
}
```

### Transaction

```typescript
{
  id: string;                    // UUID
  productId: string;             // ID del producto
  customerId: string;            // ID del cliente
  quantity: number;              // Cantidad
  totalAmount: number;           // Monto total en centavos
  status: TransactionStatus;     // PENDING | APPROVED | DECLINED | ERROR
  wompiTransactionId?: string;   // ID de transacción en Wompi
  createdAt: Date;
  updatedAt: Date;
}
```

### Customer

```typescript
{
  id: string; // UUID
  email: string; // Email del cliente
  fullName: string; // Nombre completo
  legalIdType: string; // Tipo de documento (CC, CE, NIT)
  legalId: string; // Número de documento
  phoneNumber: string; // Teléfono
}
```

### Delivery

```typescript
{
  id: string;           // UUID
  transactionId: string;// ID de la transacción
  addressLine1: string; // Dirección línea 1
  addressLine2?: string;// Dirección línea 2
  city: string;         // Ciudad
  region: string;       // Departamento/Región
  country: string;      // País (default: CO)
  postalCode?: string;  // Código postal
  phoneNumber: string;  // Teléfono de contacto
}
```

## 🔐 Integración con Wompi

### Documentación Oficial

- [Inicio Rápido](https://docs.wompi.co/docs/colombia/inicio-rapido/)
- [Ambientes y Llaves](https://docs.wompi.co/docs/colombia/ambientes-y-llaves/)

### Ambientes de API

| Ambiente        | URL                                         |
| --------------- | ------------------------------------------- |
| UAT (Sandbox)   | `https://api-sandbox.co.uat.wompi.dev/v1`   |
| UAT (Normal)    | `https://api.co.uat.wompi.dev/v1`           |
| Producción      | `https://production.wompi.co/v1`            |

### Configuración de API Keys (Sandbox/UAT)

Las credenciales de Wompi Sandbox están configuradas en las variables de entorno:

| Tipo                | Valor                                                |
| ------------------- | ---------------------------------------------------- |
| **Public Key**      | `pub_stagtest_g2u0HQd3ZMh05hsSgTS2lUV8t3s4mOt7`      |
| **Private Key**     | `prv_stagtest_5i0ZGIGiFcDQifYsXxvsny7Y37tKqFWg`      |
| **Integrity Key**   | `stagtest_integrity_nAIBuqayW70XpUqJS4qf4STYiISd89Fp`|
| **Events Key**      | `stagtest_events_2PDUmhMywUkvb1LvxYnayFbmofT7w39N`   |
| **API URL**         | `https://api-sandbox.co.uat.wompi.dev/v1`            |

> ⚠️ **Importante**: Estas credenciales son solo para el ambiente Sandbox/UAT. Para producción se deben usar credenciales reales.

### Flujo de Pago

1. **Obtener Acceptance Token**: `GET /api/wompi/acceptance-token`
2. **Tokenizar tarjeta**: `POST /api/wompi/tokenize-card`
3. **Crear transacción**: `POST /api/transactions`
4. **Procesar pago**: `POST /api/transactions/:id/pay`

### Tarjetas de Prueba (Sandbox)

| Número              | Marca      | Resultado |
| ------------------- | ---------- | --------- |
| 4242424242424242    | Visa       | Aprobada  |
| 5100 0000 0000 0000 | Mastercard | Aprobada  |
| 4111111111111111    | Visa       | Rechazada |

## 🧪 Tests

```bash
# Tests unitarios
pnpm run test

# Tests con coverage
pnpm run test:cov

# Tests e2e
pnpm run test:e2e
```

## 🛠️ Stack Tecnológico

- **Framework**: NestJS 11.x
- **Lenguaje**: TypeScript 5.7
- **Documentación**: Swagger/OpenAPI (@nestjs/swagger)
- **Validación**: class-validator, class-transformer
- **HTTP Client**: Axios
- **Testing**: Jest

## 📁 Variables de Entorno

Crear archivo `.env` basado en `.env.example`:

```env
PORT=3000
NODE_ENV=development

# Wompi Sandbox/UAT
WOMPI_API_URL=https://api-sandbox.co.uat.wompi.dev/v1
WOMPI_PUBLIC_KEY=pub_stagtest_g2u0HQd3ZMh05hsSgTS2lUV8t3s4mOt7
WOMPI_PRIVATE_KEY=prv_stagtest_5i0ZGIGiFcDQifYsXxvsny7Y37tKqFWg
WOMPI_INTEGRITY_SECRET=stagtest_integrity_nAIBuqayW70XpUqJS4qf4STYiISd89Fp
WOMPI_EVENTS_KEY=stagtest_events_2PDUmhMywUkvb1LvxYnayFbmofT7w39N
```

### Acceso a Consola Wompi (Sandbox)

- **URL**: https://login.staging.wompi.dev/
- **Usuario**: smltrs00
- **Password**: ChallengeWompi123*

> ⚠️ **Nota**: El Uusario o contraseña son incorrectos.

## 📄 Licencia

MIT **License**