<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="icon" type="image/x-icon" href="images/soslogo.PNG">
    <link href="https://fonts.googleapis.com/css2?family=Covered+By+Your+Grace&display=swap" rel="stylesheet">
    <title>SickorSafe</title>
    <meta name="theme-color" content="#009578">
    <link rel="stylesheet" href="style.css">
    <link rel="manifest" href="manifest.json">
    <link rel="apple-touch-icon" href="images/soslogo.PNG">
</head>
<body>
    <canvas id="canvas1"></canvas>
    <img id="playerImage" src="images/player - Kopie.png">
    <img id="backgroundImage" src="images/background.png">
    <img id="enemyImage" src="images/obstacle.png">
    <img id="scoreboard" src="images/scoreboard.png">

    <button id="fullScreenButton">Toggle fullscreen</button> 
    
    <button id="forward"> > </button>
    <button id="backward"> < </button>
    <button id="playChoice">Select</button>
    <button id="startButton">Start</button>
    <button id="homeButton">Home</button>
    <!--<button id="pauseButton">Pause</button>-->

    <!-- Bana Playfield Button 
    <form action="https://www.paypal.com/cgi-bin/webscr" method="post" target="_top">
        <input type="hidden" name="cmd" value="_s-xclick">
        <input type="hidden" name="hosted_button_id" value="U3Q2JQR335QS8">
        <input type="image" src="https://www.paypalobjects.com/en_US/i/btn/btn_buynow_SM.gif" border="0" name="submit" alt="PayPal - The safer, easier way to pay online!">
        <img alt="" border="0" src="https://www.paypalobjects.com/en_US/i/scr/pixel.gif" width="1" height="1">
    </form>
    -->

    <div id="donation">Wanna support SOS ? <a href="https://www.paypal.com/donate/?hosted_button_id=36LDCEBCSNQZQ"><button id="donateButton">Donate</button></a></div>

    <div id="policy">Privacy terms: <a href="privacy_policy.html">Privacy Policy</a></div>
    <script src="script.js"></script>
    <script src="src/index.js"></script>
</body>
</html>