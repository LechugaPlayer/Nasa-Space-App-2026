# Rotación · demo Android

Aplicación Android con React, TypeScript y Capacitor 8. Reutiliza `src/calc.ts` de la calculadora anterior. La web original sigue en `/`; la interfaz móvil se puede revisar en `/?android`.

## Probar en el teléfono

1. Copiar `deliverables/rotacion-demo.apk` al teléfono Android 7 o posterior.
2. Abrir el archivo y permitir la instalación desde esa aplicación si Android lo solicita.
3. Abrir **Rotación**. No requiere cuenta, servidor ni conexión para calcular.

Es un APK de depuración firmado para pruebas, no una publicación en Google Play. Compartir abre el selector nativo de Android con un CSV temporal. El archivo contiene las campañas y sus resultados ajustados; los datos de partida son ilustrativos.

Para instalar por USB, habilitar depuración USB en el teléfono, conectarlo y autorizar este equipo:

```powershell
& .tools/android-sdk/platform-tools/adb.exe install -r deliverables/rotacion-demo.apk
```

## Herramientas preparadas

- Node.js 26 y Microsoft JDK 21 ya estaban presentes.
- Dependencias React y Capacitor instaladas en `node_modules`.
- Plugins nativos oficiales: App (botón atrás), Filesystem (CSV temporal), Share (compartir).
- Android command-line tools, plataforma SDK 36, build-tools 35/36 y platform-tools instalados en `.tools/android-sdk`.
- Gradle 8.14.3 y dependencias de compilación en `%TEMP%/rotacion-gradle` (ruta corta para evitar fallos de caché en Windows).
- Chromium y Playwright para pruebas de interfaz.

Android Studio no es necesario para compilar con el script. Si se desea un IDE o un emulador, se puede agregar posteriormente. Las herramientas locales y cachés no se deben incluir en control de versiones.

## Desarrollo

```powershell
npm ci
npm run dev
# Abrir la URL de Vite con /?android
npm run test:calc
npm run test:ui
npm run android:build
```

`JAVA_HOME` debe apuntar al JDK 21. El script configura `ANDROID_HOME`, el caché de Gradle y `android/local.properties` para esta carpeta. El primer build requiere Internet para descargar herramientas y dependencias; el APK resultante calcula sin conexión. Si se mueve el proyecto, ejecutar nuevamente `npm run android:build`.

## Alcance

Dos escenarios editables, entre una y seis campañas por escenario, superficie, costos adicionales, sensibilidad ±30%, comparación y resultados por campaña. Moneda fija USD. Cada edición se guarda localmente en el dispositivo. Desinstalar o borrar los datos de la app puede eliminar el plan.

Los escenarios pueden tener distintas cantidades de campañas: se muestra el total de cada ciclo, no una rentabilidad anualizada. El capital máximo es el costo de la campaña más cara, sin calendario de pagos/cobros. NASA, cotizaciones, conversión de moneda, sincronización y recomendaciones agronómicas no están conectados.

Se corrigió el precio de equilibrio anterior: costo por hectárea del ciclo dividido por producción ajustada por hectárea. Ya no cambia al modificar la superficie. Si no existe producción o precio suficiente para definir un equilibrio, se muestra “No definido”.

## Verificación

Las pruebas de cálculo cubren un presupuesto conocido, escalado por superficie, costos adicionales, sensibilidad y denominadores cero. Las pruebas de interfaz cubren edición, persistencia al recargar, agregar/quitar campañas, comparación, descarga CSV, restablecimiento, anchos de 320/390/430 px y disponibilidad de la web original.

La compilación y firma del APK se verifican con las herramientas Android. Las pruebas de interacción se ejecutan en Chromium móvil; la instalación y el selector de compartir requieren una comprobación adicional en un dispositivo Android real.

Referencia del stack: https://capacitorjs.com/docs/getting-started
