const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');


const headSprite= new Image();
headSprite.src = './sprites/cabeza.png'
const bodySprite =new Image();
bodySprite.src = './sprites/cuerpo.png'
const backgroundSprite= new Image();
backgroundSprite.src= './sprites/fondo.png'
const treeSprite= new Image();
treeSprite.src= './sprites/arboles.png'
const rockSprite = new Image();
rockSprite.src = './sprites/rocas.png';
const redFoodSprite = new Image();
redFoodSprite.src = './sprites/manzana.png';
const yellowFoodSprite = new Image();
yellowFoodSprite.src = './sprites/pera.png'; 
const whiteFoodSprite = new Image();
whiteFoodSprite.src = './sprites/anana.png';

const box = 20; // Tamaño de cada "bloque" del gusanito
let snake;
let direction; // Dirección inicial
let score; // Puntaje inicial
let game;
let food; 
let redFoodCount; // Contador de comida 
let grayBlocks = []; // Bloques grises
let grayBlockTimer; // Temporizador para los bloques grises
let isPaused = false; // Estado de pausa
let gameSpeed = 200; // Velocidad inicial del juego en milisegundos
const initialSpeed=200;
const speedAfter5Points = 85;
const speedAfter20Points = 75;
const speedAfter100Points = 50;
const speedDecreaseInterval = 25;

// Colores
const defaultBackgroundColor = '#17c69b'; // Color de fondo por defecto
const highlightBackgroundColor = '#ffffff'; // Color de fondo después de 15 puntos
const defaultWallColor = '#ffffff'; // Color de pared por defecto
const highlightWallColor = '#ede3fb'; // Color de pared después de 15 puntos

// Grosor del borde de la pared
const wallThickness = 3;
let keyPressed = false; // Bandera para saber si ya se ha procesado una tecla

function startGame() {
    // Ocultar pantallas de inicio o Game Over
    document.getElementById('startScreen').style.display = 'none';
    document.getElementById('gameOverScreen').style.display = 'none';

    // Inicializar variables del juego
    snake = [{x: 9 * box, y: 10 * box}];
    direction = null;
    score = 0;
    redFoodCount = 0;
    food = generateFood('red'); // Inicia con comida roja 
    grayBlocks = []; // Inicializar bloques grises
    clearInterval(grayBlockTimer); // Limpiar el temporizador de bloques grises
    grayBlockTimer = null; // Asegurarse de que no haya un temporizador corriendo
    isPaused = false; // Despausar el juego
    

    // Actualizar el puntaje mostrado
    updateScore();

    // Comenzar el bucle del juego
    clearInterval(game); // Asegurarse de que no haya un intervalo previo corriendo
    game = setInterval(gameLoop, gameSpeed);
}

document.addEventListener('keydown', changeDirection);

function changeDirection(event) {

    if (!keyPressed) {
        if (event.keyCode === 37 && direction !== 'RIGHT') {
            direction = 'LEFT';
            keyPressed = true;
        } else if (event.keyCode === 38 && direction !== 'DOWN') {
            direction = 'UP';
            keyPressed = true;
        } else if (event.keyCode === 39 && direction !== 'LEFT') {
            direction = 'RIGHT';
            keyPressed = true;
        } else if (event.keyCode === 40 && direction !== 'UP') {
            direction = 'DOWN';
            keyPressed = true;
        } else if (event.keyCode === 32) { 
            togglePause();
        }
}}
document.addEventListener('keyup', function() {
    keyPressed = false; // Restablecer la bandera cuando se libera la tecla
});
function togglePause() {
    if (isPaused) {
        game = setInterval(gameLoop, 100); // Reanudar el juego
    } else {
        clearInterval(game); // Pausar el juego
    }
    isPaused = !isPaused;
}



