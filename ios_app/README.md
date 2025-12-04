# GlycoGuide iOS App

## Project Details
- **Bundle ID:** com.glycoguide.app
- **App Name:** GlycoGuide
- **Team ID:** 9XVR3WAB6Y
- **Minimum iOS Version:** 13.0

## How to Build and Submit to App Store

### Step 1: Open the Project
1. Unzip this folder on your Mac
2. Double-click `GlycoGuide.xcodeproj` to open in Xcode

### Step 2: Configure Signing (First Time Only)
1. In Xcode, click on the **GlycoGuide** project in the left sidebar
2. Select the **GlycoGuide** target
3. Go to the **Signing & Capabilities** tab
4. Make sure **Team** is set to your team (9XVR3WAB6Y)
5. If not signed in:
   - Go to **Xcode > Settings > Accounts**
   - Click **+** and sign in with **support@glycoguide.app**
   - Select your team

### Step 3: Create Distribution Certificate (If Not Already Done)
1. In Xcode, go to **Xcode > Settings > Accounts**
2. Select your team and click **Manage Certificates**
3. Click **+** and select **Apple Distribution**
4. Xcode will automatically create and download the certificate

### Step 4: Build for Release
1. Select **Any iOS Device (arm64)** as the build target (top toolbar)
2. Go to **Product > Archive**
3. Wait for the build to complete

### Step 5: Upload to App Store Connect
1. After archiving, the **Organizer** window will open
2. Select your archive and click **Distribute App**
3. Choose **App Store Connect**
4. Choose **Upload**
5. Follow the prompts to upload

### Alternative: Export IPA for Transporter
1. In Organizer, select **Distribute App**
2. Choose **App Store Connect**
3. Choose **Export** (instead of Upload)
4. Save the IPA file
5. Open **Transporter** app (download from Mac App Store)
6. Drag the IPA into Transporter and click **Deliver**

## App Features
- Loads https://glycoguide.app in a native WebView
- Full screen WebView with native iOS feel
- Loading indicator while page loads
- Error handling with retry option
- Supports iPhone and iPad
- Portrait and landscape orientations

## Icon Replacement
To replace the placeholder icons with your final icons:
1. Open `GlycoGuide/Assets.xcassets/AppIcon.appiconset/`
2. Replace the icon files with your final versions
3. Keep the same filenames and sizes

## Required Icon Sizes
- 20x20, 40x40, 60x60 (Notification)
- 29x29, 58x58, 87x87 (Settings)
- 40x40, 80x80, 120x120 (Spotlight)
- 120x120, 180x180 (iPhone App)
- 76x76, 152x152 (iPad App)
- 167x167 (iPad Pro App)
- 1024x1024 (App Store)

## Troubleshooting

### "No signing certificate" error
- Go to Xcode > Settings > Accounts
- Select your team and click "Download Manual Profiles"

### Build fails with provisioning error
- In Signing & Capabilities, toggle "Automatically manage signing" off and on
- Make sure you're signed in with the correct Apple ID

### App crashes on launch
- Make sure the device has internet connection
- Check that https://glycoguide.app is accessible

## Support
For issues with the app code, contact your development team.
For Apple Developer account issues, visit https://developer.apple.com/support/
