document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('imageInput').addEventListener('change', handleImage);

    const dropZone = document.getElementById('dropZone');
    dropZone.addEventListener('click', () => document.getElementById('imageInput').click());
    dropZone.addEventListener('dragover', handleDragOver);
    dropZone.addEventListener('dragleave', handleDragLeave);
    dropZone.addEventListener('drop', handleDrop);

    document.getElementById('columns').addEventListener('input', initializePiecesFromInputs);
    document.getElementById('rows').addEventListener('input', initializePiecesFromInputs);
});

function handleDragOver(event) {
    event.preventDefault();
    document.getElementById('dropZone').classList.add('hover');
}

function handleDragLeave(event) {
    event.document.getElementById('dropZone').classList.remove('hover');
}

function handleDrop(event) {
    event.preventDefault();
    document.getElementById('dropZone').classList.remove('hover');
    const file = event.dataTransfer.files[0];
    if (file) {
        const img = new Image();
        const reader = new FileReader();

        reader.onload = function (e) {
            img.src = e.target.result;
        }

        img.onload = function () {
            IMAGE = img;
            handleResize();
            initializePiecesFromInputs();
            updateGame();
        }
        reader.readAsDataURL(file);
    }
}

let CANVAS = null;
let CONTEXT = null;
let SCALER = 0.95; // 스케일러 값 변경
let SIZE = { x: 0, y: 0, width: 0, height: 0, rows: 2, columns: 2 };
let PIECES = [];
let IMAGE = null;

function main() {
    CANVAS = document.getElementById("myCanvas");
    CONTEXT = CANVAS.getContext("2d");
    window.addEventListener('resize', handleResize);
    handleResize();
}

function handleImage(event) {
    const file = event.target.files[0];
    if (file) {
        const img = new Image();
        const reader = new FileReader();

        reader.onload = function (e) {
            img.src = e.target.result;
        }

        img.onload = function () {
            IMAGE = img;
            handleResize();
            initializePiecesFromInputs();
            updateGame();
        }
        reader.readAsDataURL(file);
    }
}

function handleResize() {
    const container = document.getElementById('imageContainer');
    CANVAS.width = container.clientWidth;
    CANVAS.height = container.clientHeight;

    if (IMAGE) {
        let resizer = SCALER * Math.min(container.clientWidth / IMAGE.width, container.clientHeight / IMAGE.height);
        SIZE.width = resizer * IMAGE.width;
        SIZE.height = resizer * IMAGE.height;
        SIZE.x = CANVAS.width / 2 - SIZE.width / 2;
        SIZE.y = CANVAS.height / 2 - SIZE.height / 2;

        initializePiecesFromInputs();
        updateGame();
    }
}

function updateGame() {
    if (!IMAGE) return;

    CONTEXT.clearRect(0, 0, CANVAS.width, CANVAS.height);

    CONTEXT.fillStyle = "whitesmoke";
    CONTEXT.fillRect(0, 0, CANVAS.width, CANVAS.height);

    CONTEXT.drawImage(IMAGE, SIZE.x, SIZE.y, SIZE.width, SIZE.height);

    for (let i = 0; i < PIECES.length; i++) {
        PIECES[i].draw(CONTEXT);
    }

    // 모든 방향의 테두리 그리기
    CONTEXT.strokeStyle = "black";
    CONTEXT.lineWidth = 1;
    CONTEXT.beginPath();
    CONTEXT.rect(SIZE.x, SIZE.y, SIZE.width, SIZE.height);
    CONTEXT.stroke();
}

function initializePiecesFromInputs() {
    const rows = document.getElementById('rows').value;
    const columns = document.getElementById('columns').value;
    initializePieces(rows, columns);
    updateGame();
}

function initializePieces(rows, cols) {
    SIZE.rows = rows;
    SIZE.columns = cols;

    PIECES = [];
    for (let i = 0; i < SIZE.rows; i++) {
        for (let j = 0; j < SIZE.columns; j++) {
            PIECES.push(new Piece(i, j));
        }
    }

    let cnt = 0;
    for (let i = 0; i < SIZE.rows; i++) {
        for (let j = 0; j < SIZE.columns; j++) {
            const piece = PIECES[cnt];
            if (i == SIZE.rows - 1) {
                piece.bottom = null;
            } else {
                const sgn = (Math.random() - 0.5) < 0 ? -1 : 1;
                piece.bottom = sgn * (Math.random() * 0.4 + 0.3);
            }

            if (j == SIZE.columns - 1) {
                piece.right = null;
            } else {
                const sgn = (Math.random() - 0.5) < 0 ? -1 : 1;
                piece.right = sgn * (Math.random() * 0.4 + 0.3);
            }

            if (j == 0) {
                piece.left = null;
            } else {
                piece.left = -PIECES[cnt - 1].right;
            }

            if (i == 0) {
                piece.top = null;
            } else {
                piece.top = -PIECES[cnt - SIZE.columns].bottom;
            }
            cnt++;
        }
    }
}