// Función para mover el gusanito
function moveSnake() {
    let head = {x: snake[0].x, y: snake[0].y};

    if (direction === 'LEFT') head.x -= box;
    if (direction === 'UP') head.y -= box;
    if (direction === 'RIGHT') head.x += box;
    if (direction === 'DOWN') head.y += box;
    
     // Verificar colisiones con las paredes
     if (score >= 15) {
        if (head.x < 0 || head.x >= canvas.width || head.y < 0 || head.y >= canvas.height) {
            clearInterval(game); // Finalizar el juego si hay colisión con la pared
            showGameOverScreen(); // Mostrar la pantalla de Game Over
            return; // Salir de la función si el juego ha terminado
        }
    } else {
        // Si el puntaje es menor de 15, hacer que el gusanito reaparezca en el lado opuesto
        if (head.x < 0) head.x = canvas.width - box;
        if (head.x >= canvas.width) head.x = 0;
        if (head.y < 0) head.y = canvas.height - box;
        if (head.y >= canvas.height) head.y = 0;
    }

    // Detectar si el gusanito ha comido la comida
    if (head.x === food.x && head.y === food.y) {
        let growth = 1; // Tamaño del crecimiento por defecto
        // Incrementar el puntaje según el color de la comida
        if (food.color === 'red') {
            score++;
            redFoodCount++;
           
        } else if (food.color === 'white') {
            score += 3;
            
        } else if (food.color === 'yellow') {
            score += 5;
            
        }
        updateScore(); // Actualizar el puntaje en la pantalla
        
        // Generar la siguiente comida
        if (redFoodCount >= 5) {
            const random = Math.random();
            if (random < 0.4) {
                food = generateFood('red');
            } else if (random < 0.7) {
                food = generateFood('white');
            } else {
                food = generateFood('yellow');
            }

        } else {
            food = generateFood('red');
        }
        
    } else {
        snake.pop(); // Eliminar la última parte del gusanito (cola)
    }
    snake.unshift(head); // Añadir la nueva cabeza al inicio del array

   

    // Detectar colisiones con el propio cuerpo
    for (let i = 1; i < snake.length; i++) {
        if (snake[i].x === head.x && snake[i].y === head.y) {
            clearInterval(game); // Finalizar el juego si hay colisión
            showGameOverScreen(); // Mostrar la pantalla de Game Over
        }
    }

    // Detectar colisiones con los bloques grises
    for (let block of grayBlocks) {
        if (head.x === block.x && head.y === block.y) {
            clearInterval(game);
            console.log ('chocaste') // Finalizar el juego si hay colisión con bloque gris
            showGameOverScreen(); // Mostrar la pantalla de Game Over
        }
    }
     // Ajustar la velocidad del juego si el puntaje es 20 o más
     if (score >= 20 && gameSpeed === initialSpeed) {
        gameSpeed = increasedSpeed; // Cambiar la velocidad
        clearInterval(game); // Detener el intervalo actual
        game = setInterval(gameLoop, gameSpeed); // Iniciar el juego con la nueva velocidad
    }
}

// Función para generar la comida
function generateFood(color) {
    return {
        x: Math.floor(Math.random() * 19) * box,
        y: Math.floor(Math.random() * 19) * box,
        color: color
    };
}

// Función para generar un bloque gris
function generateGrayBlock() {
    return {
        x: Math.floor(Math.random() * 19) * box,
        y: Math.floor(Math.random() * 19) * box
    };
}

// Función para iniciar el temporizador de bloques grises
function startGrayBlockTimer() {
    if (!grayBlockTimer) { // Asegurarse de que el temporizador no esté corriendo
        grayBlockTimer = setInterval(() => {
            // Añadir un nuevo bloque gris
            grayBlocks.push(generateGrayBlock());

            // Eliminar el bloque gris más antiguo después de 3 segundos
            setTimeout(() => {
                grayBlocks.shift(); // Elimina el bloque gris más antiguo
            }, 5000);
        }, 5000); // Intervalo de aparición de bloques grises
    }
}
// Función para dibujar los bloques grises
function drawGrayBlocks() {
    ctx.fillStyle = 'gray';
    for (let block of grayBlocks) {
        ctx.drawImage(rockSprite, block.x, block.y, box, box);
;
    }
}

function drawSnake() {
    for (let i = 0; i < snake.length; i++) {
        if (i === 0) { // Cabeza del gusanito
            ctx.save();
            ctx.translate(snake[i].x + box / 2, snake[i].y + box / 2); // Mover el origen al centro de la cabeza
            
            // Rotar según la dirección
            switch (direction) {
                case 'UP':
                    ctx.rotate(-Math.PI / 2);
                    break;
                case 'DOWN':
                    ctx.rotate(Math.PI / 2);
                    break;
                case 'LEFT':
                    ctx.rotate(Math.PI);
                    break;
                case 'RIGHT':
                    ctx.rotate(0);
                    break;
            }

            ctx.drawImage(headSprite, -box / 2, -box / 2, box, box);
            ctx.restore();
        } else {
            // Dibujar el cuerpo del gusanito
            ctx.drawImage(bodySprite, snake[i].x, snake[i].y, box, box);
        }
    }
}


