const board = document.getElementById("chessboard");
const turnIndicator = document.getElementById("turn-indicator");
const aiToggle = document.getElementById("ai-toggle");

const pieces = {
  r: "♜", n: "♞", b: "♝", q: "♛", k: "♚", p: "♟",
  R: "♖", N: "♘", B: "♗", Q: "♕", K: "♔", P: "♙"
};

let position = [];
let selected = null;
let currentTurn = "white";

function initialPosition() {
  return [
    "r","n","b","q","k","b","n","r",
    "p","p","p","p","p","p","p","p",
    "","","","","","","","",
    "","","","","","","","",
    "","","","","","","","",
    "","","","","","","","",
    "P","P","P","P","P","P","P","P",
    "R","N","B","Q","K","B","N","R"
  ];
}

function createBoard() {
  board.innerHTML = "";
  for (let i = 0; i < 64; i++) {
    const square = document.createElement("div");
    square.classList.add("square");
    square.classList.add((Math.floor(i / 8) + i) % 2 === 0 ? "light" : "dark");
    square.dataset.index = i;
    square.textContent = pieces[position[i]] || "";
    board.appendChild(square);
  }
}

function isWhite(piece) {
  return piece && piece === piece.toUpperCase();
}

function isBlack(piece) {
  return piece && piece === piece.toLowerCase();
}

function switchTurn() {
  currentTurn = currentTurn === "white" ? "black" : "white";
  turnIndicator.textContent = `Turn: ${currentTurn.charAt(0).toUpperCase() + currentTurn.slice(1)}`;
  if (aiToggle.checked && currentTurn === "black") {
    setTimeout(aiMove, 500);
  }
}

function resetGame() {
  position = initialPosition();
  selected = null;
  currentTurn = "white";
  turnIndicator.textContent = "Turn: White";
  createBoard();
}

function aiMove() {
  const moves = [];
  for (let from = 0; from < 64; from++) {
    const piece = position[from];
    if (!piece || !isBlack(piece)) continue;
    for (let to = 0; to < 64; to++) {
      if (isValidMove(from, to)) {
        moves.push({ from, to });
      }
    }
  }
  if (moves.length === 0) return;
  const move = moves[Math.floor(Math.random() * moves.length)];
  position[move.to] = position[move.from];
  position[move.from] = "";

  // AI pawn promotion
  const row = Math.floor(move.to / 8);
  if (position[move.to] === "p" && row === 7) {
    position[move.to] = "q";
  }

  createBoard();
  switchTurn();
}

function isValidMove(from, to) {
  const piece = position[from];
  const target = position[to];
  const dx = to % 8 - from % 8;
  const dy = Math.floor(to / 8) - Math.floor(from / 8);

  if (!piece) return false;
  if (isWhite(piece) && isWhite(target)) return false;
  if (isBlack(piece) && isBlack(target)) return false;

  switch (piece.toLowerCase()) {
    case "p": {
      const dir = isWhite(piece) ? -1 : 1;
      const startRow = isWhite(piece) ? 6 : 1;
      const fromRow = Math.floor(from / 8);
      if (dx === 0 && !target) {
        if (dy === dir) return true;
        if (dy === 2 * dir && fromRow === startRow && !position[from + dir * 8]) return true;
      }
      if (Math.abs(dx) === 1 && dy === dir && target) return true;
      return false;
    }
    case "r":
      return dx === 0 || dy === 0;
    case "b":
      return Math.abs(dx) === Math.abs(dy);
    case "q":
      return dx === 0 || dy === 0 || Math.abs(dx) === Math.abs(dy);
    case "n":
      return (Math.abs(dx) === 2 && Math.abs(dy) === 1) || (Math.abs(dx) === 1 && Math.abs(dy) === 2);
    case "k":
      return Math.abs(dx) <= 1 && Math.abs(dy) <= 1;
    default:
      return false;
  }
}

function promotePawn(index) {
  const choice = prompt("Promote to (Q, R, B, N):", "Q");
  const valid = ["Q", "R", "B", "N"];
  if (valid.includes(choice)) {
    position[index] = currentTurn === "white" ? choice : choice.toLowerCase();
  } else {
    position[index] = currentTurn === "white" ? "Q" : "q";
  }
}

board.addEventListener("click", (e) => {
  const index = parseInt(e.target.dataset.index);
  if (selected === null) {
    if (position[index] && ((currentTurn === "white" && isWhite(position[index])) || (currentTurn === "black" && isBlack(position[index])))) {
      selected = index;
      e.target.classList.add("selected");
    }
  } else {
    const fromSquare = board.querySelector(`[data-index="${selected}"]`);
    if (isValidMove(selected, index)) {
      position[index] = position[selected];
      position[selected] = "";

      // Pawn promotion
      const row = Math.floor(index / 8);
      if ((position[index] === "P" && row === 0) || (position[index] === "p" && row === 7)) {
        promotePawn(index);
      }

      switchTurn();
    }
    selected = null;
    fromSquare.classList.remove("selected");
    createBoard();
  }
});

resetGame();