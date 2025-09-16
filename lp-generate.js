const fs = require("fs");
const path = require("path");

// --- 1. 任意ディレクトリ名とオプション取得 ---
const args = process.argv.slice(2);
if (args.length === 0) {
    console.error("❌ 任意のディレクトリ名を指定してください。\n例: node generate-lp.js mycampaign [youtubeID] [insertIndex]");
    process.exit(1);
}
const campaignDirName = args[0];
const youtubeID = args[1] || null;       // YouTube ID (任意)
const insertIndex = args[2] ? parseInt(args[2], 10) : null; // どの contentsWrap に挿入するか (1始まり)

// --- 2. 画像ソースディレクトリのパス ---
const sourceImgDir = "/Users/t_nakajima/Desktop/images/subway";
if (!fs.existsSync(sourceImgDir)) {
    console.error("❌ ソース画像フォルダが存在しません: " + sourceImgDir);
    process.exit(1);
}

// lp_contents/images ディレクトリを作成
const imgDir = path.join(process.cwd(), "lp_contents/images");
if (!fs.existsSync(imgDir)) {
    fs.mkdirSync(imgDir, { recursive: true });
    console.log("✅ lp_contents/images ディレクトリを作成しました");
}

// デスクトップから画像をコピー
const sourceImgFiles = fs.readdirSync(sourceImgDir).filter(f => /\.(png|jpe?g|webp|gif)$/i.test(f));
if (sourceImgFiles.length === 0) {
    console.error("❌ ソース画像フォルダに画像が見つかりません: " + sourceImgDir);
    process.exit(1);
}

sourceImgFiles.forEach(file => {
    const srcPath = path.join(sourceImgDir, file);
    const destPath = path.join(imgDir, file);
    fs.copyFileSync(srcPath, destPath);
});
console.log(`✅ ${sourceImgFiles.length} 枚の画像を ${sourceImgDir} から ${imgDir} にコピーしました`);

// --- 3. 出力先パス ---
const outDir = path.join(
    process.cwd(),
    "../works/site/origin.subway.co.jp/htdocs/campaign",
    campaignDirName
);
const outDirSp = path.join(
    process.cwd(),
    "../works/site/origin.subway.co.jp/htdocs/sp/campaign",
    campaignDirName
);

if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
if (!fs.existsSync(outDirSp)) fs.mkdirSync(outDirSp, { recursive: true });

// --- 4. 画像ディレクトリ作成 ---
const outImgDir = path.join(outDir, "images");
if (!fs.existsSync(outImgDir)) fs.mkdirSync(outImgDir, { recursive: true });

// --- 5. 画像ファイル取得 & コピー ---
const imgFiles = fs.readdirSync(imgDir).filter(f => /\.(png|jpe?g|webp|gif)$/i.test(f));
if (imgFiles.length === 0) {
    console.error("❌ lp_images に画像が見つかりません。");
    process.exit(1);
}

imgFiles.forEach(file => {
    const srcPath = path.join(imgDir, file);
    const destPath = path.join(outImgDir, file);
    fs.copyFileSync(srcPath, destPath);
});
console.log(`✅ ${imgFiles.length} 枚の画像を ${outImgDir} にコピーしました`);

// --- 6. CSS ファイルコピー ---
// PC用CSS
const cssSrc = path.join(process.cwd(), "lp_contents/css/content.css");
const cssDestDir = path.join(outDir, "css");
if (!fs.existsSync(cssDestDir)) fs.mkdirSync(cssDestDir, { recursive: true });
const cssDest = path.join(cssDestDir, "content.css");
fs.copyFileSync(cssSrc, cssDest);
console.log(`✅ PC用CSSファイルを ${cssDest} にコピーしました`);

