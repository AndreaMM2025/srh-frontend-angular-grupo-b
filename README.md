# srh-frontend-angular-grupo-b
Frontend Angular del Sistema de Reservas de Hoteles (SRH) - Consumo de servicios FastAPI desarrollados en la Tarea 02.03 - Grupo B

# 🏨 SRH - SISTEMA DE RESERVAS DE HOTELES
> **Backend:** FastAPI (Python) | **Frontend:** Angular (TypeScript)

UNIVERSIDAD POLITÉCNICA SALESIANA - UPS

Materia: Ingeniería de Software  
Proyecto Final  
Grupo: B  

Integrantes:
- Andrea Murillo Medina  
- Andy Arévalo Dueñas  
- Keyla Sisalima Torres
- Gregory Morán Silva  

Fecha: 24/02/2026  
Docente: Darío Huilcapi  

---

## DESCRIPCIÓN DEL PROYECTO

### Objetivo General
Desarrollar un sistema web integral para la gestión de reservas de un hotel, permitiendo el registro de clientes, administración de habitaciones, creación de reservas, generación de facturas y registro de pagos.

### Backend (FastAPI)
- **Framework:** FastAPI con Python 3.10+
- **Base de datos:** Memoria (listas en `memory_db.py`) - fácilmente migrable a PostgreSQL/MySQL
- **Características:**
  - API RESTful con endpoints organizados por módulos
  - Validación de datos con Pydantic
  - Documentación automática con Swagger UI
  - CORS configurado para conexión con Angular

### Frontend (Angular)
- **Framework:** Angular 17+ con componentes standalone
- **Estilos:** Bootstrap 5 + SCSS personalizado
- **Características:**
  - Arquitectura modular por páginas (`pages/`)
  - Servicios centralizados en `core/services/`
  - Modelos de datos en `core/models/`
  - Routing con guardias de navegación
  - Diseño responsive y animaciones CSS

### 🔄 Comunicación Frontend-Backend
────────────┐ HTTP/JSON ┌─────────────────┐
│ Angular │ ◄──────────────► │ FastAPI │
│ (Puerto 4200) │ │ (Puerto 8000) │
└─────────────────┘ └─────────────────┘

---

## TECNOLOGÍAS UTILIZADAS

### Backend
| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| Python | 3.10+ | Lenguaje principal |
| FastAPI | 0.109+ | Framework web API |
| Uvicorn | 0.27+ | Servidor ASGI |
| Pydantic | 2.5+ | Validación de datos |

### Frontend
| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| Angular CLI | 17.x | Framework frontend |
| TypeScript | 5.x | Lenguaje tipado |
| Bootstrap | 5.3.x | Estilos y componentes |
| RxJS | 7.x | Programación reactiva |

### Herramientas de Desarrollo
| Herramienta | Propósito |
|-------------|-----------|
| Git | Control de versiones |
| VS Code | Editor de código |
| Postman/Thunder Client | Pruebas de API |
| Swagger UI | Documentación interactiva |

---
## Para Frontend
# Node.js 18.x o superior
node --version

# npm o yarn
npm --version

# Angular CLI global
npm install -g @angular/cli

---

 ## INSTALACIÓN Y CONFIGURACIÓN

### Paso 1: Clonar el repositorio
# Todos los integrantes ejecutaron:
git clone https://github.com/AndreaMM2025/SRH-backend-fastapi-t02-03-y-del-t02-04-Grupo-B/tree/main
cd srh-backend-fastapi-grupo-b

###  Paso 2: Configurar Backend
cd backend

# Crear entorno virtual (recomendado)
python -m venv venv

# Activar entorno virtual
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Instalar dependencias
pip install -r requirements.txt

---
## Paso 3: Configurar Frontend
cd ../frontend

# Instalar dependencias de Node
npm install

# Verificar instalación
ng version
---

## REQUISITOS DEL SISTEMA

### Para Backend

```bash
# Python 3.10 o superior
python --version

# pip instalado
pip --version

# Virtual environment recomendado
python -m venv venv

## Ejecución y Visualización

Para ejecutar el backend del SRH se debe iniciar el servidor con el siguiente
comando:

```bash
uvicorn app.main:app --reload

---

## Documentación de Servicios

