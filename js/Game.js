class Game {
  constructor() {
    this.playermove=false
    this.leftKeyActive=false
    this.blast=false 
    this.resetTitle = createElement("h2");
    this.resetButton = createButton("");

    this.leadeboardTitle = createElement("h2");

    this.leader1 = createElement("h2");
    this.leader2 = createElement("h2");
  }

  getState() {
    var gameStateRef = database.ref("gameState");
    gameStateRef.on("value", function(data) {
      gameState = data.val();
    });
  }
  update(state) {
    database.ref("/").update({
      gameState: state
    });
  }

  start() {
    player = new Player();
    playerCount = player.getCount();

    form = new Form();
    form.display();

    car1 = createSprite(width / 2 - 50, height - 100);
    car1.addImage("car1", car1_img);
    car1.scale = 0.07;
    car1.addImage("blast",blastImage);

    car2 = createSprite(width / 2 + 100, height - 100);
    car2.addImage("car2", car2_img);
    car2.scale = 0.07;
    car2.addImage("blast",blastImage);

    cars = [car1, car2];
    
    fuels = new Group();
    powerCoins = new Group();
    obstacles= new Group();
    var obstaclesPositions = [
      { x: width / 2 + 250, y: height - 800, image: obstacles2 },
      { x: width / 2 - 150, y: height - 1300, image: obstacles1 },
      { x: width / 2 + 250, y: height - 1800, image: obstacles1 },
      { x: width / 2 - 180, y: height - 2300, image: obstacles2 },
      { x: width / 2, y: height - 2800, image: obstacles2 },
      { x: width / 2 - 180, y: height - 3300, image: obstacles1 },
      { x: width / 2 + 180, y: height - 3300, image: obstacles2 },
      { x: width / 2 + 250, y: height - 3800, image: obstacles2 },
      { x: width / 2 - 150, y: height - 4300, image: obstacles1 },
      { x: width / 2 + 250, y: height - 4800, image: obstacles2 },
      { x: width / 2, y: height - 5300, image: obstacles1 },
      { x: width / 2 - 180, y: height - 5500, image: obstacles2 }
    ];

    // Adicionar sprite de combustível no jogo
    this.addSprites(fuels, 4, fuelImage, 0.02);

    // Adicionar sprite de moeda no jogo
    this.addSprites(powerCoins, 18, powerCoinImage, 0.09);
    this.addSprites(obstacles,obstaclesPositions.lenght,obstacles1,0.04,obstaclesPositions)
  }

  addSprites(spriteGroup, numberOfSprites, spriteImage, scale,positions=[]) {
    for (var i = 0; i < numberOfSprites; i++) {
      var x, y;
     if(positions.lenght>0){
      x=positions[i].x
      y=positions[i].y
      spriteImage=positions[i].image
     }  else{
      x = random(width / 2 + 150, width / 2 - 150);
      y = random(-height * 4.5, height - 400);
     } 
      

      var sprite = createSprite(x, y);
      sprite.addImage("sprite", spriteImage);
      
      sprite.scale = scale;
      spriteGroup.add(sprite);
    }
  }

  handleElements() {
    form.hide();
    form.titleImg.position(40, 50);
    form.titleImg.class("gameTitleAfterEffect");

    //C39
    this.resetTitle.html("Reiniciar o Jogo");
    this.resetTitle.class("resetText");
    this.resetTitle.position(width / 2 + 200, 40);

    this.resetButton.class("resetButton");
    this.resetButton.position(width / 2 + 230, 100);

    this.leadeboardTitle.html("Placar");
    this.leadeboardTitle.class("resetText");
    this.leadeboardTitle.position(width / 3 - 60, 40);

    this.leader1.class("leadersText");
    this.leader1.position(width / 3 - 50, 80);

    this.leader2.class("leadersText");
    this.leader2.position(width / 3 - 50, 130);
  }

  play() {
    this.handleElements();
    this.handleResetButton();
 
    Player.getPlayersInfo();
    player.getCaratend(); 
    if (allPlayers !== undefined) {
      image(track, 0, -height * 5, width, height * 6);

      this.showLeaderboard();
      this.showLife()
      this.showFuelBar() 
      //índice da matriz
      var index = 0;
      for (var plr in allPlayers) {
        //adicione 1 ao índice para cada loop
        index = index + 1;

        //use os dados do banco de dados para exibir os carros nas direções x e y
        var x = allPlayers[plr].positionX;
        var y = height - allPlayers[plr].positionY;

        cars[index - 1].position.x = x;
        cars[index - 1].position.y = y;

        if (index === player.index) {
          stroke(10);
          fill("red");
          ellipse(x, y, 60, 60);
         this.handlePlayerfuel(index)
         this.handlepowercoins(index)
         this.handleObstacleCollision(index) 
         this.handlecollisioncarb(index)
          //alterar a posição da câmera na direção y
          camera.position.y = cars[index - 1].position.y;
          if(player.life<=0) {
            this.playermove=false
            this.blast=true
          }
        }
      }

      //manipulando eventos de teclado
      this.handlePlayerControls();
      const finishline= height*6-100
      if(player.postionY>finishline ){
        gamestate=2
        player.rank=player.rank+1
        Player.Carsupdateend(player.rank)
        player.update()
        this.showrank()

        
      }
      if(!this.playermove) {
        player.positionY=player.positionY+5
        player.update()
    
      }
      drawSprites();
    }
  }

  handleResetButton() {
    this.resetButton.mousePressed(() => {
      database.ref("/").set({
        playerCount: 0,
        gameState: 0,
        players: {},
        Carsatend:0
      });
      window.location.reload();
    });
  }

  showLeaderboard() {
    var leader1, leader2;
    var players = Object.values(allPlayers);
    if (
      (players[0].rank === 0 && players[1].rank === 0) ||
      players[0].rank === 1
    ) {
      // &emsp;    Essa etiqueta é usada para exibir quatro espaços.
      leader1 =
        players[0].rank +
        "&emsp;" +
        players[0].name +
        "&emsp;" +
        players[0].score;

      leader2 =
        players[1].rank +
        "&emsp;" +
        players[1].name +
        "&emsp;" +
        players[1].score;
    }

    if (players[1].rank === 1) {
      leader1 =
        players[1].rank +
        "&emsp;" +
        players[1].name +
        "&emsp;" +
        players[1].score;

      leader2 =
        players[0].rank +
        "&emsp;" +
        players[0].name +
        "&emsp;" +
        players[0].score;
    }

    this.leader1.html(leader1);
    this.leader2.html(leader2);
  }

  handlePlayerControls() {
    if(!this.blast) {
if (keyIsDown(UP_ARROW)) {
      player.positionY += 10;
      this.playermove=true
      player.update();  
    }

    if (keyIsDown(LEFT_ARROW) && player.positionX > width / 3 - 50) {
      this.leftKeyActive=true
      player.positionX -= 5;
      player.update();
    }

    if (keyIsDown(RIGHT_ARROW) && player.positionX < width / 2 + 300) {
      this.leftKeyActive=false
      player.positionX += 5;
      player.update();
    }
    }
    
  }
    handlePlayerfuel(index){
      cars[index-1].overlap(fuels,function(collector,collected){
        player.fuel=185
        collected.remove()
      })
      if(player.fuel>0 &&!this.playermove) {
        player.fuel-=0.3
      }
      if(player.fuel<=0){
        gamestate=2
        this.gameOver()
      }
    }
    handlepowercoins(index){
      cars[index-1].overlap(powerCoins,function(collector,collected){
        player.score=player.score+5
        player.update()
        collected.remove()
      })
    }
    showRank() {
      swal({
        //title: `Incrível!${"\n"}Rank${"\n"}${player.rank}`,
        title: `Incrível!${"\n"}${player.rank}º lugar`,
        text: "Você alcançou a linha de chegada com sucesso!",
        imageUrl:
          "https://raw.githubusercontent.com/vishalgaddam873/p5-multiplayer-car-race-game/master/assets/cup.png",
        imageSize: "100x100",
        confirmButtonText: "Ok"
      });
    }
  
    //barra de vida
    showLife() {
      push();
      image(lifeImage, width / 2 - 130, height - player.positionY - 300, 20, 20);
      fill("white");
      rect(width / 2 - 100, height - player.positionY - 300, 185, 20);
      fill("#C2331D");
      rect(width / 2 - 100, height - player.positionY - 300, player.life, 20);
      noStroke();
      pop();
    }
  
    //barra combustivel
    showFuelBar() {
      push();
      image(fuelImage, width / 2 - 130, height - player.positionY - 350, 20, 20);
      fill("white");
      rect(width / 2 - 100, height - player.positionY - 350, 185, 20);
      fill("#ffc400");
      rect(width / 2 - 100, height - player.positionY - 350, player.fuel, 20);
      noStroke();
      pop();
    }
  
    //final de jogo
    gameOver() {
      swal({
        title: `Fim de Jogo`,
        text: "Oops você perdeu a corrida!",
        imageUrl:
          "https://cdn.shopify.com/s/files/1/1061/1924/products/Thumbs_Down_Sign_Emoji_Icon_ios10_grande.png",
        imageSize: "100x100",
        confirmButtonText: "Obrigado por jogar"
      });
    }
  
    handleObstacleCollision(index) {
      if (cars[index - 1].collide(obstacles)) {
        if (this.leftKeyActive) {
          player.positionX += 100;
        } else {
          player.positionX -= 100;
        }
  
        //Reduzindo a vida do jogador
        if (player.life > 0) {
          player.life -= 185 / 4;
        }
  
        player.update();
      }
    }  
    handlecollisioncarb(index) {
      if(index===1){
        if (cars[index - 1].collide(cars[1])) {
          if (this.leftKeyActive) {
            player.positionX += 100;
          } else {
            player.positionX -= 100;
          }
    
          //Reduzindo a vida do jogador
          if (player.life > 0) {
            player.life -= 185 / 4;
          }
    
          player.update();
        }
      }
      if(index===2){
        if (cars[index - 1].collide(cars[0])) {
          if (this.leftKeyActive) {
            player.positionX += 100;
          } else {
            player.positionX -= 100;
          }
    
          //Reduzindo a vida do jogador
          if (player.life > 0) {
            player.life -= 185 / 4;
          }
    
          player.update();
        }
      }
    }
    end() {console.log("game over")}
}       
  