// SP用CSS
const cssSpSrc = path.join(process.cwd(), "lp_contents/css/content_sp.css");
const cssSpDestDir = path.join(outDirSp, "css");
if (!fs.existsSync(cssSpDestDir)) fs.mkdirSync(cssSpDestDir, { recursive: true });
const cssSpDest = path.join(cssSpDestDir, "content_sp.css");
fs.copyFileSync(cssSpSrc, cssSpDest);
console.log(`✅ SP用CSSファイルを ${cssSpDest} にコピーしました`);

// --- 7. contentsWrap を自動生成 ---
const contentsMarkup = imgFiles.map((file, index) => {
    let iframeMarkup = "";
    if (youtubeID && insertIndex === index + 1) {
        iframeMarkup = `
        <div class="contentsYoutube">
            <div class="contentsYoutube__inner">
                <iframe width="560" height="315" src="https://www.youtube.com/embed/${youtubeID}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
            </div>
        </div>`;
    }

    return `
    <div class="contentsWrap${index + 1}">
        <img src="images/${file}" alt="${file.replace(/\.[^.]+$/, '')}">
        ${iframeMarkup}
    </div>
    `;
}).join("\n");

// SP用のcontentsMarkup
const contentsMarkupSp = imgFiles.map((file, index) => {
    let iframeMarkup = "";
    if (youtubeID && insertIndex === index + 1) {
        iframeMarkup = `
        <div class="contentsYoutube">
            <div class="contentsYoutube__inner">
                <iframe width="560" height="315" src="https://www.youtube.com/embed/${youtubeID}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
            </div>
        </div>`;
    }

    return `
    <div class="contentsWrap${index + 1}">
        <img src="/campaign/${campaignDirName}/images/${file}" alt="${file.replace(/\.[^.]+$/, '')}">
        ${iframeMarkup}
    </div>
    `;
}).join("\n");

// --- 8. HTML テンプレート ---
const htmlTemplate = `<!DOCTYPE HTML>
<html>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <meta name="description" content=""/>
    <meta name="keywords" content="" />
    <title>│サブウェイのキャンペーン情報│サブウェイ公式サイト</title>

    <link href="../../../common/css/import.css" rel="stylesheet" type="text/css"/>
    <link href="css/content.css" rel="stylesheet" type="text/css"/>

    <script src="https://ajax.googleapis.com/ajax/libs/jquery/1.5.2/jquery.min.js"></script>
    <script src="../../../common/js/smoothScroll.js" type="text/javascript"></script>
    <script src="../../../common/js/smartRollover.js" type="text/javascript"></script>
    <script src="../../../common/js/ga.js" type="text/javascript"></script>
    <script src="/common/js/routingByDevice.js" type="text/javascript"></script>

    <meta name="twitter:card" content="summary_large_image">
    <meta property="fb:app_id" content="2304012633006113"/>
    <meta property="og:type" content="article">
    <meta property="og:title" content="">
    <meta property="og:description" content="">
    <meta property="og:image" content="https://www.subway.co.jp/campaign/${campaignDirName}/images/og.jpg">

    <!--#include virtual="/common/ssi/gtm_head.html" -->
</head>

<body class="info">
<!--#include virtual="/common/ssi/gtm_body.html" -->

<a name="pagetop" id="pagetop"></a>
<div id="headerWrap">
    <!--#include virtual="/common/ssi/header.html" -->
</div>

<div id="contentsNaviWrap">
    <p id="pankuzu"><a href="/">ホーム</a> ＞ <a href="/info/">お得な情報</a> ＞ </p>
</div>

<div id="contentsWrap" class="clearfix">
    <div id="mainArea" class="imagesBox">
        <div class="contents" id="contentsTop">
            ${contentsMarkup}
        </div>

        <div class="note">
            <div class="txtBox">
                <div class="txtBox__inner">
                    <p class="txt">
                        <span>【キャンペーン期間】</span>
                        <span class="">
                            2025年9月10日（水）～2025年11月11日（火）
                        </span>
                    </p>
                    <br>
                    <p class="txt">
                        <span>【販売店舗】</span>
                        サブウェイ全店（レジャー施設内店舗等、一部取り扱いのない店舗や実施内容、実施期間、価格が異なる場合がございます。）<br>
                        ※期間限定メニューのため品切れになる場合がございます。ご了承ください。<br>
                        ※表示価格はすべて税込です。<br>
                        ※写真はすべてイメージです。
                    </p>
                </div>
            </div>
        </div>

        <p class="btn--magazine" style="text-align: center">
            <a href="/info/mailmagazine/" target="_blank" id="cplpmailmagazine">
                <img src="/campaign/common/img/btn--magazine.png" alt="">
            </a>
        </p>

        <!--#include virtual="/campaign/common/bannerItems.html" -->

        <div class="sns">
            <ul class="snsItems js-sns_share_area">
                <li class="snsItem">
                    <a class="fb_good_btn js-facebook" href="" target="_blank">
                        <img src="images/snsItem--fb.png" alt="">
                    </a>
                </li>
                <li class="snsItem">
                    <a class="tw_share_btn js-twitter" href="" target="_blank">
                        <img src="images/snsItem--tw.png" alt="">
                    </a>
                </li>
                <li class="snsItem">
                    <a class="line_share_btn js-line" href="" target="_blank">
                        <img src="images/snsItem--line.png" alt="">
                    </a>
                </li>
            </ul>
        </div>
    </div>

    <div id="sideArea">
        <!--#include virtual="/common/ssi/info_menu.html" -->
        <!--#include virtual="/common/ssi/campaign_menu.html" -->
        <!--#include virtual="/common/ssi/campaign_subclub.html" -->
    </div>
</div>

<div id="footerWrap" class="clear">
    <!--#include virtual="/common/ssi/footer.html" -->
</div>

</body>
</html>`;

