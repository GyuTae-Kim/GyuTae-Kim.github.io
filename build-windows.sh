ng build --configuration=production --output-path docs --base-href kgt-gitblog
rmdir \s docs
mkdir docs
xcopy dist\kgt-gitblog docs /Y
