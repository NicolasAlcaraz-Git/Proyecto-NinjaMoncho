export default class Game extends Phaser.Scene {
  constructor() {
    super("game");
    this.countdown = 30;
  }

  generarFigura() {
    // Probabilidades configurables (más repeticiones = más probabilidad)
    const bolsa = [
      "triangulo", "triangulo", "triangulo",     // 3/20
      "cuadrado", "cuadrado", "cuadrado",     // 3/20
      "diamante", "diamante",               // 2/20
      "bomba"                                 // 1/20 → ajustalo como quieras
    ];

    const tipo = Phaser.Utils.Array.GetRandom(bolsa);

    // Posición aleatoria en eje X
    const x = Phaser.Math.Between(50, this.cameras.main.width - 50);
    const figura = this.figuras.create(x, 0, tipo);

    figura.setCollideWorldBounds(true);
    figura.tipoFigura = tipo;

    switch (tipo) {
      case "diamante":
        figura.setDisplaySize(40, 40);
        figura.setBounce(0.6);
        figura.valor = 20;
        break;
      case "cuadrado":
        figura.setDisplaySize(40, 40);
        figura.setBounce(0.4);
        figura.valor = 10;
        break;
      case "triangulo":
        figura.setDisplaySize(40, 40);
        figura.setBounce(0.5);
        figura.valor = 15;
        break;
      case "bomba":
        figura.setDisplaySize(65, 60);
        figura.setBounce(0.4);
        figura.valor = -10;
        break;
    }

    figura.setVelocityX(Phaser.Math.Between(-100, 100));
    figura.setDragX(1000); // frena después de caer
  }

  perderPuntos(figura) {
  if (figura.tipoFigura !== "bomba" && figura.valor > 0) {
    figura.valor -= 5;
    if (figura.valor <= 0) {
      figura.disableBody(true, true);
    }
   }
  }

  recolectarFigura(player, figura) {
    this.score += figura.valor;

    if (this.score < 0) {
      this.score = 0;
      this.scoreText.setText(`Score: ${this.score}`);
      this.triggerGameOver();
      return;
    }

    figura.disableBody(true, true);
    this.scoreText.setText(`Score: ${this.score}`);
  }

  triggerGameOver() {
    if (this.gameOver) return;
    this.gameOver = true;
    this.add.image(this.cameras.main.centerX, this.cameras.main.centerY, "gameover").setDisplaySize(350, 100);
    this.physics.pause();
    this.player.setTint(0xff0000);
    this.timerEvent.remove();            // Detenemos el temporizador
    this.eventoGenerador.remove();      // Detenemos generación de figuras
  }

  preload() {
    this.load.image("fondo", "./public/Cielo.webp");
    this.load.image("plataforma", "./public/Plataforma.png");
    this.load.image("personaje", "./public/Ninja.png");
    this.load.image("diamante", "./public/Diamante.png");
    this.load.image("cuadrado", "./public/Cuadrado.png");
    this.load.image("triangulo", "./public/Triangulo.png");
    this.load.image("barrera", "./public/Barrera.png");
    this.load.image("gameover", "./public/Gameover.png");
    this.load.image("bomba", "./public/Bomba.png");
  }

  create() {
    // Centrar el fondo
    this.add.image(this.cameras.main.centerX, this.cameras.main.centerY, "fondo").setDisplaySize(800, 600);
    this.physics.world.setBounds(0, 0, 800, 600);

    this.platforms = this.physics.add.staticGroup();
    // Centrar la plataforma
    this.platforms.create(this.cameras.main.centerX, 568, "plataforma").setScale(2).refreshBody();

    // Centrar al jugador
    this.player = this.physics.add.sprite(this.cameras.main.centerX, 500, "personaje");
    this.player.setDisplaySize(70, 70);
    this.player.setBounce(0.7);
    this.player.setCollideWorldBounds(true);

    this.cursors = this.input.keyboard.createCursorKeys();
    this.figuras = this.physics.add.group();

    this.physics.add.collider(this.figuras, this.platforms, (figura) => {
      this.perderPuntos(figura);
      figura.setVelocityX(0);
    }, null, this);

    this.physics.add.collider(this.figuras, this.figuras, this.perderPuntos, null, this);
    this.physics.add.overlap(this.player, this.figuras, this.recolectarFigura, null, this);

    this.countdown = 30;
    // Centrar el texto
    this.timerText = this.add.text(this.cameras.main.centerX + 300, 16, `Time: ${this.countdown}`, {
      fontSize: '32px',
      fill: '#000'
    }).setOrigin(1, 0);

    this.time.addEvent({
      delay: 1000,
      callback: () => {
        if (this.gameOver) return;
        this.countdown--;
        this.timerText.setText(`Time: ${this.countdown}`);
        if (this.countdown <= 0) {
          this.triggerGameOver();
        }
      },
      callbackScope: this,
      loop: true
    });

    this.input.keyboard.on('keydown-R', () => {
      this.scene.restart();
    });

    this.score = 0;
    this.gameOver = false;

    // Centrar el texto de puntuación
    this.scoreText = this.add.text(this.cameras.main.centerX - 300, 16, `Score: ${this.score}`, {
      fontSize: "32px",
      fill: "#000",
    });

    this.input.keyboard.on('keydown-R', () => {
      this.scene.restart();
    });

    this.barrera1 = this.crearBarrera(this.cameras.main.centerX, 380, 150);
    this.barrera2 = this.crearBarrera(this.cameras.main.centerX, 210, -150);

    this.physics.add.collider(this.figuras, this.barrera1, this.perderPuntos, null, this);
    this.physics.add.collider(this.figuras, this.barrera2, this.perderPuntos, null, this);

    this.physics.add.collider(this.player, this.platforms);
    this.physics.add.collider(this.player, this.barrera1);
    this.physics.add.collider(this.player, this.barrera2);

    this.eventoGenerador = this.time.addEvent({
    delay: 1000, // cada 1 segundo
    callback: this.generarFigura,
    callbackScope: this,
    loop: true,
    });
  }

  crearBarrera(x, y, velocidadX) {
    const barrera = this.physics.add.image(x, y, "barrera");
    barrera.setScale(0.2);
    barrera.setImmovable(true);
    barrera.setVelocityX(velocidadX);
    barrera.setCollideWorldBounds(true);
    barrera.setBounce(1, 0);
    barrera.body.allowGravity = false;
    barrera.body.setSize(barrera.width, barrera.height);
    return barrera;
  }

  perderPuntos(figura) {
    if (figura.valor > 0) {
      figura.valor -= 5;
      if (figura.valor <= 0) {
        figura.disableBody(true, true);
      }
    }
  }

  update() {
    if (this.gameOver) return;

    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-350);
      this.player.angle -= 10;
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(350);
      this.player.angle += 10;
    } else {
      this.player.setVelocityX(0);
    }

    if (this.cursors.up.isDown && this.player.body.touching.down) {
      this.player.setVelocityY(-400);
    }
  }
}
