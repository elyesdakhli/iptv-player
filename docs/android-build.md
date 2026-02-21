# Android Build — How It Works

## Architecture

Capacitor acts as a bridge between the React web app and the native Android shell.
The two layers are completely independent:

```
┌─────────────────────────────────┐
│        Web Layer (React)        │  ← your code in src/
│   Built by Vite → dist/        │
└────────────────┬────────────────┘
                 │ loaded inside
┌────────────────▼────────────────┐
│       Native Layer (Android)    │  ← android/ folder
│   WebView renders your web app  │
│   MainActivity.java wraps it    │
└─────────────────────────────────┘
```

The Android app is a native shell that opens a `WebView` and loads the built web
files from local assets inside the APK — no server involved.

---

## `npm run build:android` — step by step

```json
"build:android": "cross-env BUILD_TARGET=android tsc -b && cross-env BUILD_TARGET=android vite build --mode android && npx cap sync android"
```

| Step | Command | What it does |
|------|---------|--------------|
| 1 | `tsc -b` | TypeScript type-check. Catches errors before bundling. Produces no output files — Vite handles compilation. |
| 2 | `vite build --mode android` | Builds the React app into `dist/`. The `--mode android` flag loads `.env.android`, so `VITE_CORS_PROXY=https://wsrv.nl/?url=` is baked into the bundle (HTTPS proxy for channel icons). |
| 3 | `npx cap sync android` | Capacitor sync: copies `dist/` into the Android assets folder and updates the Capacitor config JSON. |

### What `cap sync` copies

`cap sync android` only updates two things inside the `android/` folder:

- `android/app/src/main/assets/public/` — fully replaced with the contents of `dist/`
- `android/app/src/main/assets/capacitor.config.json` — regenerated from `capacitor.config.ts`

**Everything else in `android/` is never touched by `cap sync`.**

---

## What `build:android` does NOT do

`npm run build:android` does **not** compile Java or build an APK.

For Java changes to take effect, you must rebuild in Android Studio:
**Run > Run 'app'** (triggers Gradle, which compiles Java and packages the APK).

---

## File ownership — what is safe to edit

| Path | Owner | Touched by `cap sync`? |
|------|-------|------------------------|
| `src/` | You | No |
| `dist/` | Vite build output | No (source of sync) |
| `android/app/src/main/assets/public/` | Generated | **Yes — fully replaced** |
| `android/app/src/main/assets/capacitor.config.json` | Generated | **Yes — regenerated** |
| `android/app/src/main/java/` | You | **Never** |
| `android/app/src/main/res/` | You | **Never** |
| `android/app/src/main/AndroidManifest.xml` | You | **Never** |
| `android/app/build.gradle` | You | **Never** |
| `android/variables.gradle` | You | **Never** |

The `android/` folder was generated once by `npx cap add android`. After that,
all native files (Java, XML, Gradle) are yours to own permanently.

---

## Two-step deploy flow

Because the web and native layers are separate, changes require different steps:

| What changed | How to apply |
|--------------|--------------|
| React / CSS / TypeScript | `npm run build:android` → Run in Android Studio |
| `capacitor.config.ts` | `npm run build:android` → Run in Android Studio |
| `MainActivity.java` or any `android/` file | Run in Android Studio only (no need for `build:android`) |

---

## Key files

| File | Purpose |
|------|---------|
| `capacitor.config.ts` | Capacitor configuration (app ID, webDir, Android options) |
| `.env.android` | Vite env vars for Android builds (sets HTTPS image proxy) |
| `android/app/src/main/java/com/iptvyk/app/MainActivity.java` | Native Android entry point — mixed content + status bar inset handling |
| `android/app/src/main/res/values/styles.xml` | App theme (NoActionBar) |
| `android/variables.gradle` | SDK versions (`targetSdkVersion = 36` forces edge-to-edge on Android 15+) |

---

## Android 15+ edge-to-edge note

`targetSdkVersion = 36` means Android 15+ **forces** the app to draw behind the
system bars. There is no opt-out. Content must handle insets explicitly.

The fix is in `MainActivity.java`: padding is applied to `android.R.id.content`
(the `FrameLayout` that contains the WebView) using `ViewCompat.setOnApplyWindowInsetsListener`.
This repositions the WebView below the status bar without touching the web layer.

```java
View contentView = findViewById(android.R.id.content);
ViewCompat.setOnApplyWindowInsetsListener(contentView, (v, insets) -> {
    Insets bars = insets.getInsets(WindowInsetsCompat.Type.systemBars());
    v.setPadding(bars.left, bars.top, bars.right, bars.bottom);
    return WindowInsetsCompat.CONSUMED;
});
```

Why `android.R.id.content` and not the WebView directly:
- `WebView.setPadding()` does not reliably move HTML content — the rendered page still starts at y=0 of the WebView frame
- Padding on the parent `FrameLayout` repositions the WebView as a child view, which does push the content down correctly
