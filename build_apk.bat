@echo off
echo ========================================================
echo DONG GOI UNG DUNG ANDROID (.APK) BANG EXPO CLOUD
echo ========================================================
echo.
echo He thong se tien hanh dang nhap va gui ma nguon len may chu de build.
echo Xin vui long cho trong giay lat...
echo.


cd super-app-mobile

call npx eas-cli build -p android --profile preview

echo.
echo ========================================================
echo Qua trinh build hoan tat hoac bi huy!
echo ========================================================

