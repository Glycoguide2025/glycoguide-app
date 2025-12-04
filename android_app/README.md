# GlycoGuide Android App

This is a WebView wrapper app for GlycoGuide (https://glycoguide.app)

## Project Structure

```
android_app/
├── app/
│   ├── build.gradle                    # App module configuration
│   └── src/main/
│       ├── AndroidManifest.xml         # App manifest
│       ├── java/com/glycoguide/app/
│       │   └── MainActivity.java       # WebView activity
│       └── res/mipmap-*/               # App icons (all densities)
│           └── ic_launcher.png
├── build.gradle                        # Project-level Gradle config
├── settings.gradle                     # Gradle settings
└── gradlew                            # Gradle wrapper script
```

## Build Requirements

To build the AAB file for Google Play Store submission, you need:

1. **Java JDK 17** or higher
2. **Android SDK** with:
   - Platform SDK 34
   - Build Tools 34.0.0
   - Command-line tools

## Building on Your Local Machine

### Option 1: Using Android Studio (Recommended)

1. Download and install [Android Studio](https://developer.android.com/studio)
2. Open Android Studio
3. Click "Open" and select the `android_app` folder
4. Wait for Gradle sync to complete
5. Go to **Build → Generate Signed Bundle / APK**
6. Select **Android App Bundle**
7. Create or select your keystore
8. Build will be generated at: `app/build/outputs/bundle/release/app-release.aab`

### Option 2: Using Command Line

1. Install Android SDK command-line tools
2. Set environment variables:
   ```bash
   export ANDROID_HOME=/path/to/android/sdk
   export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin
   ```

3. Build the AAB:
   ```bash
   cd android_app
   ./gradlew bundleRelease
   ```

4. Output will be at: `app/build/outputs/bundle/release/app-release.aab`

## App Details

- **Package Name:** com.glycoguide.app
- **App Name:** GlycoGuide
- **Min SDK:** 21 (Android 5.0)
- **Target SDK:** 34 (Android 14)
- **Version:** 1.0 (versionCode: 1)
- **URL:** https://glycoguide.app

## Signing for Release

For Play Store submission, you'll need to sign the AAB with your release keystore:

```bash
./gradlew bundleRelease \
  -Pandroid.injected.signing.store.file=/path/to/keystore.jks \
  -Pandroid.injected.signing.store.password=yourpassword \
  -Pandroid.injected.signing.key.alias=youralias \
  -Pandroid.injected.signing.key.password=yourpassword
```

## Next Steps for Play Store

1. Build the signed AAB file
2. Go to [Google Play Console](https://play.google.com/console)
3. Create a new app
4. Upload the AAB file
5. Fill in store listing details
6. Submit for review

## Troubleshooting

**"SDK location not found"**
- Create `local.properties` with: `sdk.dir=/path/to/android/sdk`

**"Java version incompatible"**
- Install Java JDK 17: `sudo apt install openjdk-17-jdk`

**Build fails**
- Clean and rebuild: `./gradlew clean bundleRelease`
