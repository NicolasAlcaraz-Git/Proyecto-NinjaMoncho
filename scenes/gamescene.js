export default class Game extends Phaser.Scene {
  constructor() {
    super("game");
    this.countdown = 30;
  }

  generarFigura() {
    const bolsa = [
      "cuadrado", "cuadrado", "cuadrado", "cuadrado",
      "triangulo", "triangulo", "triangulo",
      "diamante", "diamante",
      "bomba"
    ];

    const tipo = Phaser.Utils.Array.GetRandom(bolsa);
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
      case "triangulo":
        figura.setDisplaySize(40, 40);
        figura.setBounce(0.5);
        figura.valor = 15;
        break;
      case "cuadrado":
        figura.setDisplaySize(40, 40);
        figura.setBounce(0.4);
        figura.valor = 10;
        break;
      case "bomba":
        figura.setDisplaySize(65, 60);
        figura.setBounce(0.4);
        figura.valor = -15;
        break;
    }

    figura.setVelocityX(Phaser.Math.Between(-100, 100));
    figura.setDragX(1000);
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
      this.triggerGameOver(false); // Derrota
      return;
    }

    this.scoreText.setText(`Score: ${this.score}`);
    figura.disableBody(true, true);

    if (this.score >= 100) {
      this.triggerGameOver(true); // Victoria
    }
  }

  triggerGameOver(gano = false) {
    if (this.gameOver) return;
    this.gameOver = true;

    this.physics.pause();
    this.player.setTint(0xff0000);

    if (this.timerEvent) this.timerEvent.remove();
    if (this.eventoGenerador) this.eventoGenerador.remove();

    // Fondo
    this.add.image(this.cameras.main.centerX, this.cameras.main.centerY, "resultado").setDisplaySize(800, 600);

    // Texto central (imagen)
    const key = gano ? "victoria" : "gameover";
    this.add.image(this.cameras.main.centerX, 200, key).setDisplaySize(350, 100);

    // Puntaje
    this.add.text(this.cameras.main.centerX, 350, `Puntaje final: ${this.score}`, {
      fontSize: "36px",
      color: "#000"
    }).setOrigin(0.5);

    // Mensaje de reinicio
    this.add.text(this.cameras.main.centerX, 450, "Presiona R para reiniciar", {
      fontSize: "28px",
      color: "#000"
    }).setOrigin(0.5);
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
    this.load.image("victoria", "./public/Victoria.png");
    this.load.image("resultado", "./public/Resultado.jpg"); // <- corregido a .jpg
    this.load.image("bomba", "./public/Bomba.png");
  }

  create() {
    this.add.image(this.cameras.main.centerX, this.cameras.main.centerY, "fondo").setDisplaySize(800, 600);
    this.physics.world.setBounds(0, 0, 800, 600);

    this.platforms = this.physics.add.staticGroup();
    this.platforms.create(this.cameras.main.centerX, 568, "plataforma").setScale(2).refreshBody();

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
    this.score = 0;
    this.gameOver = false;

    this.scoreText = this.add.text(16, 16, `Score: ${this.score}`, {
      fontSize: "32px",
      fill: "#000",
    });

    this.timerText = this.add.text(this.cameras.main.width - 16, 16, `Time: ${this.countdown}`, {
      fontSize: '32px',
      fill: '#000'
    }).setOrigin(1, 0);

    this.timerEvent = this.time.addEvent({
      delay: 1000,
      callback: () => {
        if (this.gameOver) return;
        this.countdown--;
        this.timerText.setText(`Time: ${this.countdown}`);
        if (this.countdown <= 0) {
          this.triggerGameOver(false); // Tiempo agotado = derrota
        }
      },
      callbackScope: this,
      loop: true
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
      delay: 1000,
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