// Función para dibujar la comida
function drawFood() {
    let foodImg;
    if (food.color === 'red'){
        foodImg= redFoodSprite;
    }else if (food.color === 'white'){
        foodImg= whiteFoodSprite;
    }else if (food.color === 'yellow'){
        foodImg =yellowFoodSprite
    }
    ctx.drawImage(foodImg, food.x, food.y, 30, 30);
}



// Función para actualizar el puntaje en la pantalla
function updateScore() {
    document.getElementById('score').textContent = 'Puntaje: ' + score;
    
}

// Función para cambiar la velocidad del juego
function updateSpeed() {
    if (score >= 100) {
        gameSpeed = speedAfter100Points - Math.floor((score - 100) / 20) * speedDecreaseInterval;
        if (gameSpeed < 10) gameSpeed = 10; // Velocidad mínima
    } else if (score >= 20) {
        gameSpeed = speedAfter20Points;
    } else if (score >= 5) {
        gameSpeed = speedAfter5Points;
    } else {
        gameSpeed = initialSpeed;
    }
    
}
// Cambiar la velocidad del juego según el puntaje
function adjustGameSpeed() {
    // Solo ajustar la velocidad si ha cambiado
    if (gameSpeed !== intervalSpeed) {
        clearInterval(game);
        game = setInterval(gameLoop, gameSpeed);
        intervalSpeed = gameSpeed;
    }
}

// Añade esta línea para inicializar el intervaloSpeed
let intervalSpeed = gameSpeed;


// Función principal del juego
function gameLoop() {
    drawBackground();
     if (score >= 20) {
        drawTreeWalls();// Color de fondo cuando el puntaje es 20 o más
    }  else {
        // Dibuja las paredes si el puntaje es menor de 20
        ctx.fillStyle = defaultWallColor; // Color de pared por defecto
        ctx.fillRect(0, 0, canvas.width, wallThickness); // Superior
        ctx.fillRect(0, 0, wallThickness, canvas.height); // Izquierda
        ctx.fillRect(canvas.width - wallThickness, 0, wallThickness, canvas.height); // Derecha
        ctx.fillRect(0, canvas.height - wallThickness, canvas.width, wallThickness); // Inferior
    }
    
    updateSpeed();
    adjustGameSpeed(); // Ajustar la velocidad si ha cambiado
    drawSnake(); // Dibujar el gusanito
    drawFood(); // Dibujar la comida
    moveSnake(); // Mover el gusanito
    drawGrayBlocks(); // Dibujar los bloques grises

    // Iniciar el temporizador de bloques grises si el puntaje es 20 o más
    if (score >= 20) {
        startGrayBlockTimer();
    }
    
}
function drawBackground() {
    ctx.drawImage(backgroundSprite, 0, 0, canvas.width, canvas.height);
}
function drawTreeWalls() {
    ctx.drawImage(treeSprite, 0, 0, wallThickness, canvas.height); // Izquierda
    ctx.drawImage(treeSprite, canvas.width - wallThickness, 0, wallThickness, canvas.height); // Derecha
    ctx.drawImage(treeSprite, 0, 0, canvas.width, wallThickness); // Superior
    ctx.drawImage(treeSprite, 0, canvas.height - wallThickness, canvas.width, wallThickness); // Inferior
}

// Función para mostrar la pantalla de Game Over
function showGameOverScreen() {
    document.getElementById('finalScore').textContent = 'Puntaje final: ' + score;
    document.getElementById('gameOverScreen').style.display = 'flex';
}

//las imagenes se cargan antes que inicie el juego 
headSprite.onload= ()=>{
    bodySprite.onload= ()=>{
        redFoodSprite.onload = () => {
            whiteFoodSprite.onload = () => {
                yellowFoodSprite.onload = () => {
                    rockSprite.onload= () =>{
                        backgroundSprite.onload=()=>{
                            console.log('Imagen de fondo cargada correctamente.');
                            treeSprite.onload=()=>{
                                console.log('Imagen de árbol cargada correctamente.');
                                startGame();
                            };
                        };
                    };
                };
            };
        };
    };
};




document.getElementById('startButton').addEventListener('click', startGame);
