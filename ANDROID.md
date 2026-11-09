# Compilar Android

React/TypeScript + Capacitor 8. Requisitos: Node 24, JDK 21, Android SDK compatible con `android/variables.gradle`, conexión para la primera descarga. Consultar [entorno oficial](https://capacitorjs.com/docs/getting-started/environment-setup).

```bash
npm ci
npm run android:sync
```

Abrir `android/` en Android Studio o, con SDK configurado en ANDROID_HOME y local.properties, ejecutar `./gradlew assembleDebug` dentro de android (Windows: `gradlew.bat assembleDebug`). En Windows, el script `npm run android:build` usa `.tools/android-sdk`, JAVA_HOME y copia el APK a `deliverables/rotacion-demo.apk`.

El APK debug es para pruebas; no hay firma release ni publicación en tienda. No subir claves ni local.properties. Para nombre visible editar product.json, sincronizar y recompilar. Identificadores técnicos permanecen estables (ver docs/BRANDING.md).

La calculadora en APK funciona sin red y guarda planes localmente. Compartir usa el selector nativo; requiere una app compatible. Borrar datos/desinstalar puede eliminar el plan. NASA y cotizaciones no están conectados.

La interfaz se prueba en Chromium con `npm run test:ui`; esto no verifica instalación, botón atrás ni compartir en un Android real. El APK anterior en archivos locales es histórico; recompilar antes de evaluar esta versión.