class Piece {
    constructor(rowIndex, colIndex) {
        this.rowIndex = rowIndex;
        this.colIndex = colIndex;
        this.x = SIZE.x + SIZE.width * this.colIndex / SIZE.columns;
        this.y = SIZE.y + SIZE.height * this.rowIndex / SIZE.rows;
        this.width = SIZE.width / SIZE.columns;
        this.height = SIZE.height / SIZE.rows;
        this.xCorrect = this.x;
        this.yCorrect = this.y;
        this.correct = true;
    }

    draw(context) {
        context.beginPath();
        const sz = Math.min(this.width, this.height);
        const neck = 0.08 * sz;
        const tabWidth = 0.2 * sz;
        const tabHeight = 0.2 * sz;

        context.moveTo(this.x, this.y);

        //to top right
        if (this.top) {
            context.lineTo(this.x + this.width * Math.abs(this.top) - neck,
                this.y);
            context.bezierCurveTo(
                this.x + this.width * Math.abs(this.top) - neck,
                this.y - tabHeight * Math.sign(this.top) * 0.2,

                this.x + this.width * Math.abs(this.top) - tabWidth,
                this.y - tabHeight * Math.sign(this.top),

                this.x + this.width * Math.abs(this.top),
                this.y - tabHeight * Math.sign(this.top)
            );
            context.bezierCurveTo(
                this.x + this.width * Math.abs(this.top) + tabWidth,
                this.y - tabHeight * Math.sign(this.top),

                this.x + this.width * Math.abs(this.top) + neck,
                this.y - tabHeight * Math.sign(this.top) * 0.2,

                this.x + this.width * Math.abs(this.top) + neck,
                this.y
            );
        }
        context.lineTo(this.x + this.width, this.y);

        //to bottom right
        if (this.right) {
            context.lineTo(this.x + this.width, this.y + this.height * Math.
                abs(this.right) - neck);
            context.bezierCurveTo(
                this.x + this.width - tabHeight * Math.sign(this.right) *
                0.2,
                this.y + this.height * Math.abs(this.right) - neck,

                this.x + this.width - tabHeight * Math.sign(this.right),
                this.y + this.height * Math.abs(this.right) - tabWidth,

                this.x + this.width - tabHeight * Math.sign(this.right),
                this.y + this.height * Math.abs(this.right)
            );
            context.bezierCurveTo(
                this.x + this.width - tabHeight * Math.sign(this.right),
                this.y + this.height * Math.abs(this.right) + tabWidth,

                this.x + this.width - tabHeight * Math.sign(this.right) *
                0.2,
                this.y + this.height * Math.abs(this.right) + neck,

                this.x + this.width,
                this.y + this.height * Math.abs(this.right) + neck
            );
        }
        context.lineTo(this.x + this.width, this.y + this.height);

        //to bottom left
        if (this.bottom) {
            context.lineTo(this.x + this.width * Math.abs(this.bottom)
                + neck,
                this.y + this.height);

            context.bezierCurveTo(
                this.x + this.width * Math.abs(this.bottom) + neck,
                this.y + this.height + tabHeight * Math.sign(this.bottom
                ) * 0.2,

                this.x + this.width * Math.abs(this.bottom) + tabWidth,
                this.y + this.height + tabHeight * Math.sign(this.bottom),

                this.x + this.width * Math.abs(this.bottom),
                this.y + this.height + tabHeight * Math.sign(this.bottom)
            );

            context.bezierCurveTo(
                this.x + this.width * Math.abs(this.bottom) - tabWidth,
                this.y + this.height + tabHeight * Math.sign(this.bottom),

                this.x + this.width * Math.abs(this.bottom) - neck,
                this.y + this.height + tabHeight * Math.sign(this.bottom
                ) * 0.2,

                this.x + this.width * Math.abs(this.bottom) - neck,
                this.y + this.height
            );
        }
        context.lineTo(this.x, this.y + this.height);

        //to top left
        if (this.left) {
            context.lineTo(this.x, this.y + this.height * Math.abs(this.
                left) + neck);

            context.bezierCurveTo(
                this.x + tabHeight * Math.sign(this.left) * 0.2,
                this.y + this.height * Math.abs(this.left) + neck,

                this.x + tabHeight * Math.sign(this.left),
                this.y + this.height * Math.abs(this.left) + tabWidth,

                this.x + tabHeight * Math.sign(this.left),
                this.y + this.height * Math.abs(this.left)
            );

            context.bezierCurveTo(
                this.x + tabHeight * Math.sign(this.left),
                this.y + this.height * Math.abs(this.left) - tabWidth,

                this.x + tabHeight * Math.sign(this.left) * 0.2,
                this.y + this.height * Math.abs(this.left) - neck,

                this.x,
                this.y + this.height * Math.abs(this.left) - neck
            );
        }
        context.lineTo(this.x, this.y);
        context.save();
        context.clip();

        const scaledTabHeight = Math.min(IMAGE.width / SIZE.columns, IMAGE.height / SIZE.rows) * tabHeight / sz;

        context.drawImage(IMAGE,
            this.colIndex * IMAGE.width / SIZE.columns - scaledTabHeight,
            this.rowIndex * IMAGE.height / SIZE.rows - scaledTabHeight,
            IMAGE.width / SIZE.columns + scaledTabHeight * 2,
            IMAGE.height / SIZE.rows + scaledTabHeight * 2,
            this.x - tabHeight,
            this.y - tabHeight,
            this.width + tabHeight * 2,
            this.height + tabHeight * 2);

        context.restore();
        context.lineWidth = 0.6;
        context.strokeStyle = "black";
        context.stroke();

        // 개별 테두리 그리기
        // if (this.colIndex == SIZE.columns - 1) {
        //     context.beginPath();
        //     context.moveTo(this.x + this.width, this.y);
        //     context.lineTo(this.x + this.width, this.y + this.height);
        //     context.stroke();
        // }
        // if (this.rowIndex == SIZE.rows - 1) {
        //     context.beginPath();
        //     context.moveTo(this.x, this.y + this.height);
        //     context.lineTo(this.x + this.width, this.y + this.height);
        //     context.stroke();
        // }
    }
}