const htmlTemplateSp = `<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, user-scalable=no, initial-scale=1, maximum-scale=1">
    <meta name="format-detection" content="telephone=no">
    <meta name="description" content=""/>
    <meta name="keywords" content="サブウェイ,subway,お得,キャンペーン,秋だし、だしタル。,期間限定,メニュー" />
    <title>│サブウェイのキャンペーン情報│サブウェイ公式サイト</title>
    <link rel="stylesheet" type="text/css" href="/sp/common/css/default.css">
    <link rel="stylesheet" type="text/css" href="/sp/common/css/drawer.min.css">
    <link href="css/content_sp.css" rel="stylesheet" type="text/css">

    <script type="text/javascript" src="/sp/common/js/jquery-1.11.3.min.js"></script>
    <script type="text/javascript" src="/sp/common/js/iscroll.min.js"></script>
    <script type="text/javascript" src="/sp/common/js/drawer.min.js"></script>
    <script type="text/javascript" src="/sp/common/js/iphone.js"></script>
    <script type="text/javascript" src="/sp/common/js/smScroll.js"></script>
    <script type="text/javascript" src="/sp/common/js/drawer_app.js"></script>
    <script type="text/javascript" src="/sp/common/js/routingByDevice.js"></script>

    <meta name="twitter:card" content="summary_large_image">
    <meta property="og:type" content="article">
    <meta property="og:title" content="│サブウェイのキャンペーン情報│サブウェイ公式サイト">
    <meta property="og:description" content="">
    <meta property="og:image" content="https://www.subway.co.jp/campaign/${campaignDirName}/images/og.jpg">

    <!--#include virtual="/common/ssi/gtm_head.html" -->

    <script>
        $(function () {

            let sharaTxt = ""

            sharaTxt = encodeURIComponent(sharaTxt);
            let url = location.href;
            let shareUrl = encodeURIComponent(url);
            $(' .js-sns_share_area  a.js-facebook').attr("href", "https://www.facebook.com/sharer/sharer.php?u=" + shareUrl + "&t=" + sharaTxt);
            $(' .js-sns_share_area  a.js-twitter').attr("href", "https://twitter.com/share?url=" + shareUrl + "&text=" + sharaTxt);
            $(' .js-sns_share_area  a.js-line').attr("href", "http://line.me/R/msg/text/?" + shareUrl);
        });
    </script>

</head>
<body class="drawer drawer--right">
<!--#include virtual="/common/ssi/gtm_body.html" -->

<!-- === [ pageHeaderArea ] ======================================================================== -->
<!-- COMMON header START -->
<!--#include virtual="/sp/common/ssi/header.html" -->
<!-- COMMON header END -->
<!-- //=== [ pageHeaderArea ] ======================================================================== -->

<!-- pankuzu -->
<div id="contentsNaviWrap">
    <p id="pankuzu"><a href="/sp/">ホーム</a> ＞ <a href="/sp/info/">お得な情報・キャンペーン</a> ＞ </p>
</div>

<div id="pageBodyArea" style="overflow-x: hidden">
    <article id="infoArea">

        <!--↓メインコンテンツココに作成-->
        <div class="contents" id="contentsTop">

            ${contentsMarkupSp}

            <div class="note">
                <div class="txtBox">
                    <div class="txtBox__inner">
                        <p class="txt">
                            <span>【キャンペーン期間】</span><br>
                            <span class="">
                                2025年9月10日（水）～2025年11月11日（火）
                            </span>
                        </p>
                        <br>
                        <p class="txt">
                            <span>【販売店舗】</span><br>
                            サブウェイ全店（レジャー施設内店舗等、一部取り扱いのない店舗や実施内容、実施期間、価格が異なる場合がございます。）<br>
                            ※期間限定メニューのため品切れになる場合がございます。ご了承ください。<br>
                            ※表示価格はすべて税込です。<br>
                            ※写真はすべてイメージです。
                        </p>
                    </div>
                </div>
            </div>


            <p class="btn--magazine" style="text-align: center">
            <a href="/info/mailmagazine/" target="_blank" id="cplpmailmagazine">
            <img src="/campaign/common/img/btn--magazine.png" alt="">
            </a>
            </p>

            <!--#include virtual="/campaign/common/bannerItems.html" -->


            <div class="sns">
                <ul class="snsItems js-sns_share_area">
                    <li class="snsItem">
                        <a class="fb_good_btn js-facebook" href="" target="_blank">
                            <img src="images/snsItem--fb.png" alt="">
                        </a>
                    </li>
                    <li class="snsItem">
                        <a class="tw_share_btn js-twitter" href="" target="_blank">
                            <img src="images/snsItem--tw.png" alt="">
                        </a>
                    </li>
                    <li class="snsItem">
                        <a class="line_share_btn js-line" href="" target="_blank">
                            <img src="images/snsItem--line.png" alt="">
                        </a>
                    </li>
                </ul>
            </div>

        </div>
        <!--↑メインコンテンツココに作成-->

    </article>
</div>

<!-- COMMON footer_menu START -->
<!--#include virtual="/sp/common/ssi/footer_menu.html" -->
<!-- COMMON footer_menu END -->

<!-- COMMON footer START -->
<!--#include virtual="/sp/common/ssi/footer.html" -->
<!-- COMMON footer END -->


</body>
</html>`

// --- 9. HTML 書き出し ---
// PC用HTML
fs.writeFileSync(path.join(outDir, "index.html"), htmlTemplate, "utf-8");
console.log(`✅ PC用HTMLを ${outDir}/index.html に生成しました`);

// SP用HTML
fs.writeFileSync(path.join(outDirSp, "index.html"), htmlTemplateSp, "utf-8");
console.log(`✅ SP用HTMLを ${outDirSp}/index.html に生成しました`);

if (youtubeID && insertIndex) {
    console.log(`✅ YouTube iframe を contentsWrap${insertIndex} に挿入しました (ID: ${youtubeID})`);
}