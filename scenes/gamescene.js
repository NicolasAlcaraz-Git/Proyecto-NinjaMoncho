export default class Game extends Phaser.Scene {
  constructor() {
    super("game");
    this.countdown = 30;
  }

  generarFigura() {
    const tipos = ["diamante", "cuadrado", "triangulo"];
    const tipo = Phaser.Utils.Array.GetRandom(tipos);
    const x = Phaser.Math.Between(50, 750);

    const figura = this.figuras.create(x, 0, tipo);
    figura.setCollideWorldBounds(true);
    figura.tipoFigura = tipo; // <<< Añadimos propiedad personalizada

    switch (tipo) {
      case "diamante":
        figura.setDisplaySize(40, 40);
        figura.setBounce(0.6);
        break;
      case "cuadrado":
        figura.setDisplaySize(40, 40);
        figura.setBounce(0.4);
        break;
      case "triangulo":
        figura.setDisplaySize(40, 40);
        figura.setBounce(0.5);
        break;
    }
  }

  recolectarFigura(player, figura) {
    figura.disableBody(true, true);

    switch (figura.tipoFigura) {
      case "cuadrado":
        this.score += 5;
        break;
      case "triangulo":
        this.score += 10;
        break;
      case "diamante":
        this.score += 15;
        break;
    }

    this.scoreText.setText(`Score: ${this.score}`);
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
  }

  create() {
    this.add.image(400, 300, "fondo").setDisplaySize(800, 600);
    this.physics.world.setBounds(0, 0, 800, 600);

    this.platforms = this.physics.add.staticGroup();
    this.platforms.create(400, 568, "plataforma").setScale(2).refreshBody();

    this.player = this.physics.add.sprite(400, 500, "personaje");
    this.player.setDisplaySize(65, 65);
    this.player.setBounce(0.7);
    this.player.setCollideWorldBounds(true);

    this.cursors = this.input.keyboard.createCursorKeys();

    this.figuras = this.physics.add.group();

    this.physics.add.collider(this.figuras, this.platforms);
    this.physics.add.collider(this.figuras, this.figuras);
    this.physics.add.overlap(this.player, this.figuras, this.recolectarFigura, null, this);

    this.countdown = 30;
    this.timerText = this.add.text(this.cameras.main.width - 20, 16, `Time: ${this.countdown}`, {
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

    this.scoreText = this.add.text(16, 16, `Score: ${this.score}`, {
      fontSize: "32px",
      fill: "#000",
    });

    this.barrera1 = this.physics.add.image(400, 300, "barrera");
    this.barrera1.setScale(0.2, 0.2);
    this.barrera1.setImmovable(true);
    this.barrera1.setVelocityX(150);
    this.barrera1.setCollideWorldBounds(true);
    this.barrera1.setBounce(1, 0);
    this.barrera1.body.allowGravity = false;
    this.barrera1.body.setSize(this.barrera1.width, this.barrera1.height);

    this.barrera2 = this.physics.add.image(400, 200, "barrera");
    this.barrera2.setScale(0.2, 0.2);
    this.barrera2.setImmovable(true);
    this.barrera2.setVelocityX(-150);
    this.barrera2.setCollideWorldBounds(true);
    this.barrera2.setBounce(1, 0);
    this.barrera2.body.allowGravity = false;
    this.barrera2.body.setSize(this.barrera2.width, this.barrera2.height);

    this.barrera3 = this.physics.add.image(400, 100, "barrera");
    this.barrera3.setScale(0.2, 0.2);
    this.barrera3.setImmovable(true);
    this.barrera3.setVelocityX(150);
    this.barrera3.setCollideWorldBounds(true);
    this.barrera3.setBounce(1, 0);
    this.barrera3.body.allowGravity = false;
    this.barrera3.body.setSize(this.barrera3.width, this.barrera3.height);

    this.physics.add.collider(this.figuras, this.barrera1);
    this.physics.add.collider(this.figuras, this.barrera2);
    this.physics.add.collider(this.figuras, this.barrera3);

    this.physics.add.collider(this.player, this.platforms);
    this.physics.add.collider(this.player, this.barrera1);
    this.physics.add.collider(this.player, this.barrera2);
    this.physics.add.collider(this.player, this.barrera3);

    this.time.addEvent({
      delay: 1000,
      callback: this.generarFigura,
      callbackScope: this,
      loop: true,
    });
  }

  update() {
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-250);
      this.player.angle -= 5;
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(250);
      this.player.angle += 5;
    } else {
      this.player.setVelocityX(0);
    }

    if (this.cursors.up.isDown && this.player.body.touching.down) {
      this.player.setVelocityY(-350);
    }
  }
}
