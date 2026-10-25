# Test TasteMem on Android and iPhone

The whiteboard UI is the shared Next.js surface, so Android Chrome, iPhone Safari, and the debug Android wrapper all render the same experience.

## Android device over USB

1. Start the web app on your computer:

   ```bash
   npm run dev:mobile
   ```

2. Confirm the device is authorized. The Android SDK is installed at `/home/deu/Android/Sdk`, so this works even if `adb` is not on your `PATH`:

   ```bash
   export PATH="$HOME/Android/Sdk/platform-tools:$PATH"
   adb devices
   ```

   The device should appear as `device`, not `unauthorized`.

3. Reverse the phone's port 3000 to the computer:

   ```bash
   adb reverse tcp:3000 tcp:3000
   ```

4. Test the shared UI directly in Chrome by opening `http://127.0.0.1:3000`.

5. To test the Android debug wrapper, build and install it:

   ```bash
   cd android
   ./gradlew installDebug
   ```

   Launch **TasteMem** on the phone. The wrapper loads `http://127.0.0.1:3000/`, which now points through the USB reverse tunnel to the Next.js app.

If the app cannot connect, keep `npm run dev:mobile` running and repeat `adb reverse tcp:3000 tcp:3000`.

## iPhone / iPad

1. Run the same command on the development computer:

   ```bash
   npm run dev:mobile
   ```

2. Put the iPhone and computer on the same Wi-Fi network.

3. Find the computer's LAN IP, then open this in Safari on the iPhone:

   ```text
   http://<computer-lan-ip>:3000
   ```

4. Use Safari's **Share → Add to Home Screen** to install TasteMem like an app. The project includes the web manifest and Apple web-app metadata for this flow.

There is no native Xcode project in this Linux workspace. A native iOS build requires macOS + Xcode; the responsive web/PWA surface is the cross-platform implementation that can be tested on iPhone now.

## Production mobile testing

For a phone that is not connected to the development machine, deploy the Next.js app behind HTTPS and open that HTTPS URL on both devices. Do not use the USB `adb reverse` URL outside local debug testing.
