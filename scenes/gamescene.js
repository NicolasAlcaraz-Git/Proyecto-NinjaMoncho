export default class Game extends Phaser.Scene {
  constructor() {
    super("game");
  }

  generarFigura() {
    const tipos = ["diamante", "cuadrado", "triangulo"];
    const tipo = Phaser.Utils.Array.GetRandom(tipos);
    const x = Phaser.Math.Between(50, 750);

    const figura = this.figuras.create(x, 0, tipo);
    figura.setCollideWorldBounds(true);

    // Configuración personalizada por tipo
    switch (tipo) {
      case "diamante":
        figura.setDisplaySize(48, 48);
        figura.setBounce(0.6);
        break;
      case "cuadrado":
        figura.setDisplaySize(50, 50);
        figura.setBounce(0.4);
        break;
      case "triangulo":
        figura.setDisplaySize(52, 52);
        figura.setBounce(0.5);
        break;
    }
  }

  recolectarFigura(player, figura) {
    figura.disableBody(true, true);
  }

  preload() {
    this.load.image("fondo", "./public/Cielo.webp");
    this.load.image("plataforma", "./public/Plataforma.png");
    this.load.image("personaje", "./public/Ninja.png");
    this.load.image("diamante", "./public/Diamante.png");
    this.load.image("cuadrado", "./public/Cuadrado.png");
    this.load.image("triangulo", "./public/Triangulo.png");
    this.load.image("barrera", "./public/Barrera.png");
  }

  create() {
    // Fondo
    this.add.image(400, 300, "fondo").setDisplaySize(800, 600);
    this.physics.world.setBounds(0, 0, 800, 600);

    // Plataforma base
    this.platforms = this.physics.add.staticGroup();
    this.platforms.create(400, 568, "plataforma").setScale(2).refreshBody();

    // Jugador
    this.player = this.physics.add.sprite(400, 500, "personaje");
    this.player.setDisplaySize(80, 80);
    this.player.setBounce(0.7);
    this.player.setCollideWorldBounds(true);

    // Teclado
    this.cursors = this.input.keyboard.createCursorKeys();

    // Grupo de figuras vacío
    this.figuras = this.physics.add.group();

    // Colisiones
    this.physics.add.collider(this.figuras, this.platforms);
    this.physics.add.collider(this.figuras, this.figuras);
    this.physics.add.overlap(this.player, this.figuras, this.recolectarFigura, null, this);

    // Barrera inferior (barrera1)
    this.barrera1 = this.physics.add.image(400, 300, "barrera");
    this.barrera1.setScale(0.3, 0.3);
    this.barrera1.setImmovable(true);
    this.barrera1.setVelocityX(150);
    this.barrera1.setCollideWorldBounds(true);
    this.barrera1.setBounce(1, 0);
    this.barrera1.body.allowGravity = false;

    // Barrera superior (barrera2)
    this.barrera2 = this.physics.add.image(400, 200, "barrera");
    this.barrera2.setScale(0.3, 0.3);
    this.barrera2.setImmovable(true);
    this.barrera2.setVelocityX(-150); // dirección opuesta
    this.barrera2.setCollideWorldBounds(true);
    this.barrera2.setBounce(1, 0);
    this.barrera2.body.allowGravity = false;

    // Colisiones de figuras con barreras
    this.physics.add.collider(this.figuras, this.barrera1);
    this.physics.add.collider(this.figuras, this.barrera2);

    // Jugador con plataforma y barreras
    this.physics.add.collider(this.player, this.platforms);
    this.physics.add.collider(this.player, this.barrera1);
    this.physics.add.collider(this.player, this.barrera2);

    // Timer para generar figuras periódicamente
    this.time.addEvent({
      delay: 1000,
      callback: this.generarFigura,
      callbackScope: this,
      loop: true,
    });
  }

  update() {
    // Movimiento horizontal
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-250);
      this.player.angle -= 5;
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(250);
      this.player.angle += 5;
    } else {
      this.player.setVelocityX(0);
    }

    // Salto
    if (this.cursors.up.isDown && this.player.body.touching.down) {
      this.player.setVelocityY(-350);
    }
  }
}
