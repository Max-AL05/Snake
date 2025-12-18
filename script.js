const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const scoreText = document.getElementById("score");
const comparision = document.getElementById("speed");
const timerE1 = document.getElementById("timer");
const gameOverScreen = document.getElementById("gameOverScreen");
const finalScoreText = document.getElementById("finalScoreText");
const pauseScreen = document.getElementById("pauseScreen");
const audioPlayer = document.getElementById("gameMusic");
const vignette = document.getElementById("vignetteEffect");
const playerNameDisplay = document.getElementById("playerNameDisplay");
const savedName = localStorage.getItem("snakePlayerName") || "JUGADOR";
playerNameDisplay.textContent = savedName;

const box = 20;
const maxSpeed = 10;
let snake = [{ x: 160, y: 160 }];
let direction = "RIGHT";
let food = spawnFood();
let score = 0;
let canChangeDirection = true;
let drawUpdate = 300;
let timeLeft = 120;
let isPaused = false;

const playlist = [
    "track1.mp3", 
    "track2.mp3", 
    "track3.mp3"
];

function startMusic() {
    if (!audioPlayer) return;

    const randomSong = playlist[Math.floor(Math.random() * playlist.length)];
    audioPlayer.src = "sounds/" + randomSong;
    audioPlayer.volume = 0.4;
    
    const playPromise = audioPlayer.play();
    if (playPromise !== undefined) {
        playPromise.catch(error => {
            console.log("Autoplay bloqueado. Esperando interacción.");
            document.addEventListener('keydown', () => audioPlayer.play(), { once: true });
        });
    }
}

startMusic();

document.addEventListener("keydown", changeDirection);

function changeDirection(event) {
    const key = event.keyCode;

    if (key == 32) {
        isPaused = !isPaused; 
        if (isPaused) {
            pauseScreen.style.display = "flex";
            if(audioPlayer) audioPlayer.pause();
        } else {
            pauseScreen.style.display = "none";
            if(audioPlayer) audioPlayer.play();
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

function collision(head, array) {
    return array.some(segment => segment.x === head.x && segment.y === head.y);
}

function spawnFood() {
    const x = Math.floor(Math.random() * (canvas.width / box)) * box;
    const y = Math.floor(Math.random() * (canvas.height / box)) * box;
    return { x, y };
}

function triggerVignette() {
    vignette.classList.remove("active");

    void vignette.offsetWidth;

    vignette.classList.add("active");
}

function draw() {
    if (isPaused) return;

    ctx.shadowBlur = 0;
    ctx.fillStyle = "#000";
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
        triggerVignette();
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
        let emoji = "0";
        
        if (score >= 5 && score < 10) { newSpeed = 250; emoji = "1"; } 
        else if (score >= 10 && score < 15) { newSpeed = 200; emoji = "2"; } 
        else if (score >= 15 && score < 20) { newSpeed = 150; emoji = "3"; } 
        else if (score >= 20 && score < 25) { newSpeed = 100; emoji = "4"; } 
        else if (score >= 25 && score < 30) { newSpeed = 60; emoji = "5"; } 
        else if (score >= 30) { newSpeed = 40; emoji = "6"; }
        
        if (newSpeed < drawUpdate) {
            drawUpdate = newSpeed;
            clearInterval(game);
            game = setInterval(draw, drawUpdate);
            comparision.textContent = `Velocidad: ${emoji}`; 
            timeLeft += 10; 
        }
    }
}

function showGameOver() {
    clearInterval(game);
    clearInterval(timerInterval);
    
    // Detener música si existe
    if(audioPlayer) {
        audioPlayer.pause();
        audioPlayer.currentTime = 0;
    }
    
    finalScoreText.textContent = "Puntaje final: " + score;
    gameOverScreen.style.display = "flex";

    // --- NUEVO: GUARDAR EN BACKEND ---
    saveScoreToBackend(score);
}

// Nueva función para hablar con PHP
function saveScoreToBackend(finalScore) {
    // 1. Recuperar nombre (o usar "Anónimo" si falla algo)
    const playerName = localStorage.getItem("snakePlayerName") || "JUGADOR";

    // 2. Preparar los datos
    const data = {
        name: playerName,
        score: finalScore
    };

    // 3. Enviar a PHP usando fetch()
    fetch('save_score.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(result => {
        console.log("Respuesta del servidor:", result);
    })
    .catch(error => {
        console.error("Error al guardar puntuación:", error);
    });
}

let game = setInterval(draw, drawUpdate);