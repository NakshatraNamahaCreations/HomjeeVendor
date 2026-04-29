# ============================================================================
# ProGuard / R8 rules for the Homjee Vendor app
# ----------------------------------------------------------------------------
# AGP auto-merges consumer-rules.pro shipped by each react-native-* library,
# so most modules don't need explicit rules here. The blocks below are
# belt-and-braces for things that are commonly broken by aggressive R8 or
# that don't ship a consumer-rules file.
# ============================================================================

# ----------------------------- React Native core ----------------------------
-keep,allowobfuscation @interface com.facebook.proguard.annotations.DoNotStrip
-keep,allowobfuscation @interface com.facebook.proguard.annotations.KeepGettersAndSetters
-keep,allowobfuscation @interface com.facebook.common.internal.DoNotStrip

-keep @com.facebook.proguard.annotations.DoNotStrip class *
-keep @com.facebook.common.internal.DoNotStrip class *
-keepclassmembers class * {
    @com.facebook.proguard.annotations.DoNotStrip *;
    @com.facebook.common.internal.DoNotStrip *;
}

-keepclassmembers @com.facebook.proguard.annotations.KeepGettersAndSetters class * {
    void set*(***);
    *** get*();
}

-keep class * extends com.facebook.react.bridge.JavaScriptModule { *; }
-keep class * extends com.facebook.react.bridge.NativeModule { *; }
-keepclassmembers,includedescriptorclasses class * { native <methods>; }
-keepclassmembers class *  { @com.facebook.react.uimanager.annotations.ReactProp <methods>; }
-keepclassmembers class *  { @com.facebook.react.uimanager.annotations.ReactPropGroup <methods>; }

# ----------------------------- Hermes ---------------------------------------
-keep class com.facebook.hermes.unicode.** { *; }
-keep class com.facebook.jni.** { *; }

# ----------------------------- OkHttp / Okio --------------------------------
# RN ships OkHttp internally; keeping noise-free.
-dontwarn okhttp3.**
-dontwarn okio.**
-dontwarn javax.annotation.**
-dontwarn org.codehaus.mojo.animal_sniffer.IgnoreJRERequirement
-dontwarn org.conscrypt.**

# ----------------------------- Kotlin ---------------------------------------
-dontwarn kotlin.**
-dontwarn kotlinx.**
-keep class kotlin.Metadata { *; }

# ----------------------------- AndroidX -------------------------------------
-dontwarn androidx.**

# ----------------------------- Project hint ---------------------------------
# If a release build crashes with ClassNotFoundException or NoSuchMethodError
# from a particular RN library, add a `-keep class <fqcn>.** { *; }` rule
# below and re-build. Don't blanket-keep com.homjeevendor.** — defeats R8.
