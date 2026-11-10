# Compilar Android

La versión actual usa el planificador v2 en web y Android, con tres respaldos POWER incluidos. El APK debug compilado queda en `deliverables/rotacion-demo.apk`, con archivo `.sha256`; también se genera como artefacto del job Android de GitHub Actions. Se instala como actualización del identificador técnico existente `py.rotacion.demo`.

El pipeline es reproducible desde código/lockfile y herramientas indicadas, pero el APK debug **no es reproducible bit a bit** entre máquinas: firma debug y metadatos pueden variar. El checksum identifica un archivo concreto, no todas las compilaciones posibles. No hay publicación en tienda.

## Aceptación en teléfono físico (pendiente)

- [ ] Instalar APK y confirmar nombre/versión.
- [ ] Abrir los tres casos, editar números/fechas usando teclado real.
- [ ] Cerrar/reabrir y comprobar persistencia.
- [ ] Modo avión: respaldos, comparación y reabrir app.
- [ ] Compartir CSV y JSON mediante aplicaciones nativas.
- [ ] Botón atrás: cerrar diálogo, volver a Lote y minimizar.

Las pruebas Chromium y la firma del APK no cierran este checklist. Nunca registrar dispositivo como probado sin evidencia.

## Entorno y comandos

React/TypeScript + Capacitor 8. Requisitos: Node 24, JDK 21, Android SDK compatible con `android/variables.gradle`, conexión para la primera descarga. Consultar [entorno oficial](https://capacitorjs.com/docs/getting-started/environment-setup).

```bash
npm ci
npm run android:sync
```

Abrir `android/` en Android Studio o, con SDK configurado en ANDROID_HOME y local.properties, ejecutar `./gradlew assembleDebug` dentro de android (Windows: `gradlew.bat assembleDebug`). En Windows, el script `npm run android:build` usa `.tools/android-sdk`, JAVA_HOME y copia el APK a `deliverables/rotacion-demo.apk`.

El APK debug es para pruebas; no hay firma release ni publicación en tienda. No subir claves ni local.properties. Para nombre visible editar product.json, sincronizar y recompilar. Identificadores técnicos permanecen estables (ver docs/BRANDING.md).

La calculadora en APK funciona sin red y guarda planes localmente. Compartir usa el selector nativo; requiere una app compatible. Borrar datos/desinstalar puede eliminar el plan. NASA y cotizaciones no están conectados.

La interfaz se prueba en Chromium con `npm run test:ui`; esto no verifica instalación, botón atrás ni compartir en un Android real. El APK anterior en archivos locales es histórico; recompilar antes de evaluar esta versión.
