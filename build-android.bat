@echo off
echo CodingPal Android APK 构建脚本
echo ================================

echo 1. 检查Android SDK...
if not exist "%ANDROID_HOME%" (
    echo 警告: ANDROID_HOME 环境变量未设置
    echo 请安装Android Studio并设置ANDROID_HOME环境变量
    echo 或者修改 android/local.properties 文件中的sdk.dir路径
    pause
    exit /b 1
)

echo 2. 构建Web应用...
npm run build
if %errorlevel% neq 0 (
    echo 构建Web应用失败
    pause
    exit /b 1
)

echo 3. 同步到Android项目...
npx cap sync android
if %errorlevel% neq 0 (
    echo 同步到Android项目失败
    pause
    exit /b 1
)

echo 4. 构建Android APK...
cd android
.\gradlew assembleDebug
if %errorlevel% neq 0 (
    echo 构建APK失败
    echo 请检查Android SDK配置和网络连接
    pause
    exit /b 1
)

echo 5. 构建完成！
echo APK文件位置: android\app\build\outputs\apk\debug\app-debug.apk
echo 您可以将此APK文件安装到Android设备上进行测试

pause