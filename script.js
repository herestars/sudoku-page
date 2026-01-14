const grid = document.getElementById('sudokuGrid');
const resetBtn = document.getElementById('resetBtn');
const newBtn = document.getElementById('newBtn');
let sudokuBoard = []; // 存储数独完整答案
let puzzleBoard = []; // 存储数独题目（挖空后的）

// 初始化：生成第一个数独
generateSudoku();
renderBoard();

// 生成合法的数独（完整答案+挖空题目）
function generateSudoku() {
    sudokuBoard = createEmptyBoard();
    fillBoard(sudokuBoard);
    puzzleBoard = [...sudokuBoard.map(row => [...row])];
    // 挖掉60个格子，保留31个数字（难度适中，可改数字调整难度，挖越多越难）
    removeNumbers(puzzleBoard, 60);
}

// 创建9x9空棋盘
function createEmptyBoard() {
    return Array(9).fill().map(() => Array(9).fill(0));
}

// 回溯法填充完整数独（保证唯一解）
function fillBoard(board) {
    const empty = findEmptyCell(board);
    if (!empty) return true;
    const [row, col] = empty;
    const nums = shuffle([1,2,3,4,5,6,7,8,9]);
    for (let num of nums) {
        if (isValid(board, num, row, col)) {
            board[row][col] = num;
            if (fillBoard(board)) return true;
            board[row][col] = 0;
        }
    }
    return false;
}

// 随机挖空，生成题目
function removeNumbers(board, count) {
    let cells = [];
    for (let i = 0; i < 9; i++) for (let j = 0; j < 9; j++) cells.push([i,j]);
    cells = shuffle(cells);
    for (let i = 0; i < count; i++) {
        const [row, col] = cells[i];
        board[row][col] = 0;
    }
}

// 查找空单元格
function findEmptyCell(board) {
    for (let i = 0; i < 9; i++)
        for (let j = 0; j < 9; j++)
            if (board[i][j] === 0) return [i, j];
    return null;
}

// 验证数字是否合法
function isValid(board, num, row, col) {
    // 检查行
    for (let i = 0; i < 9; i++) if (board[row][i] === num) return false;
    // 检查列
    for (let i = 0; i < 9; i++) if (board[i][col] === num) return false;
    // 检查3x3宫
    const boxRow = Math.floor(row / 3) * 3;
    const boxCol = Math.floor(col / 3) * 3;
    for (let i = 0; i < 3; i++)
        for (let j = 0; j < 3; j++)
            if (board[boxRow+i][boxCol+j] === num) return false;
    return true;
}

// 随机打乱数组（生成随机数独）
function shuffle(arr) {
    return arr.sort(() => Math.random() - 0.5);
}

// 渲染数独棋盘到页面
function renderBoard() {
    grid.innerHTML = '';
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            const cell = document.createElement('input');
            cell.type = 'text';
            cell.className = 'sudoku-cell';
            cell.maxLength = 1; // 只能填1个数字
            // 题目自带的数字：不可修改，加样式
            if (puzzleBoard[row][col] !== 0) {
                cell.value = puzzleBoard[row][col];
                cell.classList.add('original');
            } else {
                // 玩家可填写的空格，绑定事件
                cell.addEventListener('input', () => handleCellInput(cell, row, col));
                cell.addEventListener('keydown', (e) => {
                    // 只允许输入1-9的数字，禁止其他按键
                    if (!['1','2','3','4','5','6','7','8','9','Backspace','Delete'].includes(e.key)) {
                        e.preventDefault();
                    }
                });
            }
            grid.appendChild(cell);
        }
    }
}

// 处理玩家填写数字的逻辑 + 实时验证合法性
function handleCellInput(cell, row, col) {
    const value = cell.value.trim();
    // 只保留1-9的数字
    if (!/^[1-9]$/.test(value)) {
        cell.value = '';
        cell.classList.remove('user', 'error');
        return;
    }
    const num = parseInt(value);
    cell.classList.add('user');
    // 验证当前数字是否合法：行/列/九宫格无重复
    if (isValid(puzzleBoard, num, row, col)) {
        cell.classList.remove('error');
    } else {
        cell.classList.add('error'); // 重复则标红警告
    }
}

// 清空盘面按钮事件
resetBtn.addEventListener('click', () => {
    const cells = document.querySelectorAll('.sudoku-cell');
    cells.forEach(cell => {
        if (!cell.classList.contains('original')) {
            cell.value = '';
            cell.classList.remove('user', 'error');
        }
    });
});

// 生成新数独按钮事件
newBtn.addEventListener('click', () => {
    generateSudoku();
    renderBoard();
});