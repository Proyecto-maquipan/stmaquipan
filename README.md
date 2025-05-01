# Portal Maquipan - Sistema de Gestión

Sistema web para la gestión de requerimientos de servicio técnico y cotizaciones de Maquipan.

## Características Principales

- 🔧 Gestión de requerimientos de servicio técnico
- 💰 Creación y administración de cotizaciones
- 👥 Gestión de clientes
- 🔍 Búsqueda avanzada
- 📱 Diseño responsive
- 💾 Almacenamiento local (localStorage)
- 🔐 Sistema de autenticación simple

## Estructura del Proyecto

```
portal-maquipan/
├── index.html          # Archivo principal HTML
├── css/
│   └── styles.css      # Estilos CSS
├── js/
│   ├── config.js       # Configuración global
│   ├── storage.js      # Sistema de almacenamiento
│   ├── auth.js         # Sistema de autenticación
│   ├── router.js       # Sistema de enrutamiento
│   ├── app.js          # Archivo principal JS
│   └── components/     # Componentes de la aplicación
│       ├── dashboard.js
│       ├── requerimientos.js
│       ├── cotizaciones.js
│       ├── clientes.js
│       └── busqueda.js
```

## Instalación y Uso

1. Clona este repositorio:
   ```bash
   git clone https://github.com/tu-usuario/portal-maquipan.git
   ```

2. Abre `index.html` en tu navegador web o despliega en GitHub Pages.

3. Usa las siguientes credenciales de prueba:
   - Usuario: `admin`
   - Contraseña: `admin123`

## Despliegue en GitHub Pages

1. Ve a la configuración de tu repositorio
2. En la sección "Pages", selecciona la rama `main` como fuente
3. Guarda los cambios
4. Tu sitio estará disponible en: `https://tu-usuario.github.io/portal-maquipan/`

## Funcionalidades

### Dashboard
- Vista general con estadísticas
- Últimos requerimientos
- Accesos rápidos a funciones principales

### Requerimientos
- Crear nuevos requerimientos de servicio
- Editar requerimientos existentes
- Gestión de estados
- Información de equipos

### Cotizaciones
- Crear cotizaciones con múltiples items
- Cálculo automático de totales e IVA
- Gestión de estados
- Exportación a PDF (próximamente)

### Clientes
- Registro de nuevos clientes
- Edición de información
- Validación de RUT

### Búsqueda
- Búsqueda por tipo (requerimientos, cotizaciones, clientes)
- Búsqueda por múltiples criterios

## Tecnologías Utilizadas

- HTML5
- CSS3
- JavaScript (ES6+)
- localStorage para persistencia de datos

## Próximas Mejoras

- [ ] Generación de PDFs real con jsPDF
- [ ] Backup y restauración de datos
- [ ] Sistema de roles y permisos
- [ ] Integración con API REST
- [ ] Aplicación móvil para técnicos
- [ ] Reportes y estadísticas avanzadas

## Contribuir

1. Fork el proyecto
2. Crea tu rama de características (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE.md](LICENSE.md) para detalles

## Contacto

Tu Nombre - [@tutwitter](https://twitter.com/tutwitter) - email@ejemplo.com

Link del Proyecto: [https://github.com/tu-usuario/portal-maquipan](https://github.com/tu-usuario/portal-maquipan)
