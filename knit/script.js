// 変数
let canvas = document.getElementById('canvas');
let context = canvas.getContext('2d');
let isDragging = false;

let dragTarget = {
    image: -1,
    text: -1
}

let rotateTarget;
let scrollVol; // スクロール（縦）の移動量
let imgWidth = 60;
let imgHeight = 60;

// 定数
const cnvWidth = 800;
const cnvHeight = 600;
const angle = 10;

// モード
const MODE = {
    ADD: 1,
    DELETE: 2
};

// 背景
const LINEMODE = {
    POINT: 1,
    SOLID: 2,
    OFF: 0
};

// モードの初期化
let drawMode = MODE.ADD;
let lineMode = LINEMODE.OFF;


// 編み目記号の判断
let pattern;

// オブジェクトの格納
let images = [];
let texts = [];


// ガイドライン：実線
$("#btnLineSolid").click(function () {
    lineMode = LINEMODE.SOLID
    draw();
});

// ガイドライン：点線
$("#btnLinePoint").click(function () {
    lineMode = LINEMODE.POINT
    draw();
});

// ガイドライン：OFF
$("#btnLineOFF").click(function () {
    lineMode = LINEMODE.OFF;
    draw();
});

// 左回転ボタン
$("#btnLeftRotate").click(function () {

    // 未選択時抜ける
    if (rotateTarget == -1) {
        return;
    }

    // キャンバスをクリア
    context.fillStyle = '#ffe4c4'
    context.fillRect(0, 0, canvas.width, canvas.height);

    // 角度の更新
    let imgTarget = images[rotateTarget];
    imgTarget.drawAngle = (imgTarget.drawAngle - angle <= -360) ? 0 : imgTarget.drawAngle - angle;

    draw();
})

// 右回転ボタン
$("#btnRightRotate").click(function () {

    // 未選択時抜ける
    if (rotateTarget == -1) {
        return;
    }

    // キャンバスをクリア
    context.fillStyle = '#ffe4c4'
    context.fillRect(0, 0, canvas.width, canvas.height);

    // 角度の更新
    let imgTarget = images[rotateTarget];
    imgTarget.drawAngle = (imgTarget.drawAngle + angle >= 360) ? 0 : imgTarget.drawAngle + angle;

    draw();
})


// サイズ変更バー
document.getElementById('sizeChange').addEventListener('input', function (e) {
    imgWidth = +e.target.value;
    imgHeight = +e.target.value;
    changeSize();
});

// テキストの追加
$("#btnText").click(function (e) {
    let text = document.getElementById("text").value;
    let length = text.length;

    // テキストデータを格納
    let textObj = {
        val: text,
        textX: cnvWidth / 2,
        textY: cnvHeight / 2,
        textWidth: imgWidth,
        textHeight: imgHeight
        // textWidth: 22 * length,
        // textHeight: 22
    };

    texts.push(textObj);
    document.getElementById("text").value = "";
    draw();
});

// 画像をキャンバスに追加
function addImage(imgName) {
    const image = new Image();
    image.src = imgName;

    const lastImage = images[images.length - 1];

    // 描画対象の位置指定(画面外にいかないように)
    image.drawOffsetX = lastImage ?
        lastImage.drawOffsetX + imgWidth >= cnvWidth ? cnvWidth - imgWidth : lastImage.drawOffsetX + 10
        : 0;
    image.drawOffsetY = lastImage ?
        lastImage.drawOffsetY + imgHeight >= cnvHeight ? cnvHeight - imgHeight : lastImage.drawOffsetY + 10
        : 0;
    image.drawWidth = imgWidth;
    image.drawHeight = imgHeight;

    // 画像の角度
    image.drawAngle = 0;

    images.push(image);

    image.addEventListener('load', function () {
        draw();
    });

}

// 削除ボタン押下_モードの切替
$("#btnDelete").click(function () {
    if (drawMode == MODE.DELETE) {
        drawMode = MODE.ADD;
        $("#btnDelete").removeClass('active');
    }
    else {
        drawMode = MODE.DELETE;
        $("#btnDelete").addClass('active');
    }
});

// 編集ボタン押下_モードの切替
$("#btnEdit").click(function () {
    drawMode = MODE.EDIT;
});

