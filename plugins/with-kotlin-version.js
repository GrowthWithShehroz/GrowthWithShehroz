/**
 * Custom Expo config plugin that pins rootProject.ext.kotlinVersion in
 * android/build.gradle. expo-build-properties' kotlinVersion only updates
 * the kotlin-gradle-plugin classpath, but expo-modules-core's build reads
 * rootProject.ext.kotlinVersion which falls back to 1.9.24 if not set —
 * causing a mismatch with Compose Compiler 1.5.15 (needs 1.9.25).
 *
 * Usage in app.config.ts:
 *   plugins: [
 *     ['./plugins/with-kotlin-version', '1.9.25'],
 *   ]
 */
const { withProjectBuildGradle } = require('@expo/config-plugins');

const withKotlinVersion = (config, kotlinVersion = '1.9.25') => {
  return withProjectBuildGradle(config, (config) => {
    if (config.modResults.language !== 'groovy') {
      console.warn('[with-kotlin-version] non-groovy build.gradle, skipping');
      return config;
    }

    let contents = config.modResults.contents;
    const versionLineRe = /kotlinVersion\s*=\s*["']([^"']+)["']/;
    if (versionLineRe.test(contents)) {
      contents = contents.replace(versionLineRe, `kotlinVersion = "${kotlinVersion}"`);
    } else {
      // No existing ext.kotlinVersion — inject one inside buildscript { ext { ... } }
      contents = contents.replace(
        /buildscript\s*{\s*ext\s*{/,
        (m) => `${m}\n        kotlinVersion = "${kotlinVersion}"`,
      );
    }

    config.modResults.contents = contents;
    return config;
  });
};

module.exports = withKotlinVersion;
