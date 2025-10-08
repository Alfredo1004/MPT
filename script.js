// Referencias a elementos del DOM (Document Object Model)
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const shootButton = document.getElementById('shootButton');
const powerBar = document.getElementById('powerBar');
const golesMarcadosEl = document.getElementById('golesMarcados');
const consumoTotalEl = document.getElementById('consumoTotal');
const eficienciaEl = document.getElementById('eficiencia');

// Variables del juego
let isShooting = false;
let power = 0;
let goles = 0;
let consumoTotal = 0;

// Variables de la animación de la pelota
let isShotActive = false;
let isGoal = false;
let shotProgress = 0;
const shotDuration = 0.5; // Duración de la animación en segundos
let goalEffectActive = false;

// Variables para el mensaje flotante
let messageText = ""; 
let messageColor = ""; 
let messageActive = false; 
let messageAlpha = 1.0; 
const messageDuration = 1500; // Duración del mensaje en milisegundos
let restartButton = null; // Variable para el botón de reinicio

// Referencias a los archivos de sonido
const sonidoDisparo = new Audio('sounds/disparo.mp3');
const sonidoGol = new Audio('sounds/gol.mp3');
const sonidoFallo = new Audio('sounds/fallo.mp3');

// --- Estructura y Lógica de Niveles ---
const niveles = [
    // Nivel 1: Introducción
    {
        nombre: "Entrenamiento Básico",
        tirosTotales: 5,
        velocidadBarra: 2.5,
        zonaOptimaWidth: 25,
        consumoOptimo: 10,
        consumoAlto: 30
    },
    // Nivel 2: Desafío de Velocidad
    {
        nombre: "Velocidad y Precisión",
        tirosTotales: 5,
        velocidadBarra: 4,
        zonaOptimaWidth: 20,
        consumoOptimo: 10,
        consumoAlto: 30
    },
    // Nivel 3: Consumo Crítico
    {
        nombre: "Gestión de Consumo",
        tirosTotales: 7,
        velocidadBarra: 3.5,
        zonaOptimaWidth: 20,
        consumoOptimo: 15,
        consumoAlto: 40
    },
    // Nivel 4: Torneo Avanzado
    {
        nombre: "Torneo de Maestros",
        tirosTotales: 10,
        velocidadBarra: 4.5,
        zonaOptimaWidth: 15,
        consumoOptimo: 10,
        consumoAlto: 30
    },
    // Nivel 5: La Final Global
    {
        nombre: "La Final Global",
        tirosTotales: 5,
        velocidadBarra: 5,
        zonaOptimaWidth: 10,
        consumoOptimo: 20,
        consumoAlto: 50
    }
];

let nivelActual = 0;
let tirosRestantes;
let golesNivel;

// --- Funciones del Juego ---

// Evento para el botón de chutar
shootButton.addEventListener('mousedown', startShot);
function startShot() {
    if (!isShooting && tirosRestantes > 0 && !messageActive) {
        isShooting = true;
        power = 0;
        powerBar.style.width = '0%';
        shootButton.textContent = '¡Chutando!';
        requestAnimationFrame(updatePowerBar);
    }
}

// Evento para soltar el botón
shootButton.addEventListener('mouseup', endShot);
function endShot() {
    if (isShooting) {
        isShooting = false;
        shootButton.textContent = '¡Chutar!';
        
        sonidoDisparo.play();
        
        let consumo = 0;
        const nivel = niveles[nivelActual];

        // Lógica de puntería y consumo basada en el nivel actual
        const zonaOptimaStart = 40;
        const zonaOptimaEnd = zonaOptimaStart + nivel.zonaOptimaWidth;
        
        if (power >= zonaOptimaStart && power <= zonaOptimaEnd) {
            consumo = nivel.consumoOptimo;
            isGoal = true;
        } else {
            consumo = nivel.consumoAlto;
            isGoal = Math.random() < 0.3;
        }

        isShotActive = true;
        shotProgress = 0;
        
        setTimeout(() => {
            if (isGoal) {
                goles++;
                golesNivel++;
                golesMarcadosEl.textContent = goles;
                goalEffectActive = true;
                setTimeout(() => { goalEffectActive = false; }, 1000);
                showGameMessage("¡GOLAZO!", "#00FF00");
                sonidoGol.play();
            } else {
                showGameMessage("¡FALLASTE!", "#FF0000");
                sonidoFallo.play();
            }
            
            consumoTotal += consumo;
            const eficiencia = (consumoTotal > 0) ? (goles / (consumoTotal / 100)) : 0; 
            consumoTotalEl.textContent = consumoTotal;
            eficienciaEl.textContent = eficiencia.toFixed(2);
            
            tirosRestantes--;
            checkLevelCompletion();

            isShotActive = false;
            isGoal = false;
            power = 0;
        }, shotDuration * 1000);
    }
}

// Bucle de animación de la barra de potencia
function updatePowerBar() {
    if (isShooting) {
        power += niveles[nivelActual].velocidadBarra;
        if (power > 100) {
            power = 100;
        }
        powerBar.style.width = power + '%';
        requestAnimationFrame(updatePowerBar);
    }
}

// --- Lógica del Canvas ---

