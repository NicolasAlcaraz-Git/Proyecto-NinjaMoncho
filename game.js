import GameScene from './scenes/gamescene.js';

export const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 650 },
      debug: false,
    },
  },
  scene: [GameScene],
};
