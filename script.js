// load event wait for all assets like spritesheets or images to be fully loaded before executing code in it's anonymous callback function
// the entire code of the game is placed inside this anonymous callback function to seperate scope of our game from a global scope to make sure custom class and variable names don't clash with any other outside code
// anonymous function = function without a name
window.addEventListener('load', function(){
    // executed line by line after all assets are fully loaded
    // variable for the canvas element
    const canvas = document.getElementById('canvas1');
    // ctx = context, instance of built-in canvas2D api that holds all drawing methods and properties needed to animate our game
    const ctx = canvas.getContext('2d');
    // set canvas width to 1300px and canvas height to 720px
    canvas.width = 1400;
    canvas.height = 720;
    let enemies = [];
    let score = 0;
    let gameOver = true;
    const fullScreenButton = document.getElementById('fullScreenButton');

    const startButton = document.getElementById('startButton');
    const pauseButton = document.getElementById('pauseButton');
    const homeButton = document.getElementById('homeButton');
    const body = document.querySelector('body');

    //pauseButton.style.visibility = 'hidden';

    let audio = new Audio();
    audio.src = 'spell.wav';
    audio.volume = 0.2;

    let audio1 = new Audio();
    audio1.src = 'explodemini.wav';
    audio1.volume = 0.2;

    // apply eventlisteners to keyboard events and hold an array of all currently active keys
    class InputHandler{
        constructor(){
            // create this.keys property and set it equal to an empty array to add / remove keys when pressed(to keep track of multiple key presses)
            this.keys = [];
            // to store the initial starting vertical coordinate
            this.touchY = '';
            // for the starting and ending touchpoints to be at least 30px apart from each other to trigger an event
            this.touchTreshold = 30;
            /* Eventlistener testen(with the instance: const input = new InputHandler()) and get event properties(like key property)
            window.addEventListener('keydown', function(e) {
                console.log(e);
            });*/
            // place an eventlistener directly inside of the constructor, so when an instance of the class is created, all eventlisteners will be automatically applied
            // eventlistener if key is pressed(?)
            window.addEventListener('keydown', e => {
                if ((e.key === 'ArrowDown' || 
                     e.key === 'ArrowUp' || 
                     e.key === 'ArrowLeft' || 
                     e.key === 'ArrowRight')  
                    // this.keys.indexOf(e.key) === -1 means element not present in the array(keys)           
                    && this.keys.indexOf(e.key) === -1){
                    // push that key in the array(keys)
                    this.keys.push(e.key);
                } else if (e.key === 'Enter' && gameOver) restartGame();
                //console.log(e.key, this.keys);
            });
            // eventlistener if key is not pressed / released(?)
            window.addEventListener('keyup', e => {
                if (e.key === 'ArrowDown' || 
                    e.key === 'ArrowUp' || 
                    e.key === 'ArrowLeft' || 
                    e.key === 'ArrowRight'){
                    // this.keys.splice(this.keys.indexOr(e.key), 1) means remove 1 element at the index-position from the array(keys)
                    this.keys.splice(this.keys.indexOf(e.key), 1);
                }
                //console.log(e.key, this.keys);
            });
            window.addEventListener('touchstart', e => {
                //console.log(e.changedTouches[0].pageY);
                this.touchY = e.changedTouches[0].pageY;
            })
            window.addEventListener('touchmove', e => {
                const swipeDistance = e.changedTouches[0].pageY - this.touchY;
                if (swipeDistance < -this.touchTreshold && this.keys.indexOf('swipe up') === -1) this.keys.push('swipe up')
                else if (swipeDistance > this.touchTreshold && this.keys.indexOf('swipe down') === -1) {
                    this.keys.push('swipe down');
                    if (gameOver) {
                        if(startButton.style.visibility == 'visible'){
                            restartGame();
                        }
                    }
                }
                //console.log(e.changedTouches[0].pageY);
                //console.log(e);
            })
            window.addEventListener('touchend', e => {
                //console.log(this.keys);
                this.keys.splice(this.keys.indexOf('swipe up'), 1);
                this.keys.splice(this.keys.indexOf('swipe down'), 1);
                //console.log(e.changedTouches[0].pageY);
            })
        }
    }

    // React to the active keys(as they are being pressed), drawing and updating the player
    class Player{
        //gameWidth and gameHeight represent the gameboundaries
        constructor(gameWidth, gameHeight){
            this.gameWidth = gameWidth;
            this.gameHeight = gameHeight;
            this.width = 200;
            this.height = 200;
            this.x = 100;
            this.y = this.gameHeight - this.height;
            // bring image spritesheet into the game
            this.image = document.getElementById('playerImage');
            this.scoreboard = document.getElementById('scoreboard');
            this.frameX = 0;
            // the image spritesheet of the player has 8 horizontal frame
            this.maxFrame = 8;
            this.frameY = 0;
            // fps variable to set frame per second
            this.fps = 20;
            this.frameTimer = 0;
            this.frameInterval = 1000 / this.fps;
            this.speed = 0;
            // set the player's velocity y(vy) property to 0
            this.vy = 0; 
            // set the weight or gravity property
            this.weight = 1;
        }

        // method to restart player to it's initial position
        restart(){
            this.x = 100;
            this.y = this.gameHeight - this.height;
            this.maxFrame = 8;
            this.frameX = 0;
            this.frameY = 0;
        }

        // create a draw method, which expects context as an argument to specify which canvas we want to draw on(in case we want multiple layers / canvas in our game)
        draw(context){
            // code to display collision area
            // collision - shows the rectangle collision area / border of the player
            /*context.strokeStyle = 'white';
            context.strokeRect(this.x, this.y, this.width, this.height);

            // draw circular hit box
            context.beginPath();
            context.arc(this.x + this.width / 2, this.y + this.height / 2, this.width / 2, 0, Math.PI * 2);
            context.stroke();

            context.strokeStyle = 'blue';
            context.beginPath();
            context.arc(this.x, this.y, this.width / 2, 0, Math.PI * 2);
            context.stroke();*/

            // fillStyle to set the background of the context to white for more visibility
            //context.fillStyle = 'white';
            
            //fillRect method draws rectangle representing our player to pass x, y coordinates and width, height of the player
            //context.fillRect(this.x, this.y, this.width, this.height);
            
            //pass the image to the drawImage method, then sx=source x, sy=source y, sw=source width, sh=source height, then pass x and y of 0, 0, and additional width and height arguments
            // context.drawImage(this.image, this.x, this.y) to draw the entire large spritesheet with all the frames
            // context.drawImage(this.image, this.x, this.y, this.width, this.height) to stretch or shrink the image to fill all available area
            // context.drawImage(this.image, sx(this.frameX * this.width), sy(this.frameY * this.height), sw(this.width), sh(this.height), this.x, this.y, this.width, this.height) to define the rectangles we crop out from the spritesheet and draw a single frame and in which destination canvas the cropped out rectangle will be placed
            // sx, sy helps to jump between different rows or columns of the spritesheet
            context.drawImage(this.image, this.frameX * this.width, this.frameY * this.height, this.width, this.height, this.x, this.y, this.width, this.height);
        }

        remove(context){
            context.clearRect(this.x, this.y, this.width, this.height);
        }

        // update coordinate by one after every call on the update method
        update(input, deltaTime, enemies){
            // collision detection
            enemies.forEach(enemy => {
                const dx = (enemy.x + enemy.width / 2 - 20) - (this.x + this.width / 2);
                const dy = (enemy.y + enemy.height / 2) - (this.y + this.height / 2 + 20);
                // calculate the distance with the pythagorus theorem
                const distance = Math.sqrt(dx * dx + dy * dy);//hypothenuse = racine carrée de x^2 + y^2
                if (distance < enemy.width / 3 + this.width / 3){
                    // if we have collision, set gameOver to true
                    gameOver = true;
                } 
            });

            // sprite animation
            if (this.frameTimer > this.frameInterval){
                if (this.frameX >= this.maxFrame) this.frameX = 0;
                else this.frameX++;
                this.frameTimer = 0;
            } else{
                this.frameTimer += deltaTime;
            }
            
            // controls
            if (this.frameX >= this.maxFrame){

            }
            // if ArrowRight is pressed
            if (input.keys.indexOf('ArrowRight') > -1){
                // set player's speed to 5
                this.speed = 5;
            } 
            // If ArrowRight is pressed
            else if(input.keys.indexOf('ArrowLeft') > -1) {
                // set player's speed to -5
                this.speed = -5;
            }
            // If ArrowUp is pressed
            else if((input.keys.indexOf('ArrowUp') > -1 || input.keys.indexOf('swipe up') > -1) && this.onGround()) {
                this.vy -= 32;
            }
            // else set the player's speed to 0
            else{
                this.speed = 0;
            }

            // horizontal movement
            // horizontal boundaries - if horizontal's x-coordinate is less than 0, set it back to 0
            this.x += this.speed;
            if (this.x < 0) this.x = 0;
            // else if player's horizontal coordinate is more than gameWidth minus player's width, set it to gamewidth minus player's width to stop it from going over the right edge of the game
            else if (this.x > this.gameWidth - this.width) this.x = this.gameWidth - this.width

            // vertical movement
            this.y += this.vy;
            // if this.onGround is false(!(this.onGround())) means, it's still in the air
            if (!this.onGround()){
                // gradually increase the weight
                this.vy += this.weight;
                this.maxFrame = 5;
                this.frameY = 1;
            } else{
                this.vy = 0;
                this.maxFrame = 8;
                this.frameY = 0;
            }

            if(this.y > this.gameHeight - this.height) this.y = this.gameHeight - this.height;
        }

        // method which returns true if the player's y-coordinate is more or equal to the gameheight minus player's height to know if player stands on solid ground, otherwise returns false
        onGround(){
            return this.y >= this.gameHeight - this.height;
        }
    }

    // Class to handle endless scrolling background
    class Background{
        constructor(gameWidth, gameHeight){
            this.gameWidth = gameWidth;
            this.gameHeight = gameHeight;
            this.image = document.getElementById('backgroundImage');
            this.x = 0;
            this.y = 0;
            this.width = 2400;
            this.height = 720;
            this.speed = 20;
            this.i = 0;
            this.images = ["background.png", "background_single.png", "bana2.png"];
        }
        playField(bgImage){
            this.image.src = bgImage;
        }
        draw(context){
            context.drawImage(this.image, this.x, this.y, this.width, this.height);
            context.drawImage(this.image, this.x + this.width - this.speed, this.y, this.width, this.height);
        }
        update(){
            // update background's horizontal coordinate with the speed variable 
            this.x -= this.speed;
            if (this.x < 0 - this.width) this.x = 0;
            if(score > 20){
                //background.image.src = "background_single.png";            
            }
        }
        restart(){
            this.x = 0;
            ctx.clearRect(0,0,canvas.width, canvas.height);
            //this.image.src = "bana2.png";
            //this.speed = 20;
        }
    }

    // Class to generate enemies in the game
    class Enemy{
        constructor(gameWidth, gameHeight){
            this.gameWidth = gameWidth;
            this.gameHeight = gameHeight;
            this.width = 160;
            this.height = 119;
            this.image = document.getElementById('enemyImage');
            this.x = this.gameWidth - 100;
            this.y = this.gameHeight - this.height;
            this.frameX = 0;
            this.maxFrame = 5;
            // fps variable to set frame per second
            this.fps = 20;
            this.frameTimer = 0;
            this.frameInterval = 1000 / this.fps;
            this.speed = 30;
            this.markedForDeletion = false;
        }
        draw(context){
            // code to display collision area
            // collision - shows the collision / border area of the enemy
            /*context.strokeStyle = 'white';
            context.strokeRect(this.x, this.y, this.width, this.height);

            // draw circular hit box
            context.beginPath();
            context.arc(this.x + this.width / 2, this.y + this.height / 2, this.width / 2, 0, Math.PI * 2);
            context.stroke();

            context.strokeStyle = 'blue';
            context.beginPath();
            context.arc(this.x, this.y, this.width / 2, 0, Math.PI * 2);
            context.stroke();*/

            context.drawImage(this.image, this.frameX * this.width, 0, this.width, this.height, this.x, this.y, this.width, this.height);            
        }
        update(deltaTime){
            if(this.frameTimer > this.frameInterval){
                if (this.frameX >= this.maxFrame) this.frameX = 0;
                else this.frameX++;
                this.frameTimer = 0;
            } else{
                this.frameTimer += deltaTime;
            }
            this.x -= this.speed;
            if (this.x < 0 - this.width) {
                this.markedForDeletion = true;
                score++;
                if(localStorage.getItem('score') < score){
                    localStorage.setItem('score', score);//Add Item in the localstorage with a key 'score' and value score
                }
                console.log('Your score is: ' + localStorage.getItem('score'));
            }
            
            if(score > 20){
                this.speed = 35;
            }
            if(score > 40){
                this.speed = 30;
            }
            if(score > 70){
                this.speed = 40;
            }
            if(score > 100){
                this.speed = 35;
            }
            if(score > 140){
                this.speed = 40;
            }
            if(score > 180){
                this.speed = 45;
            }
            if(score > 200){
                this.speed = 35;
            }
            if(score > 240){
                this.speed = 40;
            }
            if(score > 280){
                this.speed = 45;
            }
            if(score > 320){
                this.speed = 35;
            }
            if(score > 360){
                this.speed = 50;
            }
            if(score > 380){
                this.speed = 30;
            }
            if(score > 420){
                this.speed = 40;
            }
            if(score > 460){
                this.speed = 45;
            }
            if(score > 500){
                this.speed = 35;
            }
            if(score > 550){
                this.speed = 45;
            }
            if(score > 600){
                this.speed = 35;
            }
            if(score > 650){
                this.speed = 50;
            }
            if(score > 700){
                this.speed = 45;
            }
            if(score > 750){
                this.speed = 40;
            }
            if(score > 800){
                this.speed = 50;
            }
            if(score > 850){
                this.speed = 45;
            }
            if(score > 900){
                this.speed = 40;
            }
            if(score > 950){
                this.speed = 55;
            }
            if(score > 970){
                this.speed = 35;
            }
            if(score > 1000){
                this.speed = 40;
            }
            if(score > 1050){
                this.speed = 45;
            }
            if(score > 2000){
                this.speed = 50;
            }
            if(score > 2050){
                this.speed = 40;
            }
            if(score > 2500){
                this.speed = 55;
            }
            if(score > 2550){
                this.speed = 35;
            }
            if(score > 3000){
                this.speed = 40;
            }
        }
    }
    
    // function to add, animate, remove enemies from the game
    function handleEnemies(deltaTime){
        if (enemyTimer > enemyInterval + randomEnemyInterval){
            // push instance of Enemy class in enemies array, and pass canvas' width and height from it's constructor
            enemies.push(new Enemy(canvas.width, (Math.random() * canvas.height) + 50))
            //console.log(enemies);
            // random number between 500 and 1500 milisecond
            randomEnemyInterval = Math.random() * 1000 + 500;
            enemyTimer = 0;
        } else{
            enemyTimer += deltaTime;
        }
        enemies.forEach(enemy => {
            enemy.draw(ctx);
            enemy.update(deltaTime);
        })
        enemies = enemies.filter(enemy => !enemy.markedForDeletion);
    }

    // function to display score or gameover message
    function displayStatusText(context){
        context.textAlign = 'left';
        context.font = '20px 40px Covered By Your Grace';
        context.fillStyle = 'black';
        context.fillText('Score: ' + score, 20, 50);
        context.fillStyle = 'white';
        context.fillText('Score: ' + score, 22, 52);
        // If gameOver is true
        if(gameOver){
            //context.clearRect(0, 0, canvas.width, canvas.height);
            context.textAlign = 'center';
            context.fillStyle = 'black';
            context.fillText('YOU GOT CORONA, press Enter or swipe down to restart!', canvas.width / 2, 200);
            context.fillStyle = 'white';
            context.fillText('YOU GOT CORONA, press Enter or swipe down to restart!', canvas.width / 2 + 2, 202);
            startButton.style.visibility = 'visible';
            homeButton.style.visibility = 'visible';
            
            context.drawImage(player.scoreboard, canvas.width - 350, canvas.height - 500);
            if(localStorage.getItem('score') >= 1000){
                context.fillStyle = '#340000';
                context.fillRect(canvas.width - 250, canvas.height - 420, 150, 50);
                context.fillStyle = 'white';
                context.fillText("Me: "+ localStorage.getItem('score'), canvas.width - 170, canvas.height - 380);
                context.fillStyle = 'white';
                context.fillText("1000", canvas.width - 190, canvas.height - 330);
                context.fillText("500", canvas.width - 190, canvas.height - 280);
                context.fillText("250", canvas.width - 190, canvas.height - 230);
                context.fillText("175", canvas.width - 190, canvas.height - 180);
            }
            if(localStorage.getItem('score') >= 500 && localStorage.getItem('score') < 1000){
                context.fillStyle = '#340000';
                context.fillRect(canvas.width - 250, canvas.height - 370, 150, 50);
                context.fillStyle = 'white';
                context.fillText("1000", canvas.width - 190, canvas.height - 380);
                context.fillText("Me: " + localStorage.getItem('score'), canvas.width - 190, canvas.height - 330);
                context.fillText("500", canvas.width - 190, canvas.height - 280);
                context.fillText("250", canvas.width - 190, canvas.height - 230);
                context.fillText("175", canvas.width - 190, canvas.height - 180);
            }
            if(localStorage.getItem('score') >= 250 && localStorage.getItem('score') < 500){
                context.fillStyle = '#340000';
                context.fillRect(canvas.width - 250, canvas.height - 320, 150, 50);
                context.fillStyle = 'white';
                context.fillText("1000", canvas.width - 190, canvas.height - 380);
                context.fillText("500", canvas.width - 190, canvas.height - 330);
                context.fillText("Me: " + localStorage.getItem('score'), canvas.width - 190, canvas.height - 280);
                context.fillText("250", canvas.width - 190, canvas.height - 230);
                context.fillText("175", canvas.width - 190, canvas.height - 180);
            }
            if(localStorage.getItem('score') >= 175 && localStorage.getItem('score') < 250){
                context.fillStyle = '#340000';
                context.fillRect(canvas.width - 250, canvas.height - 270, 150, 50);
                context.fillStyle = 'white';
                context.fillText("1000", canvas.width - 190, canvas.height - 380);
                context.fillText("500", canvas.width - 190, canvas.height - 330);
                context.fillText("250", canvas.width - 190, canvas.height - 280);
                context.fillText("Me: " + localStorage.getItem('score'), canvas.width - 190, canvas.height - 230);
                context.fillText("175", canvas.width - 190, canvas.height - 180);
            }
            if(localStorage.getItem('score') >= 100 && localStorage.getItem('score') < 175){
                context.fillStyle = '#340000';
                context.fillRect(canvas.width - 250, canvas.height - 220, 150, 50);
                context.fillStyle = 'white';
                context.fillText("1000", canvas.width - 190, canvas.height - 380);
                context.fillText("500", canvas.width - 190, canvas.height - 330);
                context.fillText("250", canvas.width - 190, canvas.height - 280);
                context.fillText("175", canvas.width - 190, canvas.height - 230);
                context.fillText("Me: " + localStorage.getItem('score'), canvas.width - 190, canvas.height - 180);
            } 
            if(localStorage.getItem('score') >= 0 && localStorage.getItem('score') < 100) {
                context.fillText("1000", canvas.width - 190, canvas.height - 380);
                context.fillText("500", canvas.width - 190, canvas.height - 330);
                context.fillText("250", canvas.width - 190, canvas.height - 280);
                context.fillText("175", canvas.width - 190, canvas.height - 230);
                context.fillText("100", canvas.width - 190, canvas.height - 180);
            }
            //context.fillStyle = 'orange';
            //context.fillRect(canvas.width - 600, canvas.height - 400, 150, 100);
            context.fillStyle = 'black';
            context.fillText("Your score: " + score, canvas.width / 4, 100);
            context.fillStyle = 'white';
            context.fillText("Your score: " + score, canvas.width / 4 + 2, 102);
            console.log(score);
        }
    }

    // function to restart the game
    function restartGame(){
        //restart the player to it's initial position
        player.restart();
        //restart background to it's initial position
        background.restart();
        //audio loop when game is running
        if (typeof audio.loop == 'boolean')
        {
            audio.loop = true;
        }
        else
        {
            audio.addEventListener('ended', function() {
                this.currentTime = 0;
                this.play();
            }, false);
        }
        audio.play();
        enemies = [];
        score = 0;
        gameOver = false;
        animate(0);
    }

    function toggleFullScreen(){
        console.log(document.fullscreenElement);
        if (!document.fullscreenElement) {
            //requestFullscreen is an asynchronous method which returns a promise
            canvas.requestFullscreen().catch(err => {
                alert(`Error, can't enable full-screen mode: ${err.message}`);
            });
        } else {
            document.exitFullscreen();
        }
    }
    
    // Fullscreen event removed
    // fullScreenButton.addEventListener('click', toggleFullScreen); 

    // create an instance of InputHandler-class
    const input = new InputHandler();
    const player = new Player(canvas.width, canvas.height);
    const background = new Background(canvas.width, canvas.height);

    let lastTime = 0;
    let enemyTimer = 0;
    let enemyInterval = 1000;
    // random number between 500 and 1500 milisecond
    let randomEnemyInterval = Math.random() * 1000 + 500;

    background.draw(ctx);
    ctx.font = '60px Covered By Your Grace';
    ctx.textAlign = 'center';
    ctx.fillStyle = 'black';
    ctx.fillText('Welcome to SickorSafe Game!', canvas.width / 2, 200);
    ctx.fillStyle = 'white';
    ctx.fillText('Welcome to SickorSafe Game!', canvas.width / 2 + 2, 202);
    
    let playchoice = document.getElementById("playChoice");
    playchoice.addEventListener('click', function(){
        setTimeout(function(){
            playchoice.style.visibility = 'hidden';
            startButton.style.visibility = 'visible';
            homeButton.style.visibility = 'visible';
            fwd.style.visibility = 'hidden';
            bwd.style.visibility = 'hidden';
    
            ctx.clearRect(0,0,canvas.width, canvas.height);
            //background.playField("background_single.png");
            //background.image.src = "bana2.png";
            background.image.src = background.images[background.i];
            if(background.image.src == background.images[0]){
                body.style.backgroundColor = "rgb(22, 145, 150)";
                body.style.backgroundImage = "url('grafity.jpg')";
                background.image.onload = function(){
                    ctx.clearRect(0,0,canvas.width, canvas.height);
                    background.draw(ctx);
                    player.draw(ctx);
                    ctx.fillStyle = 'black';
                    ctx.fillText('CORONA ATTACK, press Enter or swipe down to start!', canvas.width / 2, 200);
                    ctx.fillStyle = 'white';
                    ctx.fillText('CORONA ATTACK, press Enter or swipe down to start!', canvas.width / 2 + 2, 202);
                }
            }
            else if(background.image.src == background.images[1]){
                body.style.backgroundColor = "darkslategray";
                body.style.backgroundImage = "url('grafity.jpg')";
                background.image.onload = function(){
                    ctx.clearRect(0,0,canvas.width, canvas.height);
                    background.draw(ctx);
                    player.draw(ctx);
                    ctx.fillStyle = 'black';
                    ctx.fillText('CORONA ATTACK, press Enter or swipe down to start!', canvas.width / 2, 200);
                    ctx.fillStyle = 'white';
                    ctx.fillText('CORONA ATTACK, press Enter or swipe down to start!', canvas.width / 2 + 2, 202);
                }
            }
            else if(background.image.src == background.images[2]){
                body.style.backgroundImage = "url('grafity.jpg')";
                background.image.onload = function(){
                    ctx.clearRect(0,0,canvas.width, canvas.height);
                    background.draw(ctx);
                    player.draw(ctx);
                    ctx.fillStyle = 'black';
                    ctx.fillText('CORONA ATTACK, press Enter or swipe down to start!', canvas.width / 2, 200);
                    ctx.fillStyle = 'white';
                    ctx.fillText('CORONA ATTACK, press Enter or swipe down to start!', canvas.width / 2 + 2, 202);
                }
            } else{
                body.style.backgroundImage = "url('grafity1.jpg')";
                background.image.onload = function(){
                    ctx.clearRect(0,0,canvas.width, canvas.height);
                    background.draw(ctx);
                    player.draw(ctx);
                    ctx.fillStyle = 'black';
                    ctx.fillText('CORONA ATTACK, press Enter or swipe down to start!', canvas.width / 2, 200);
                    ctx.fillStyle = 'white';
                    ctx.fillText('CORONA ATTACK, press Enter or swipe down to start!', canvas.width / 2 + 2, 202);
                }
            }
        }, 100);              
    })

    let fwd = document.getElementById('forward');
    fwd.addEventListener('click', () => {
        setTimeout(function() {
            playchoice.style.visibility = 'visible';
            startButton.style.visibility = 'hidden';
            homeButton.style.visibility = 'hidden';
            background.image.src = background.images[0];
            body.style.backgroundColor = "rgb(25, 122, 85)";
            body.style.backgroundImage = "url('mainbackground.gif')";
            body.style.backgroundSize = "100% auto";
            // Check If Index Is Under Max
            if(background.i < background.images.length - 1){
                // Add 1 to Index
                background.i++;
            } else {
                // Reset Back To 0 to initialize the image source back to the index of 0
                background.i = 0;
            }
            background.image.onload = function(){
                
                // on button click event, show the image source with the current index of i
                background.image.src = background.images[background.i]
                background.x = 0;
                ctx.clearRect(0,0,canvas.width, canvas.height);
                background.draw(ctx);
                ctx.fillStyle = 'black';
                ctx.fillText('Welcome to SickorSafe Game!', canvas.width / 2, 200);
                ctx.fillStyle = 'white';
                ctx.fillText('Welcome to SickorSafe Game!', canvas.width / 2 + 2, 202);
                player.x = 100;
                player.y = player.gameHeight - player.height;
                player.maxFrame = 8;
                player.frameX = 0;
                player.frameY = 0;
            }
        }, 100);
    })

    let bwd = document.getElementById('backward');
    bwd.addEventListener('click', () => {
        setTimeout(function() {
            playchoice.style.visibility = 'visible';
            startButton.style.visibility = 'hidden';
            homeButton.style.visibility = 'hidden';
            background.image.src = background.images[0];
            body.style.backgroundColor = "rgb(25, 122, 85)";
            body.style.backgroundImage = "url('mainbackground.gif')";
            body.style.backgroundSize = "100% auto";
            // Check If Index Is Over 0
            if(background.i > 0){
                // Remove 1 to Index
                background.i--;
            } else {
                // Reset Back To 0 to initialize the image source back to the index of 2
                background.i = 2;
            }
            background.image.onload = function(){
                
                // on button click event, show the image source with the current index of i
                background.image.src = background.images[background.i]
                background.x = 0;
                ctx.clearRect(0,0,canvas.width, canvas.height);
                background.draw(ctx);
                ctx.fillStyle = 'black';
                ctx.fillText('Welcome to SickorSafe Game!', canvas.width / 2, 200);
                ctx.fillStyle = 'white';
                ctx.fillText('Welcome to SickorSafe Game!', canvas.width / 2 + 2, 202);
                player.x = 100;
                player.y = player.gameHeight - player.height;
                player.maxFrame = 8;
                player.frameX = 0;
                player.frameY = 0;
            }
        }, 100);
    })

    // function for the main animation loop, runs 60times per second, updating and drawing our game over and over
    function animate(timeStamp){
        startButton.style.visibility = 'hidden';
        homeButton.style.visibility = 'hidden';
        // deltaTime = how many miliseconds our computer need to serve one animation frame(60frames per second = 60miliseconds)
        const deltaTime = timeStamp - lastTime;
        lastTime = timeStamp;
        // console.log(deltaTime);
        // delete entire canvas between each animation loop to see only the current animation frame
        ctx.clearRect(0,0,canvas.width, canvas.height);
        // display the background
        background.draw(ctx);
        background.update();
        //display the player thanks to the Player's class draw method, which expects a context as an argument(ctx = canvas.getContext('2d'))
        player.draw(ctx);
        player.update(input, deltaTime, enemies);

        handleEnemies(deltaTime);
        displayStatusText(ctx);
        // to create endless animation loop
        if (!gameOver) requestAnimationFrame(animate)
        else if(gameOver) {
            audio.pause();
            audio.currentTime = 0;
            audio1.play();
        }
    }

    startButton.addEventListener('click', function(){
        if(gameOver == true){
            restartGame();
        }
    })
    
    homeButton.addEventListener('click', function(){
        setTimeout(function(){
            playchoice.style.visibility = 'visible';
            startButton.style.visibility = 'hidden';
            homeButton.style.visibility = 'hidden';
            fwd.style.visibility = 'visible';
            bwd.style.visibility = 'visible';
            background.image.src = background.images[background.i];
            body.style.backgroundColor = "rgb(25, 122, 85)";
            body.style.backgroundImage = "url('mainbackground.gif')";
            body.style.backgroundSize = "100% auto";
            background.image.onload = function(){
                background.x = 0;
                ctx.clearRect(0,0,canvas.width, canvas.height);
                background.draw(ctx);
                ctx.fillStyle = 'black';
                ctx.fillText('Welcome to SickorSafe Game!', canvas.width / 2, 200);
                ctx.fillStyle = 'white';
                ctx.fillText('Welcome to SickorSafe Game!', canvas.width / 2 + 2, 202);
                player.x = 100;
                player.y = player.gameHeight - player.height;
                player.maxFrame = 8;
                player.frameX = 0;
                player.frameY = 0;
            }
        }, 100);        
    })

    /*window.onblur = function(){
        audio.pause();
    }*/
    var window_focus = true;

    window.onblur = function() { 
        window_focus = false; 
        audio.pause(); 
    }
    window.onfocus = function() { 
        window_focus = true;
        //pauseButton.style.visibility = 'visible';
        if(!gameOver){  
            if(audio.paused == true){//--added--
                audio.play();
            }           
        } 
    }
});

// A ajouter
// Changer le background, voire personnages
// Stopper le son, si on sort de l'application / site
// Ajouter un bouton de pause(pour le jeu et le son)

// if (score == 20)
// change background