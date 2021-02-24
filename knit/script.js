let canvas = document.getElementById('canvas');
let context = canvas.getContext('2d');
let isDragging = false;
let dragTarget = null; // ドラッグ対象の画像の添え字

// 定数
const cnvWidth = 800;
const cnvHeight = 600;
const imgWidth = 60;
const imgHeight = 60;

// モード 初期は追加モード
let drawMode = 1;
let lineMode = 0;

const MODE = {
    ADD: 1,
    DELETE: 2
};

const LINEMODE = {
    ON: 1,
    OFF: 0
};

// 編み目記号のセット
const KIGOU = {
    KUSARI: 1,
    KOMA: 2,
    KOMA_UNE: 3,
    KOMA_RING: 4,
    HIKINUKI: 5,
    TATIAGARI: 6,
    KOMA_2_MINUS: 7,
    KOMA_3_MINUS: 8,
    KOMA_2_PLUS: 9,
    KOMA_3_PLUS: 10,
    TYUNAGA: 11,
    TYUNAGA_2_MINUS: 12,
    TYUNAGA_3_MINUS: 13,
    TYUNAGA_2_PLUS: 14,
    TYUNAGA_3_PLUS: 15,
    NAGA: 16
};

// 編み目記号の判断
let pattern;
let images = [];


// ガイドラインを引く
function drawLine() {
    let center = {
        x: cnvWidth / 2,
        y: cnvHeight / 2
    };
    context.fillStyle = '#ccc';

    // 画像の半分の長さずつ縦横のラインを引く
    // 





    // 横線を引く
    let drawHorizontalLine = function () {
        context.beginPath();
        context.moveTo(0, center.y);
        for (let space = 0; space < cnvHeight; space++) {
            for (let i = 0; i < cnvWidth; i++) {
                if (i % 9 == 0) context.fillRect(i, space * imgHeight / 2, 2, 2);
            }
        }
        context.closePath();
        context.stroke();
    };

    // 縦線を引く
    let drawVerticalLine = function () {
        context.beginPath();
        context.moveTo(center.x, 0);
        for(let space = 0; space < cnvWidth; space++){
            for (let i = 0; i < cnvHeight; i++) {
                if (i % 9 == 0) context.fillRect(space * imgWidth / 2, i, 2, 2);
            }
        }
        context.closePath();
        context.stroke();
    };

    drawHorizontalLine();
    drawVerticalLine();
};

// ガイドラインのON/OFF
$("#btnLine").click(function () {
    if (lineMode == LINEMODE.OFF) {
        drawLine();
        lineMode = LINEMODE.ON;
        $(this).addClass('active');
    }
    else {
        lineMode = LINEMODE.OFF;
        $(this).removeClass('active');
        draw();
    }
});


// 編み目記号の描写
$("#add").click(function () {
    // モードの切替
    drawMode = MODE.ADD;

    const image = new Image();

    switch (pattern) {
        case KIGOU.KUSARI:
            image.src = "image/kusari.png";
            break;
        case KIGOU.KOMA:
            image.src = "image/koma.png";
            break;
        case KIGOU.KOMA_UNE:
            image.src = "image/koma_une.png";
            break;
        case KIGOU.KOMA_RING:
            image.src = "image/koma_ring.png";
            break;
        case KIGOU.HIKINUKI:
            image.src = "image/hikinuki.png";
            break;
        case KIGOU.TATIAGARI:
            image.src = "image/tatiagari.png";
            break;
        case KIGOU.KOMA_2_MINUS:
            image.src = "image/koma_2_minus.png";
            break;
        case KIGOU.KOMA_3_MINUS:
            image.src = "image/koma_3_minus.png";
            break;
        case KIGOU.KOMA_2_PLUS:
            image.src = "image/koma_2_plus.png";
            break;
        case KIGOU.KOMA_3_PLUS:
            image.src = "image/koma_3_plus.png";
            break;
        case KIGOU.TYUNAGA:
            image.src = "image/tyunaga.png";
            break;
        case KIGOU.TYUNAGA_2_MINUS:
            image.src = "image/tyunaga_2_minus.png";
            break;
        case KIGOU.TYUNAGA_3_MINUS:
            image.src = "image/tyunaga_3_minus.png";
            break;
        case KIGOU.TYUNAGA_2_PLUS:
            image.src = "image/tyunaga_2_plus.png";
            break;
        case KIGOU.TYUNAGA_3_PLUS:
            image.src = "image/tyunaga_3_plus.png";
            break;
        case KIGOU.NAGA:
            image.src = "image/naga.png";
            break;

        default:
            break;
    }

    const lastImage = images[images.length - 1];

    // 描画対象の位置指定
    image.drawOffsetX = lastImage ? lastImage.drawOffsetX + 10 : 0;
    image.drawOffsetY = lastImage ? lastImage.drawOffsetY + 10 : 0;
    image.drawWidth = imgWidth;
    image.drawHeight = imgHeight;

    images.push(image);

    image.addEventListener('load', function () {
        draw();
    });
});

// 描画
function draw() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    // ガイドラインONのとき
    if (lineMode == LINEMODE.ON) {
        drawLine();
    };

    for (const image of images) {
        // 画像を描画した時の情報を記憶（Imageのプロパティに突っ込むのはちょっと反則かもだけど）                   
        // 画像を描画
        context.drawImage(image, image.drawOffsetX, image.drawOffsetY, image.drawWidth, image.drawHeight);
    }
}