Los servicios REST desarrollados se encuentran documentados mediante Swagger,
accesible a través de los siguientes endpoints:

- Swagger UI: http://127.0.0.1:8000/docs  
- OpenAPI JSON: http://127.0.0.1:8000/openapi.json  
- ReDoc: http://127.0.0.1:8000/redoc
- API: http://127.0.0.1:8000

```
 ## Frontend (Angular)
 # Desde la carpeta frontend/

# Ejecutar servidor de desarrollo con apertura automática
ng serve -o

# Aplicación disponible en:
# http://localhost:4200

---
## Ejecutar Ambos Simultáneamente
# Terminal 1 - Backend
cd backend
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000

# Terminal 2 - Frontend  
cd frontend
ng serve -

---
## ARCHIVOS DE DEPENDENCIAS
Backend - requirements.txt

# requirements.txt - Dependencias del Backend SRH
# Generado: 25/12/2025

# Framework principal
fastapi==0.109.0
uvicorn[standard]==0.27.0

# Validación de datos
pydantic==2.5.2
pydantic-settings==2.1.0

# CORS y seguridad
python-multipart==0.0.6

# Utilidades para desarrollo
python-dotenv==1.0.0

## Instalacion
cd backend
pip install -r requirements.txt

--- 
## Frontend - package.json
{
  "name": "srh-frontend-angular-grupo-b",
  "version": "1.0.0",
  "dependencies": {
    "@angular/animations": "^17.0.0",
    "@angular/common": "^17.0.0",
    "@angular/core": "^17.0.0",
    "@angular/forms": "^17.0.0",
    "@angular/platform-browser": "^17.0.0",
    "@angular/router": "^17.0.0",
    "bootstrap": "^5.3.2",
    "bootstrap-icons": "^1.11.3",
    "rxjs": "~7.8.0",
    "tslib": "^2.3.0",
    "zone.js": "~0.14.2"
  },
  "devDependencies": {
    "@angular-devkit/build-angular": "^17.0.0",
    "@angular/cli": "^17.0.0",
    "@angular/compiler-cli": "^17.0.0",
    "typescript": "~5.2.2"
  }
}

## Instalar:
cd frontend
npm install

---

## FLUJO DE TRABAJO CON GIT
# 1. Antes de empezar a trabajar - Actualizar repositorio local
git pull origin main

# 2. Crear una rama para tu tarea (recomendado)
git checkout -b feature/tu-nombre-tarea
# Ejemplo: git checkout -b feature/andrea-clientes-crud

# 3. Realizar cambios en el código...

# 4. Verificar cambios
git status

# 5. Agregar archivos modificados
git add .
# O archivos específicos:
git add src/app/pages/clientes/clientes.page.ts
git add app/routers/clientes.py

# 6. Crear commit con mensaje descriptivo
git commit -m "feat: agregar validación de fechas en reservas"
# Convenciones de mensajes:
# feat: nueva funcionalidad
# fix: corrección de error
# docs: actualización de documentación
# style: cambios de formato/estilo
# refactor: mejora de código sin cambiar funcionalidad

# 7. Subir cambios al repositorio remoto
git push origin feature/tu-nombre-tarea

# 8. Crear Pull Request en GitHub/GitLab para revisión

# 9. Después de merge - Actualizar rama principal
git checkout main
git pull origin main

---
## Checklist

### Backend - Andrea Murillo
- [ ] Endpoints creados y probados en Swagger 
- [ ] Validaciones Pydantic implementadas
- [ ] Manejo de errores con HTTPException
- [ ] Comentarios en código complejo

### Frontend - Andrea Murillo
- [ ] Componente Angular creado con buenas prácticas
- [ ] Servicio HTTP implementado correctamente
- [ ] Validaciones de formulario activas
- [ ] Estilos responsivos aplicados

### Git
- [ ] Commits con mensajes descriptivos
- [ ] Rama feature creada para la tarea
- [ ] Pull Request creado para revisión
- [ ] Conflictos resueltos correctamente

### Documentación
- [ ] README actualizado si hay nuevos comandos
- [ ] Comentarios en código complejo
- [ ] Endpoints documentados en Swagger

---

## ENDPOINTS DE LA API

Base URL:
   http://127.0.0.1:8000/api


### Módulos Disponibles

| Módulo | Endpoint Base | Métodos | Descripción |
|--------|--------------|---------|-------------|
| Clientes | `/clientes` | GET, POST, PUT, DELETE | CRUD de clientes |
| Habitaciones | `/habitaciones` | GET, POST, PUT, DELETE | Gestión de habitaciones |
| Reservas | `/reservas` | GET, POST, PUT, DELETE | Crear y consultar reservas |
| Facturas | `/facturas` | GET, POST, PUT, DELETE | Generación de facturas |
| Pagos | `/pagos` | GET, POST, PUT, DELETE | Registro de pagos |
| Usuarios | `/usuarios` | GET, POST, PUT, DELETE | Administración de usuarios |
| Reportes | `/reportes` | GET, DELETE | Consultas y exportación |

### Documentación Interactiva
- **Swagger UI:** http://127.0.0.1:8000/docs
- **ReDoc:** http://127.0.0.1:8000/redoc

Ejemplo de Petición con cURL:

   # Obtener lista de clientes
   curl http://127.0.0.1:8000/api/clientes

   # Crear nuevo cliente
   curl -X POST http://127.0.0.1:8000/api/clientes \
     -H "Content-Type: application/json" \
     -d '{"nombre": "Juan Pérez", "identificacion": "0987654321", "telefono": "0991234567", "correo": "juan@email.com", "nacionalidad": "Ecuatoriana"}'

   # Actualizar cliente (PUT)
   curl -X PUT http://127.0.0.1:8000/api/clientes/1 \
     -H "Content-Type: application/json" \
     -d '{"nombre": "Juan Pérez Actualizado"}'

   # Eliminar cliente (DELETE)
   curl -X DELETE http://127.0.0.1:8000/api/clientes/1

   ----
   ## Conclusión
   ### Logros del Proyecto

El **Sistema de Reservas de Hoteles (SRH)** representa una solución completa y funcional para la gestión hotelera, desarrollada con tecnologías modernas y mejores prácticas de la industria del software.

### Aspectos Técnicos Destacados

1. **Arquitectura Robusta**: 
   - Separación clara entre backend (FastAPI) y frontend (Angular)
   - API RESTful bien documentada con Swagger UI
   - Componentes modulares y reutilizables

2. **Tecnologías de Vanguardia**:
   - **Backend**: FastAPI ofrece alto rendimiento y validación automática de datos
   - **Frontend**: Angular 17 con componentes standalone y diseño responsive
   - **Comunicación**: HTTP/JSON entre frontend y backend

3. **Funcionalidades Completas**:
   - CRUD completo para todos los módulos (Clientes, Habitaciones, Reservas, Facturas, Pagos, Usuarios)
   - Sistema de reportes con exportación a TXT y PDF
   - Filtros por fechas para análisis de datos
   - Validaciones de datos en frontend y backend

### Trabajo en Equipo

- **Colaboración efectiva** mediante Git y GitHub
- **Distribución de tareas** por módulos especializados
- **Commits descriptivos** siguiendo convenciones
- **Code reviews** entre compañeros
- **Documentación compartida** y actualizada

### Aprendizajes Obtenidos

Desarrollo full stack con Python/FastAPI y Angular  
Implementación de API RESTful con documentación automática  
Gestión de estado y servicios en Angular  
Control de versiones con Git en equipo  
Metodologías ágiles y trabajo colaborativo  
Importancia de la documentación técnica

### Mejoras Futuras

El sistema está diseñado para ser escalable y puede mejorar en:

- **Base de datos**: Migrar de memoria a PostgreSQL/MySQL para persistencia
- **Autenticación**: Agregar login con JWT y roles de usuario
- **Responsive**: Mejorar adaptación a dispositivos móviles
- **Testing**: Implementar pruebas unitarias y de integración
- **Internacionalización**: Soporte para múltiples idiomas
- **Dashboard**: Gráficos y estadísticas visuales avanzadas
- **Notificaciones**: Alertas en tiempo real

### Reflexión Final

Este proyecto demuestra la capacidad del equipo para desarrollar una aplicación web completa, integrando frontend y backend, trabajando de manera colaborativa y aplicando los conocimientos adquiridos en la materia de Ingeniería de Software. La arquitectura modular y la documentación detallada facilitan el mantenimiento y la escalabilidad futura del sistema.