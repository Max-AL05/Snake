const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const gameOverScreen = document.getElementById("gameOverScreen");
const finalScoreText = document.getElementById("finalScoreText");

const pauseScreen = document.getElementById("pauseScreen");
let isPaused = false;

const box = 20;
const maxSpeed = 10;
let snake = [{ x: 160, y: 160 }];
let direction = "RIGHT";
let food = spawnFood();
let score = 0;
let canChangeDirection = true;

let drawUpdate = 300;
const scoreText = document.getElementById("score");
const comparision = document.getElementById("speed");

let timeLeft = 120;
const timerE1 = document.getElementById("timer");

document.addEventListener("keydown", changeDirection);

const timerInterval = setInterval(() => {
    if (isPaused) return;

    timeLeft--;
    const min = Math.floor(timeLeft / 60);
    const sec = timeLeft % 60;
    timerE1.textContent = `${min}:${sec < 10 ? "0" : ""}${sec}`;
    
    if (timeLeft <= 0) {
        showGameOver();
    }
}, 1000);

function changeDirection(event) {
    const key = event.keyCode;

    if (key == 32) {
        isPaused = !isPaused; 

        if (isPaused) {
            pauseScreen.style.display = "flex";
        } else {
            pauseScreen.style.display = "none";
        }
        return;
    }

    if (isPaused) return;

    if (!canChangeDirection) return;
    
    if (key === 37 && direction !== "RIGHT") direction = "LEFT";
    if (key === 38 && direction !== "DOWN") direction = "UP";
    if (key === 39 && direction !== "LEFT") direction = "RIGHT";
    if (key === 40 && direction !== "UP") direction = "DOWN";

    canChangeDirection = false;
}

function collision(head, array) {
    return array.some(segment => segment.x === head.x && segment.y === head.y);
}

function spawnFood() {
    const x = Math.floor(Math.random() * (canvas.width / box)) * box;
    const y = Math.floor(Math.random() * (canvas.height / box)) * box;
    return { x, y };
}

function draw() {
    if (isPaused) return;

    ctx.fillStyle = "#000"; 
    ctx.shadowBlur = 0; 
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < snake.length; i++) {
        ctx.fillStyle = (i == 0) ? "#FFFFFF" : "#00FFFF";
        
        ctx.shadowBlur = 15;
        ctx.shadowColor = "#00FFFF"; 
        
        ctx.fillRect(snake[i].x, snake[i].y, box, box);
        
        ctx.strokeStyle = "#000"; 
        ctx.strokeRect(snake[i].x, snake[i].y, box, box);
    }
    
    let headX = snake[0].x;
    let headY = snake[0].y;

    if (direction == "LEFT") headX -= box;
    if (direction == "RIGHT") headX += box;
    if (direction == "UP") headY -= box;
    if (direction == "DOWN") headY += box;

    if (headX < 0 || headY < 0 || headX >= canvas.width || headY >= canvas.height || collision({ x: headX, y: headY }, snake)) {
        showGameOver();
        return;
    }

    if (headX == food.x && headY == food.y) {
        score++;
        food = spawnFood();
        scoreText.textContent = `${score} PUNTOS`;
        DynamicSnakeSpeed();
    } else {
        snake.pop();
    }

    const newHead = { x: headX, y: headY };
    snake.unshift(newHead);

    ctx.fillStyle = "#FF0055";
    ctx.shadowBlur = 20; 
    ctx.shadowColor = "#FF0055";
    ctx.fillRect(food.x, food.y, box, box);

    canChangeDirection = true;
}

function DynamicSnakeSpeed() {
    if (drawUpdate > maxSpeed) {
        let newSpeed = drawUpdate;
        let emoji = "🐢";
        
        if (score >= 5 && score < 10) { newSpeed = 250; emoji = "🐇"; } 
        else if (score >= 10 && score < 15) { newSpeed = 200; emoji = "🐇"; } 
        else if (score >= 15 && score < 20) { newSpeed = 150; emoji = "🐎"; } 
        else if (score >= 20 && score < 25) { newSpeed = 100; emoji = "🚀"; } 
        else if (score >= 25 && score < 30) { newSpeed = 60; emoji = "⚡"; } 
        else if (score >= 30) { newSpeed = 40; emoji = "🔥"; }
        
        if (newSpeed < drawUpdate) {
            drawUpdate = newSpeed;
            clearInterval(game);
            game = setInterval(draw, drawUpdate);
            comparision.textContent = `Velocidad actual: ${emoji}`; 
            timeLeft += 10; 
        }
    }
}

function showGameOver() {
    clearInterval(game);
    clearInterval(timerInterval);
    
    finalScoreText.textContent = "Puntaje final: " + score;
    
    gameOverScreen.style.display = "flex";
}

let game = setInterval(draw, drawUpdate);