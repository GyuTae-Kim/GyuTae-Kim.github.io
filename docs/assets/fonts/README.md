# Site fonts

Portfolio Sans is a character subset of Pretendard Variable 1.3.9. The outlines
and variable weight axis are preserved; the derivative is renamed under the OFL.
The core file contains all characters used by the compiled home page and basic
Latin characters. The content file contains the other source characters.
Each face declares a disjoint Unicode range, so text uses the matching file only.
Keep all OFL license files with the deployed fonts.

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

## Japanese and Simplified Chinese

Pretendard does not contain all authored Japanese and Chinese glyphs. The
renamed Portfolio Japanese and Portfolio Chinese subsets supply those glyphs
without requiring a platform CJK font. A 2.3 KiB Portfolio CJK face supplies the
native language names on the other language pages. The SSR/browser language
writer selects the native face on the HTML element before deferred CSS; English
and Korean do not load the larger CJK faces. This inline selection also prevents
the critical-CSS optimizer from discarding conditional custom-property rules.

Inputs come from `google/fonts` commit
`ddf386ba1b9fbc6b2c818f1ddcd9148f54ced94b`:

- `ofl/notosansjp/NotoSansJP[wght].ttf` and its `OFL.txt`
- `ofl/notosanssc/NotoSansSC[wght].ttf` and its `OFL.txt`
- Upstream repository: https://github.com/google/fonts/tree/ddf386ba1b9fbc6b2c818f1ddcd9148f54ced94b

Run `python tools/prepare-cjk-fonts.py <NotoSansJP.ttf> <NotoSansSC.ttf>` with
`fonttools[woff]==4.56.0` after adding new Japanese or Chinese copy.
`cjk-coverage.json` records source and output hashes and the actual subset
characters. The SEO check verifies the WOFF2 hashes and native text coverage.
CI also captures all five language directories on a system without platform
Japanese/Chinese fonts, so missing glyphs remain visible during review.
