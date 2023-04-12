ng build --configuration=production
rmdir \s docs
mkdir docs
xcopy dist\kgt-gitblog docs /Y