// クリック時の処理
let mouseDown = function (e) {
    // クリック対象の取得
    scrollVol = window.pageYOffset;
    let posX = parseInt(e.clientX - canvas.offsetLeft);
    let posY = parseInt(e.clientY - canvas.offsetTop + scrollVol);

    let { targetImg, targetText } = getTarget(posX, posY);
    dragTarget.image = targetImg;
    dragTarget.text = targetText;

    rotateTarget = targetImg;

    // 削除モード
    if (drawMode == MODE.DELETE) {
        // 削除対象を描画対象から削除する
        if (targetImg > -1) {
            images.splice(targetImg, 1);
        }

        // 文字
        if (targetText > -1) {
            texts.splice(targetText, 1);
        }

        draw();
        return;
    }

    if (dragTarget.image > -1 || dragTarget.text > -1) {
        // 画像を強調する
        // let x = texts[dragTarget.text].textX;
        // let y = texts[dragTarget.text].textY;

        // context.strokeStyle = "blue";
        // context.strokeRect(x, y, texts[dragTarget.text].textWidth, texts[dragTarget.text].textHeight);

        isDragging = true;
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
    scrollVol = window.pageYOffset;
    let posX = parseInt(e.clientX - canvas.offsetLeft);
    let posY = parseInt(e.clientY - canvas.offsetTop + scrollVol);

    // ドラッグ時
    if (isDragging) {
        // 画像
        if (dragTarget.image > -1) {
            const draggingImage = images[dragTarget.image];

            draggingImage.drawOffsetX = posX - draggingImage.drawWidth / 2;
            draggingImage.drawOffsetY = posY - draggingImage.drawHeight / 2;

            // 画面外防止
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
        }

        // テキスト
        if (dragTarget.text > -1) {
            const draggingText = texts[dragTarget.text];

            draggingText.textX = posX - draggingText.textWidth / 2;
            draggingText.textY = posY - draggingText.textHeight / 2;

            // 画面外防止
            if (draggingText.textX < 0) {
                draggingText.textX = 0;
            }

            if (draggingText.textX + imgWidth > cnvWidth) {
                draggingText.textX = cnvWidth - imgWidth;
            }

            if (draggingText.textY < 0) {
                draggingText.textY = 0;
            }

            if (draggingText.textY + imgHeight > cnvHeight) {
                draggingText.textY = cnvHeight - imgHeight;
            }
        }

        draw();
    }
};

// クリア処理
$("#btnClear").click(function () {
    images = [];
    texts = [];
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

//#region 編み目記号
document.getElementById('kusari').addEventListener('click', function () {
    addImage("image/kusari.png");
});

document.getElementById('koma').addEventListener('click', function () {
    addImage("image/koma.png");
});

document.getElementById('koma_une').addEventListener('click', function () {
    addImage("image/koma_une.png");
});

document.getElementById('koma_ring').addEventListener('click', function () {
    addImage("image/koma_ring.png");
});

document.getElementById('hikinuki').addEventListener('click', function () {
    addImage("image/hikinuki.png");
});

document.getElementById('tatiagari').addEventListener('click', function () {
    addImage("image/tatiagari.png");
});

document.getElementById('koma_2_minus').addEventListener('click', function () {
    addImage("image/koma_2_minus.png");
});

document.getElementById('koma_3_minus').addEventListener('click', function () {
    addImage("image/koma_3_minus.png");
});

document.getElementById('koma_2_plus').addEventListener('click', function () {
    addImage("image/koma_2_plus.png");
});

document.getElementById('koma_3_plus').addEventListener('click', function () {
    addImage("image/koma_3_plus.png");
});

document.getElementById('tyunaga').addEventListener('click', function () {
    addImage("image/tyunaga.png");
});

document.getElementById('tyunaga_2_minus').addEventListener('click', function () {
    addImage("image/tyunaga_2_minus.png");
});

document.getElementById('tyunaga_3_minus').addEventListener('click', function () {
    addImage("image/tyunaga_3_minus.png");
});

document.getElementById('tyunaga_2_plus').addEventListener('click', function () {
    addImage("image/tyunaga_2_plus.png");
});

document.getElementById('tyunaga_3_plus').addEventListener('click', function () {
    addImage("image/tyunaga_3_plus.png");
});

document.getElementById('naga').addEventListener('click', function () {
    addImage("image/naga.png");
});

//#endregion

// 処理
// クリック対象の取得
function getTarget(x, y) {
    // 画像の判定
    let targetImg = -1;
    let targetText = -1;

    for (let i = images.length - 1; i >= 0; i--) {
        // 当たり判定（クリックした位置が画像の範囲内に収まっているか）
        if (x >= images[i].drawOffsetX &&
            x <= (images[i].drawOffsetX + images[i].drawWidth) &&
            y >= images[i].drawOffsetY &&
            y <= (images[i].drawOffsetY + images[i].drawHeight)
        ) {
            targetImg = i;
        }
    }

    // テキストの判定
    for (let i = texts.length - 1; i >= 0; i--) {
        // 当たり判定（クリックした位置が文字の範囲内に収まっているか）
        if (x >= texts[i].textX &&
            x <= (texts[i].textX + texts[i].textWidth) &&
            y >= texts[i].textY &&
            y <= (texts[i].textY + texts[i].textHeight)
        ) {
            targetText = i;
        }
    }

    return {
        targetImg,
        targetText
    }
}

// 描画
function draw() {
    // キャンバスの描画
    context.fillStyle = '#ffe4c4'
    context.fillRect(0, 0, canvas.width, canvas.height);

    // ガイドラインの描画
    guideLine();

    // 画像の描画
    for (let image of images) {
        if (image.drawAngle != 0) {
            rotateImg(image, image.drawOffsetX + imgWidth / 2, image.drawOffsetY + imgHeight / 2, image.drawAngle);
        }
        else {
            context.drawImage(image, image.drawOffsetX, image.drawOffsetY, image.drawWidth, image.drawHeight);
        }
    }   

    // テキストの描画
    for (let text of texts) {
        context.fillStyle = "Black";
        context.font = "22px serif";
        context.fillText(text.val, text.textX, text.textY);
    }
}

// 画像を回転して描写する
function rotateImg(imgTarget, cx, cy, imgAngle) {
    context.save();
    context.translate(cx, cy);
    context.rotate(imgAngle * Math.PI / 180);
    context.drawImage(imgTarget, -(imgWidth / 2), -(imgHeight / 2), imgTarget.drawWidth, imgTarget.drawHeight);
    context.restore();
}

// サイズの変更
function changeSize() {
    images.forEach((image) => {
        image.drawWidth = imgWidth;
        image.drawHeight = imgHeight;
    });
    draw();
}

// ガイドラインの描画
function guideLine() {
    switch (lineMode) {
        case LINEMODE.SOLID:
            drawLineSolid();
            break;

        case LINEMODE.POINT:
            drawLinePoint();
            break;

        case LINEMODE.OFF:
            break;

        default:
            break;
    }
}

// 点線を引く
function drawLinePoint() {
    context.fillStyle = '#ccc';

    // 横線を引く
    for (let y = 0; y < cnvHeight; y++) {
        for (let x = 0; x < cnvWidth; x += 9) {
            context.fillRect(x, y * imgHeight / 2, 2, 2);
        }
    }

    // 縦線を引く
    for (let x = 0; x < cnvWidth; x++) {
        for (let y = 0; y < cnvHeight; y += 9) {
            context.fillRect(x * imgWidth / 2, y, 2, 2);
        }
    }
};

// 実線を引く
function drawLineSolid() {
    context.beginPath();

    // 横線を引く
    for (let y = 0; y < cnvHeight; y += imgHeight / 2) {
        context.moveTo(0, y);
        context.lineTo(cnvWidth, y);
    }

    // 縦線を引く
    for (let x = 0; x < cnvWidth; x += imgWidth / 2) {
        context.moveTo(x, 0);
        context.lineTo(x, cnvHeight);
    }
    context.strokeStyle = '#ccc';
    context.lineWidth = 1;
    context.stroke();
}

// ボタンの色の変更：編み図記号
$(function () {
    let btn = $('.imgKigou');
    btn.click(function () {
        btn.removeClass('active');
        $(this).addClass('active');
    });
});

// ボタンの色の変更：ガイドライン
$(function () {
    let btn = $('.linebtn');
    btn.click(function () {
        btn.removeClass('active');
        $(this).addClass('active');
    });
});

// ページ読み込み時の処理
draw();


