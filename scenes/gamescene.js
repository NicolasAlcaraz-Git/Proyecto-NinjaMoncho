export default class Game extends Phaser.Scene {
    constructor() {
      super("game");
    }
  
    preload() {
      this.load.image("fondo", "./public/assets/Cielo.webp");
      this.load.image("plataforma", "./public/assets/Plataforma.png");
      this.load.image("personaje", "./public/assets/Ninja.png");
      this.load.image("diamante", "./public/assets/figuras/Diamante.png");
      this.load.image("cuadrado", "./public/assets/figuras/Cuadrado.png");
      this.load.image("triangulo", "./public/assets/figuras/Triangulo.png");
    }
  
    create() {
        this.fondo = this.add.image(400, 300, "fondo");
        this.fondo.setDisplaySize(800, 600);
        this.physics.world.setBounds(0, 0, 800, 600);

  // plataforma
  this.platforms = this.physics.add.staticGroup();
  const plataforma = this.platforms
    .create(400, 568, "plataforma")
    .setScale(2)
    .refreshBody();

  // personaje
  this.player = this.physics.add.sprite(400, 500, "personaje");
  this.player.displayWidth = 80;
  this.player.displayHeight = 80;
  this.player.setBounce(0.7); // Rebote en todas las colisiones
  this.player.setCollideWorldBounds(true); // Colisiones con los bordes del mundo
  this.player.body.onWorldBounds = true; // Habilita el rebote en los bordes del mundo

  // Botones de movimiento
  this.cursors = this.input.keyboard.createCursorKeys();

  // 🧱 Colisiones
  this.physics.add.collider(this.player, this.platforms);

  // 🔜 Grupo para figuras geométricas (aún sin usar)
  this.figuras = this.physics.add.group();
}
  
    update() {
  // 🎮 Movimiento del personaje
  if (this.cursors.left.isDown) {
    this.player.setVelocityX(-250);
    this.player.angle -= 5; // Gira hacia la izquierda
  } else if (this.cursors.right.isDown) {
    this.player.setVelocityX(250);
    this.player.angle += 5; // Gira hacia la derecha
  } else {
    this.player.setVelocityX(0);
  }

  // ⬆️ Salto
  if (this.cursors.up.isDown && this.player.body.touching.down) {
    this.player.setVelocityY(-350);
  }
}
}
