# Felicia 公式サイト

VRChat 上のロールプレイイベント「Felicia」の公式サイトです。

公開 URL:
`https://fascinate-group.github.io/Felicia/`

公式 X（Twitter）: [@felicia_VRC](https://x.com/felicia_VRC)

---

## ディレクトリ構成

```text
Felicia/
|- index.html               # メインページ
|- manifest.webmanifest
|- robots.txt
|- sitemap.xml
|- start-local-httpserver.bat
|- data/
|  |- cast-data.js          # キャスト情報（手動管理）
|  |- gallery-data.js       # ギャラリー画像リスト（手動管理）
|  |- index.css             # スタイルシート
|  `- index.js              # スクリプト
|- images/
|  |- bg/                   # ヒーロー背景スライドショー画像
|  |  `- Felicia_Background_N.jpg  # 連番（1〜）
|  |- cast/                 # キャスト画像
|  |  |- NNN_名前.png        # サムネイル
|  |  `- NNN_名前_Detail.jpg/png  # 詳細（クリック時）
|  |- gallery/              # ギャラリー画像
|  |- Felicia_Logo.png      # サイトロゴ・favicon
|  |- Felicia_Banner.jpg    # OGP・動画サムネイル
|  |- Felicia_Concept1.png  # コンセプトビジュアル
|  |- Felicia_Cast_Background.jpg  # キャストセクション背景
|  |- Felicia_Fur.png       # ヒーロー羽エフェクト
|  `- x-logo.svg            # X（Twitter）ロゴ
|- video/
|  `- felicia.mp4           # イベント紹介動画
`- scripts/
   `- generate-cast-json.js # cast-data.js 生成補助スクリプト（任意）
```

---

## ローカル確認

`start-local-httpserver.bat` を実行するか、任意の静的 HTTP サーバーで `index.html` を開いてください。

`file://` での直接開封は画像・JS の読み込みに制限がかかる場合があります。

---

## キャスト画像の管理

### ファイル命名規則

```text
NNN_名前.png          ← サムネイル（キャスト一覧に表示）
NNN_名前_Detail.jpg   ← 詳細画像（クリック時にライトボックスで表示）
NNN_名前_Detail.png   ← 詳細画像（PNG の場合）
```

- `NNN` は 3 桁の表示順番号（例: `001`, `012`）
- 詳細画像がない場合はサムネイルが代わりに表示されます

### cast-data.js の編集

`data/cast-data.js` を直接編集してキャスト情報を管理します。

```js
window.CAST_DATA = [
  {
    order: 1,
    name: "アステリア",
    image: "images/cast/001_アステリア.png",
    detailImage: "images/cast/001_アステリア_Detail.jpg"
  },
  // ...
];
```

- `order`: 表示順（数値）
- `name`: キャスト名
- `image`: サムネイル画像パス
- `detailImage`: 詳細画像パス（省略可）

### キャストの追加・削除・変更

- **追加**: `images/cast/` に画像を置き、`cast-data.js` にエントリを追記
- **削除**: `cast-data.js` からエントリを削除（画像ファイルも git rm で削除）
- **名前変更**: `cast-data.js` の `name`・`image`・`detailImage` を更新し、画像ファイルもリネーム

---

## ギャラリー画像の管理

`images/gallery/` に画像を追加し、`data/gallery-data.js` にファイルパスを追記します。

```js
window.GALLERY_DATA = [
  { image: 'images/gallery/ファイル名.png' },
  // ...
];
```

---

## ヒーロー背景スライドショーの管理

`images/bg/` に `Felicia_Background_N.jpg`（連番）を置くだけで自動的にスライドショーに追加されます。

- 1 枚目（`Felicia_Background_1.jpg`）はページ表示前に優先ロードされます
- ファイルが存在しない番号で探索が終了します（連番を飛ばさないでください）

---

## 本日の出勤キャスト機能

URL パラメータでその日の出勤キャストを指定できます。

```
https://fascinate-group.github.io/Felicia/index.html?date=YYYY-MM-DD&orders=N,N,N
```

- `date`: 当日の日付（`YYYY-MM-DD` 形式）
- `orders`: 出勤キャストの番号（カンマ区切り、または `&order=N&order=N` 形式も可）

**動作:**
- 日付が当日と一致する場合のみフィルターが有効になります
- 指定したキャストのカードが明るく表示され、それ以外は暗くなります
- セクションタイトルが「本日の出勤キャスト」に切り替わります
- 日付が違う・パラメータなしの場合は通常の「キャスト紹介」表示になります

**例:**
```
?date=2026-05-24&orders=1,3,7,12
```

---

## デプロイ

GitHub Pages（手動プッシュ）でデプロイしています。

```
git add .
git commit -m "変更内容"
git push origin main
```

GitHub Pages 設定:
- `Settings > Pages > Source: Deploy from a branch`
- Branch: `main` / `/ (root)`

---

## SITE_URL 置換

以下のファイルでは `__SITE_URL__` というプレースホルダーを使用しています。

- `index.html`
- `manifest.webmanifest`
- `robots.txt`
- `sitemap.xml`

GitHub Pages では `https://fascinate-group.github.io/Felicia` に対応します。
ローカル確認時はそのままでも動作します。
