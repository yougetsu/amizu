let canvas = document.getElementById('canvas');
let context = canvas.getContext('2d');
let isDragging = false;
let dragTarget = null; // ドラッグ対象の画像の添え字

// 定数
const cnvWidth = 800;
const cnvHeight = 600;
const imgWidth = 60;
const imgHeight = 60;

// モード
let drawMode = 1;

const MODE = {
    ADD: 1,
    DELETE: 2
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
let pattern = KIGOU.KUSARI;

// TODO: srcsを削除
// let srcs = [];
let images = [];

// 編み目記号の描写
$("#add").click(function () {
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

    image.drawOffsetX = lastImage ? lastImage.drawOffsetX + 10 : 0;
    image.drawOffsetY = lastImage ? lastImage.drawOffsetY + 10 : 0;
    image.drawWidth = imgWidth;
    image.drawHeight = imgHeight;

    images.push(image);

    image.addEventListener('load', function () {
        // 処理
        draw();
    });
});

function draw() {
    context.clearRect(0, 0, canvas.width, canvas.height);
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

// 画像の削除処理
function deleteImg(x_d, y_d) {
    let deleteTarget = -1;
    for (let i = images.length - 1; i >= 0; i--) {
        // 当たり判定（クリックした位置が画像の範囲内に収まっているか）
        if (x_d >= images[i].drawOffsetX &&
            x_d <= (images[i].drawOffsetX + images[i].drawWidth) &&
            y_d >= images[i].drawOffsetY &&
            y_d <= (images[i].drawOffsetY + images[i].drawHeight)
        ) {
            deleteTarget = i;
            break;
        }
    }

    if (deleteTarget < 0) {
        return;
    }

    // 削除対象を配列から削除する
    images.splice(deleteTarget, 1);
    draw();
};

// クリック時の処理
let mouseDown = function (e) {
    // 削除モードのとき
    if (drawMode == MODE.DELETE) {
        // クリック位置
        let posX = parseInt(e.clientX - canvas.offsetLeft);
        let posY = parseInt(e.clientY - canvas.offsetTop);

        deleteImg(posX, posY);
    }

    // 追加モードのとき
    if (drawMode == MODE.ADD) {
        // ドラッグ開始位置
        let posX = parseInt(e.clientX - canvas.offsetLeft);
        let posY = parseInt(e.clientY - canvas.offsetTop);

        for (let i = images.length - 1; i >= 0; i--) {
            // 当たり判定（ドラッグした位置が画像の範囲内に収まっているか）
            if (posX >= images[i].drawOffsetX &&
                posX <= (images[i].drawOffsetX + images[i].drawWidth) &&
                posY >= images[i].drawOffsetY &&
                posY <= (images[i].drawOffsetY + images[i].drawHeight)
            ) {
                dragTarget = i;
                isDragging = true;
                break;
            }
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

$("#koma").click(function () {
    pattern = KIGOU.KOMA;
});

$("#koma_une").click(function () {
    pattern = KIGOU.KOMA_UNE;
});

$("#koma_ring").click(function () {
    pattern = KIGOU.KOMA_RING;
});

$("#hikinuki").click(function () {
    pattern = KIGOU.HIKINUKI;
});

$("#tatiagari").click(function () {
    pattern = KIGOU.TATIAGARI;
});

$("#koma_2_minus").click(function () {
    pattern = KIGOU.KOMA_2_MINUS;
});

$("#koma_3_minus").click(function () {
    pattern = KIGOU.KOMA_3_MINUS;
});

$("#koma_2_plus").click(function () {
    pattern = KIGOU.KOMA_2_PLUS;
});

$("#koma_3_plus").click(function () {
    pattern = KIGOU.KOMA_3_PLUS;
});

$("#tyunaga").click(function () {
    pattern = KIGOU.TYUNAGA;
});

$("#tyunaga_2_minus").click(function () {
    pattern = KIGOU.TYUNAGA_2_MINUS;
});

$("#tyunaga_3_minus").click(function () {
    pattern = KIGOU.TYUNAGA_3_MINUS;
});

$("#tyunaga_2_plus").click(function () {
    pattern = KIGOU.TYUNAGA_2_PLUS;
});

$("#tyunaga_3_plus").click(function () {
    pattern = KIGOU.TYUNAGA_3_PLUS;
});

$("#naga").click(function () {
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


