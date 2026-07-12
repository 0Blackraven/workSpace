import Phaser from 'phaser';

export class Player {
  sprite!: Phaser.Physics.Arcade.Sprite;
  cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  wasd!: { up: Phaser.Input.Keyboard.Key; down: Phaser.Input.Keyboard.Key; left: Phaser.Input.Keyboard.Key; right: Phaser.Input.Keyboard.Key; };
  speed = 250;
  scene: Phaser.Scene

  constructor(scene: Phaser.Scene) {
    this.scene = scene
  }

  preload() {
    this.scene.load.spritesheet('playerDown', 'https://raw.githubusercontent.com/chriscourses/pokemon-style-game/main/img/playerDown.png', { frameWidth: 48, frameHeight: 68 });
    this.scene.load.spritesheet('playerUp', 'https://raw.githubusercontent.com/chriscourses/pokemon-style-game/main/img/playerUp.png', { frameWidth: 48, frameHeight: 68 });
    this.scene.load.spritesheet('playerLeft', 'https://raw.githubusercontent.com/chriscourses/pokemon-style-game/main/img/playerLeft.png', { frameWidth: 48, frameHeight: 68 });
    this.scene.load.spritesheet('playerRight', 'https://raw.githubusercontent.com/chriscourses/pokemon-style-game/main/img/playerRight.png', { frameWidth: 48, frameHeight: 68 });
  }

  create(x: number, y: number) {
    this.sprite = this.scene.physics.add.sprite(x, y, 'playerDown');
    
    this.sprite.setCollideWorldBounds(true);
    this.sprite.body?.setSize(32, 24);
    this.sprite.body?.setOffset(8, 44);

    this.scene.anims.create({
      key: 'left',
      frames: this.scene.anims.generateFrameNumbers('playerLeft', { start: 0, end: 3 }),
      frameRate: 10,
      repeat: -1
    });

    this.scene.anims.create({
      key: 'right',
      frames: this.scene.anims.generateFrameNumbers('playerRight', { start: 0, end: 3 }),
      frameRate: 10,
      repeat: -1
    });

    this.scene.anims.create({
      key: 'up',
      frames: this.scene.anims.generateFrameNumbers('playerUp', { start: 0, end: 3 }),
      frameRate: 10,
      repeat: -1
    });

    this.scene.anims.create({
      key: 'down',
      frames: this.scene.anims.generateFrameNumbers('playerDown', { start: 0, end: 3 }),
      frameRate: 10,
      repeat: -1
    });

    if (this.scene.input.keyboard) {
      this.cursors = this.scene.input.keyboard.createCursorKeys();
      this.wasd = this.scene.input.keyboard.addKeys({
          up: Phaser.Input.Keyboard.KeyCodes.W,
          down: Phaser.Input.Keyboard.KeyCodes.S,
          left: Phaser.Input.Keyboard.KeyCodes.A,
          right: Phaser.Input.Keyboard.KeyCodes.D
      }) as { up: Phaser.Input.Keyboard.Key; down: Phaser.Input.Keyboard.Key; left: Phaser.Input.Keyboard.Key; right: Phaser.Input.Keyboard.Key; };
    }
  }

  update() {
    if (!this.sprite) return;

    this.sprite.setVelocity(0);

    const isLeft = (this.cursors?.left.isDown || this.wasd?.left.isDown);
    const isRight = (this.cursors?.right.isDown || this.wasd?.right.isDown);
    const isUp = (this.cursors?.up.isDown || this.wasd?.up.isDown);
    const isDown = (this.cursors?.down.isDown || this.wasd?.down.isDown);

    let isMoving = false;

    if (isLeft) {
      this.sprite.setVelocityX(-this.speed);
      this.sprite.anims.play('left', true);
      isMoving = true;
    } else if (isRight) {
      this.sprite.setVelocityX(this.speed);
      this.sprite.anims.play('right', true);
      isMoving = true;
    }

    if (isUp) {
      this.sprite.setVelocityY(-this.speed);
      if (!isLeft && !isRight) this.sprite.anims.play('up', true);
      isMoving = true;
    } else if (isDown) {
      this.sprite.setVelocityY(this.speed);
      if (!isLeft && !isRight) this.sprite.anims.play('down', true);
      isMoving = true;
    }

    if (!isMoving) {
      if (this.sprite.anims.currentAnim?.key === 'left') this.sprite.setTexture('playerLeft', 0);
      if (this.sprite.anims.currentAnim?.key === 'right') this.sprite.setTexture('playerRight', 0);
      if (this.sprite.anims.currentAnim?.key === 'up') this.sprite.setTexture('playerUp', 0);
      if (this.sprite.anims.currentAnim?.key === 'down') this.sprite.setTexture('playerDown', 0);
      this.sprite.anims.stop();
    }
  }
}
