# Site fonts

Portfolio Sans is a character subset of Pretendard Variable 1.3.9. The outlines
and variable weight axis are preserved; the derivative is renamed under the OFL.
The core file contains all characters used by the compiled home page and basic
Latin characters. The content file contains the other source characters.
Each face declares a disjoint Unicode range, so text uses the matching file only.
Keep both OFL license files with the deployed fonts.

Upstream input:
- https://raw.githubusercontent.com/orioncactus/pretendard/v1.3.9/packages/pretendard/dist/web/variable/woff2/PretendardVariable.woff2
- https://raw.githubusercontent.com/orioncactus/pretendard/v1.3.9/LICENSE
- JetBrains Mono Latin variable WOFF2 from the existing Google Fonts response:
  https://fonts.gstatic.com/s/jetbrainsmono/v24/tDbv2o-flEEny0FZhsfKu5WU4zr3E_BX0PnT8RD8yKwBNntkaToggR7BYRbKPxDcwgknk-4.woff2
- https://raw.githubusercontent.com/JetBrains/JetBrainsMono/master/OFL.txt

Normal builds use the committed assets and need no font CDN or Python packages.
When adding new characters, regenerate from the original input with a Python
environment containing `fonttools[woff]==4.56.0`:

```sh
python tools/prepare-site-fonts.py <downloaded-original.woff2> src/assets/fonts
```

`coverage.json` records the original file hash, covered code points and characters
not present upstream (which intentionally use the system fallback). The build's
SEO check validates visible document text against this coverage so new content
cannot silently fall outside the subset. CSS-only changes retain content dates.
The existing `docs/index.html` determines the home-page character group; after
editing home content, regenerate once more after building the new HTML to keep
the home page in a single font file. Characters in newer source remain covered
by the content file even before that regrouping.
