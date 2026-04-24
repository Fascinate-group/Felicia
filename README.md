# vrc-event-page

VRChat のロールプレイイベントサイトです。

公開 URL:
`https://{owner}.github.io/{repo}/`

## ディレクトリ構成

```text
vrc-event-page/
|- index.html
|- manifest.webmanifest
|- robots.txt
|- sitemap.xml
|- data/
|  |- cast-data.js
|  |- index.css
|  `- index.js
|- images/
|  |- cast/
|  |- cast-group.jpg
|  |- logo.png
|  |- title.png
|  `- x-logo.svg
|- scripts/
|  `- generate-cast-json.js
`- .github/
   `- workflows/
      `- build-docs.yml
```

## ローカル確認

`start-local-httpserver.bat` を使うか、任意の静的 HTTP サーバーで確認してください。

## キャスト画像の追加方法

`images/cast/` に JPG ファイルを追加します。

ファイル名の形式:

```text
NNN_名前.jpg
```

例:

```text
010_ロア.jpg
020_モカ.jpg
```

ルール:
- `NNN_` は表示順です。
- `scripts/generate-cast-json.js` が `data/cast-data.js` を生成します。
- `data/cast-data.js` は生成物なので手で編集しないでください。
- 生成時は Unicode escape で書き出すため、文字コード差異に比較的強いです。

## 画像メモ

現在の用途:
- `images/logo.png`: サイトロゴ、favicon、manifest 用アイコン元画像
- `images/title.png`: ヒーロー画像、現在の SNS 共有画像
- `images/cast-group.jpg`: キャスト集合画像
- `images/cast/*.jpg`: キャスト一覧画像

今後の改善候補:
- SNS 共有用の専用 OGP 画像を `images/ogp.png` などで用意する
- 大きい PNG / JPG を圧縮して表示を軽くする
- manifest 用の追加アイコンサイズを必要に応じて用意する
- キャスト画像の命名規則 `NNN_名前.jpg` を維持する

## デプロイ

GitHub Pages を GitHub Actions でデプロイしています。

対象 workflow:
- `.github/workflows/build-docs.yml`

処理内容:
1. `data/cast-data.js` を生成
2. 配備用ファイルを `docs/` に組み立て
3. `__SITE_URL__` を実際の公開 URL に置換
4. Pages artifact をアップロード
5. GitHub Pages にデプロイ

GitHub Pages 設定:
- `Settings > Pages`
- `Source: GitHub Actions`

## SITE_URL 置換

次のファイルでは `__SITE_URL__` を使っています。
- `index.html`
- `manifest.webmanifest`
- `robots.txt`
- `sitemap.xml`

workflow では通常、次の形式に置換します。

```text
https://{owner}.github.io/{repo}
```

必要なら Repository Variables の `SITE_URL` で上書きできます。

## 生成物の扱い

- `docs/` はデプロイ用生成物です。
- `.gitignore` に入っているため、通常は手で管理しません。
- 編集対象は `index.html`、`data/`、`images/`、`scripts/`、`.github/workflows/` です。

## 補足

- `docs/index.html` などの `docs/` 配下は直接編集しないでください。
- デプロイ結果がおかしいときは GitHub Actions の最新実行結果を確認してください。