function showGameMessage(text, color) {
    messageText = text;
    messageColor = color;
    messageActive = true;
    messageAlpha = 1.0; 
    
    if (restartButton) {
        restartButton.remove();
        restartButton = null;
    }

    setTimeout(() => {
        let fadeInterval = setInterval(() => {
            messageAlpha -= 0.05;
            if (messageAlpha <= 0) {
                clearInterval(fadeInterval);
                messageActive = false;
            }
        }, 50);
    }, messageDuration - 500);
}

function drawPlayer() {
    ctx.fillStyle = '#f66'; 
    ctx.fillRect(canvas.width / 2 - 20, canvas.height - 100, 40, 40);
    ctx.fillStyle = '#ffdbac';
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height - 120, 15, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#f66';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2 - 15, canvas.height - 60);
    ctx.lineTo(canvas.width / 2 - 30, canvas.height - 30);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2 + 15, canvas.height - 60);
    ctx.lineTo(canvas.width / 2 + 30, canvas.height - 30);
    ctx.stroke();
}

function drawGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#2e8b57';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#fff';
    ctx.fillRect(canvas.width / 2 - 50, 50, 100, 20);
    ctx.fillRect(canvas.width / 2 - 50, 70, 10, 50);
    ctx.fillRect(canvas.width / 2 + 40, 70, 10, 50);

    if (goalEffectActive) {
        ctx.fillStyle = 'rgba(0, 255, 0, 0.5)';
        ctx.fillRect(canvas.width / 2 - 55, 45, 110, 80);
    }
    
    drawPlayer();

    if (isShotActive) {
        const initialPos = { x: canvas.width / 2, y: canvas.height - 50 };
        const finalPos = { x: canvas.width / 2, y: 70 };
        shotProgress += (1 / 60) / shotDuration;
        if (shotProgress > 1) {
            shotProgress = 1;
        }
        const currentPos = {
            x: initialPos.x + (finalPos.x - initialPos.x) * shotProgress,
            y: initialPos.y + (finalPos.y - initialPos.y) * shotProgress
        };
        ctx.beginPath();
        ctx.arc(currentPos.x, currentPos.y, 15, 0, Math.PI * 2);
        ctx.fillStyle = '#fff';
        ctx.fill();
        ctx.strokeStyle = '#000';
        ctx.stroke();
    } else {
        ctx.beginPath();
        ctx.arc(canvas.width / 2, canvas.height - 50, 15, 0, Math.PI * 2);
        ctx.fillStyle = '#fff';
        ctx.fill();
        ctx.strokeStyle = '#000';
        ctx.stroke();
    }

    if (messageActive) {
        ctx.save();
        ctx.globalAlpha = messageAlpha;
        ctx.fillStyle = messageColor;
        ctx.font = 'bold 60px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
        ctx.shadowOffsetX = 3;
        ctx.shadowOffsetY = 3;
        ctx.shadowBlur = 5;
        ctx.fillText(messageText, canvas.width / 2, canvas.height / 2);
        ctx.restore();
    }
    requestAnimationFrame(drawGame);
}

// --- Lógica de Control de Niveles ---
function checkLevelCompletion() {
    if (tirosRestantes <= 0) {
        if (golesNivel >= niveles[nivelActual].tirosTotales * 0.5) {
            showGameMessage("¡NIVEL COMPLETO!", "#00FF00");
            setTimeout(() => {
                nivelActual++;
                if (nivelActual < niveles.length) {
                    iniciarNivel();
                } else {
                    mostrarMensajeFinal();
                }
            }, messageDuration);
        } else {
            showGameMessage("NIVEL FALLIDO", "#FF0000");
            setTimeout(() => {
                iniciarNivel();
            }, messageDuration);
        }
    }
}

function mostrarMensajeFinal() {
    messageText = "¡HAS GANADO EL TORNEO!";
    messageColor = "#00FF00";
    messageActive = true;
    messageAlpha = 1.0;

    restartButton = document.createElement('button');
    restartButton.textContent = "Reiniciar Juego";
    restartButton.className = "restart-button";
    
    document.querySelector('.controls').appendChild(restartButton);

    restartButton.addEventListener('click', reiniciarJuego);
}

function reiniciarJuego() {
    nivelActual = 0;
    goles = 0;
    consumoTotal = 0;
    if (restartButton) {
        restartButton.remove();
        restartButton = null;
    }
    iniciarNivel();
}

function iniciarNivel() {
    const nivel = niveles[nivelActual];
    tirosRestantes = nivel.tirosTotales;
    golesNivel = 0;
    
    golesMarcadosEl.textContent = goles;
    consumoTotalEl.textContent = consumoTotal;
    eficienciaEl.textContent = '0.00';
    document.querySelector('h1').textContent = `Nivel ${nivelActual + 1}: ${nivel.nombre}`;

    document.getElementById('optimumZone').style.width = nivel.zonaOptimaWidth + '%';
    document.getElementById('optimumZone').style.left = 40 + '%';
    
    console.log(`Iniciando Nivel ${nivelActual + 1}: ${nivel.nombre}`);
}

// Iniciar el juego en el primer nivel
iniciarNivel();
requestAnimationFrame(drawGame);