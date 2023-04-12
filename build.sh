ng build --configuration=production
rm -rf docs
mkdir docs
cp -r ./dist/kgt-gitblog/* ./docs
