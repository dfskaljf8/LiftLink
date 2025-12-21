# Add project specific ProGuard rules here.

# ==================== OBFUSCATION RULES ====================

# Enable obfuscation
-dontskipnonpubliclibraryclassmembers
-dontskipnonpubliclibraryclasses

# Enable optimization
-optimizations !code/simplification/arithmetic,!code/simplification/cast,!field/*,!class/merging/*
-optimizationpasses 5
-allowaccessmodification

# Obfuscate class names, field names, and method names
-repackageclasses 'com.liftlink.obf'
-flattenpackagehierarchy 'com.liftlink.obf'

# ==================== STRING ENCRYPTION ====================
# Encrypt strings to prevent reverse engineering
-adaptclassstrings
-adaptresourcefilenames
-adaptresourcefilecontents **.properties,META-INF/MANIFEST.MF

# ==================== REACT NATIVE RULES ====================

# Keep React Native core classes
-keep class com.facebook.react.** { *; }
-keep class com.facebook.hermes.** { *; }
-keep class com.facebook.jni.** { *; }

# Keep React Native's JavaScript interface
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# Keep our interfaces so they can be used by other ProGuard rules.
# See http://sourceforge.net/p/proguard/bugs/466/
-keep,allowobfuscation @interface com.facebook.proguard.annotations.DoNotStrip
-keep,allowobfuscation @interface com.facebook.proguard.annotations.KeepGettersAndSetters
-keep,allowobfuscation @interface com.facebook.common.internal.DoNotStrip

# Do not strip any method/class that is annotated with @DoNotStrip
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
-keepclassmembers class *  { @com.facebook.react.uimanager.UIProp <fields>; }
-keepclassmembers class *  { @com.facebook.react.uimanager.annotations.ReactProp <methods>; }
-keepclassmembers class *  { @com.facebook.react.uimanager.annotations.ReactPropGroup <methods>; }

-dontwarn com.facebook.react.**
-keep,includedescriptorclasses class com.facebook.react.bridge.** { *; }
-keep,includedescriptorclasses class com.facebook.react.turbomodule.core.** { *; }

# Keep application class
-keep class com.liftlinkapp.MainApplication { *; }
-keep class com.liftlinkapp.MainActivity { *; }

# ==================== SECURITY RULES ====================

# Obfuscate security-sensitive classes more aggressively
-keep,allowobfuscation class com.liftlinkapp.security.** { *; }
-keep,allowobfuscation class com.liftlinkapp.crypto.** { *; }

# Remove logging in production
-assumenosideeffects class android.util.Log {
    public static *** d(...);
    public static *** v(...);
    public static *** i(...);
    public static *** w(...);
    public static *** e(...);
}

# ==================== NATIVE LIBRARIES ====================

# Keep native methods
-keepclasseswithmembernames class * {
    native <methods>;
}

# ==================== SERIALIZATION ====================

# Keep Parcelable implementations
-keep class * implements android.os.Parcelable {
    public static final android.os.Parcelable$Creator *;
}

# Keep Serializable classes
-keepclassmembers class * implements java.io.Serializable {
    static final long serialVersionUID;
    private static final java.io.ObjectStreamField[] serialPersistentFields;
    private void writeObject(java.io.ObjectOutputStream);
    private void readObject(java.io.ObjectInputStream);
    java.lang.Object writeReplace();
    java.lang.Object readResolve();
}

# ==================== THIRD-PARTY LIBRARIES ====================

# Stripe SDK
-keep class com.stripe.** { *; }
-dontwarn com.stripe.**

# Google Play Services
-keep class com.google.android.gms.** { *; }
-dontwarn com.google.android.gms.**

# OkHttp
-dontwarn okhttp3.**
-dontwarn okio.**
-keep class okhttp3.** { *; }

# Retrofit (if used)
-dontwarn retrofit2.**
-keep class retrofit2.** { *; }

# JailMonkey - Root/Jailbreak Detection
-keep class com.gantix.JailMonkey.** { *; }
-dontwarn com.gantix.JailMonkey.**

# SSL Pinning
-keep class com.toybeth.sslpinning.** { *; }
-dontwarn com.toybeth.sslpinning.**

# ==================== ANNOTATIONS ====================

-keepattributes *Annotation*
-keepattributes Signature
-keepattributes Exceptions
-keepattributes InnerClasses
-keepattributes EnclosingMethod

# Keep source file names and line numbers for better crash reports
-keepattributes SourceFile,LineNumberTable
-renamesourcefileattribute SourceFile

# ==================== ADDITIONAL OBFUSCATION ====================

# Dictionary for obfuscated names (makes reverse engineering harder)
# Uncomment and customize:
# -obfuscationdictionary obfuscation-dictionary.txt
# -classobfuscationdictionary obfuscation-dictionary.txt
# -packageobfuscationdictionary obfuscation-dictionary.txt

# Overload method names aggressively
-overloadaggressively

# Use unique names for obfuscated classes
-useuniqueclassmembernames

# ==================== DEBUGGING ====================

# For debugging obfuscation issues, uncomment:
# -printmapping mapping.txt
# -printseeds seeds.txt
# -printusage usage.txt

# Verbose output (only for debugging)
# -verbose

# ==================== ANTI-TAMPERING ====================

# Make the APK harder to tamper with
-keepclassmembers class * {
    public <init>(...);
}

# Encrypt constants
-keepclassmembers class * {
    static final % *;
}

# ==================== ADDITIONAL SECURITY ====================

# Remove debug information
-assumenosideeffects class android.util.Log {
    public static *** println(...);
}

# Optimize code
-mergeinterfacesaggressively
-allowaccessmodification
-dontpreverify

# ==================== CRASH REPORTING ====================

# If using Crashlytics or similar, keep necessary classes
# -keep class com.crashlytics.** { *; }
# -dontwarn com.crashlytics.**