function saveImage() {
    const tempCanvas = document.createElement('canvas');
    const tempContext = tempCanvas.getContext('2d');

    tempCanvas.width = SIZE.width;
    tempCanvas.height = SIZE.height;

    tempContext.drawImage(IMAGE, 0, 0, SIZE.width, SIZE.height);

    for (let i = 0; i < PIECES.length; i++) {
        const piece = PIECES[i];
        piece.x = piece.colIndex * SIZE.width / SIZE.columns;
        piece.y = piece.rowIndex * SIZE.height / SIZE.rows;
        piece.draw(tempContext);
    }

    // 위쪽 테두리 그리기
    tempContext.strokeStyle = "black";
    tempContext.lineWidth = 3; // 두꺼운 테두리
    tempContext.beginPath();
    tempContext.moveTo(0, 0);
    tempContext.lineTo(SIZE.width, 0);
    tempContext.stroke();

    // 왼쪽 테두리 그리기
    tempContext.strokeStyle = "black";
    tempContext.lineWidth = 3; // 두꺼운 테두리
    tempContext.beginPath();
    tempContext.moveTo(0, 0);
    tempContext.lineTo(0, SIZE.height);
    tempContext.stroke();

    // 오른쪽 테두리 그리기
    tempContext.strokeStyle = "black";
    tempContext.lineWidth = 2; // 얇은 테두리
    tempContext.beginPath();
    tempContext.moveTo(SIZE.width - 1, 0);
    tempContext.lineTo(SIZE.width - 1, SIZE.height);
    tempContext.stroke();

    // 아래쪽 테두리 그리기
    tempContext.strokeStyle = "black";
    tempContext.lineWidth = 2; // 얇은 테두리
    tempContext.beginPath();
    tempContext.moveTo(0, SIZE.height - 1);
    tempContext.lineTo(SIZE.width, SIZE.height - 1);
    tempContext.stroke();

    const link = document.createElement('a');
    link.download = 'puzzle_image.png';
    link.href = tempCanvas.toDataURL();
    link.click();
}
main();