// 削除ボタン押下_モードの切替
$("#delete").click(function () {
    drawMode = MODE.DELETE;
});


// クリック対象の取得
function getImg(x, y) {
    for (let i = images.length - 1; i >= 0; i--) {
        // 当たり判定（クリックした位置が画像の範囲内に収まっているか）
        if (x >= images[i].drawOffsetX &&
            x <= (images[i].drawOffsetX + images[i].drawWidth) &&
            y >= images[i].drawOffsetY &&
            y <= (images[i].drawOffsetY + images[i].drawHeight)
        ) {
            return i;
        }
    }
    return -1;
}


// クリック時の処理
let mouseDown = function (e) {
    // クリック対象の取得
    let posX = parseInt(e.clientX - canvas.offsetLeft);
    let posY = parseInt(e.clientY - canvas.offsetTop);

    let targetImg = getImg(posX, posY);

    // 削除モード
    if (drawMode == MODE.DELETE) {
        // 削除対象を描画対象から削除する
        if (targetImg > -1) {
            images.splice(targetImg, 1);
            draw();
        }
    }

    // 追加モード
    if (drawMode == MODE.ADD) {
        if (targetImg > -1) {
            dragTarget = targetImg;
            isDragging = true;
        }
    }
}

// ドラッグ終了
let mouseUp = function (e) {
    isDragging = false;
};

// canvasの枠から外れた
let mouseOut = function (e) {
    // canvas外にマウスカーソルが移動した場合に、ドラッグ終了としたい場合はコメントインする
    // mouseUp(e);
}

// ドラッグ中
let mouseMove = function (e) {
    // ドラッグ終了位置
    let posX = parseInt(e.clientX - canvas.offsetLeft);
    let posY = parseInt(e.clientY - canvas.offsetTop);

    if (isDragging) {
        const draggingImage = images[dragTarget];

        draggingImage.drawOffsetX = posX - draggingImage.drawWidth / 2;
        draggingImage.drawOffsetY = posY - draggingImage.drawHeight / 2;

        // 画面外に画像がいかないように
        if (draggingImage.drawOffsetX < 0) {
            draggingImage.drawOffsetX = 0;
        }

        if (draggingImage.drawOffsetX + imgWidth > cnvWidth) {
            draggingImage.drawOffsetX = cnvWidth - imgWidth;
        }

        if (draggingImage.drawOffsetY < 0) {
            draggingImage.drawOffsetY = 0;
        }

        if (draggingImage.drawOffsetY + imgHeight > cnvHeight) {
            draggingImage.drawOffsetY = cnvHeight - imgHeight;
        }
        draw();
    }
};

// クリア処理
$("#btnClear").click(function () {
    images = [];
    draw();
});


// ダウンロード処理
$("#btnDL").click(function () {
    document.getElementById("btnDL").href = canvas.toDataURL("image/jpeg");
});

// canvasにイベント登録
canvas.addEventListener('mousedown', function (e) { mouseDown(e); }, false);
document.body.addEventListener('mousemove', function (e) { mouseMove(e); }, false);
document.body.addEventListener('mouseup', function (e) { mouseUp(e); }, false);
canvas.addEventListener('mouseout', function (e) { mouseOut(e); }, false);

// 編み目記号の選択
document.getElementById('kusari').addEventListener('click', function () {
    pattern = KIGOU.KUSARI;
});

document.getElementById('koma').addEventListener('click', function () {
    pattern = KIGOU.KOMA;
});

document.getElementById('koma_une').addEventListener('click', function () {
    pattern = KIGOU.KOMA_UNE;
});

document.getElementById('koma_ring').addEventListener('click', function () {
    pattern = KIGOU.KOMA_RING;
});

document.getElementById('hikinuki').addEventListener('click', function () {
    pattern = KIGOU.HIKINUKI;
});

document.getElementById('tatiagari').addEventListener('click', function () {
    pattern = KIGOU.TATIAGARI;
});

document.getElementById('koma_2_minus').addEventListener('click', function () {
    pattern = KIGOU.KOMA_2_MINUS;
});

document.getElementById('koma_3_minus').addEventListener('click', function () {
    pattern = KIGOU.KOMA_3_MINUS;
});

document.getElementById('koma_2_plus').addEventListener('click', function () {
    pattern = KIGOU.KOMA_2_PLUS;
});

document.getElementById('koma_3_plus').addEventListener('click', function () {
    pattern = KIGOU.KOMA_3_PLUS;
});

document.getElementById('tyunaga').addEventListener('click', function () {
    pattern = KIGOU.TYUNAGA;
});

document.getElementById('tyunaga_2_minus').addEventListener('click', function () {
    pattern = KIGOU.TYUNAGA_2_MINUS;
});

document.getElementById('tyunaga_3_minus').addEventListener('click', function () {
    pattern = KIGOU.TYUNAGA_3_MINUS;
});

document.getElementById('tyunaga_2_plus').addEventListener('click', function () {
    pattern = KIGOU.TYUNAGA_2_PLUS;
});

document.getElementById('tyunaga_3_plus').addEventListener('click', function () {
    pattern = KIGOU.TYUNAGA_3_PLUS;
});

document.getElementById('naga').addEventListener('click', function () {
    pattern = KIGOU.NAGA;
});

// ボタンの色の変更
$(function () {
    let btn = $('.imgKigou');
    btn.click(function () {
        btn.removeClass('active');
        $(this).addClass('active');
    });
});


