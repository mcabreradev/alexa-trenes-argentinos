#!/bin/bash
# Script para optimizar el paquete de despliegue

# Limpiar y compilar
echo "Limpiando y compilando..."
pnpm run clean
pnpm run build

# Eliminar paquetes de desarrollo
echo "Instalando solo dependencias de producción..."
pnpm prune --prod

# Eliminar archivo zip previo si existe
if [ -f "alexa-trenes-argentinos.zip" ]; then
  echo "Eliminando archivo zip previo..."
  rm -rf alexa-trenes-argentinos.zip
fi

# Crear archivo zip con solo los archivos necesarios
echo "Creando paquete de despliegue optimizado..."
zip -r alexa-trenes-argentinos.zip \
  index.js \
  dist/ \
  node_modules/ \
  apl-documents/ \
  -x "*.git*" \
  -x "*.DS_Store" \
  -x "**/node_modules/*/test/*" \
  -x "**/node_modules/*/tests/*" \
  -x "**/node_modules/*/docs/*" \
  -x "**/node_modules/*/examples/*" \
  -x "**/node_modules/*/coverage/*" \
  -x "**/.npmignore" \
  -x "**/.gitattributes" \
  -x "**/LICENSE*" \
  -x "**/CHANGELOG*" \
  -x "**/README*" \
  -x "**/*.d.ts.map" \
  -x "**/*.js.map"

# Imprimir tamaño del paquete
echo "Paquete creado. Tamaño:"
du -sh alexa-trenes-argentinos.zip

echo "Despliegue completado!"
