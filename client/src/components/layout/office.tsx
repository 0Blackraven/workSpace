import Phaser from 'phaser';

export class OfficeLayout {
  roomWidth = 1280;
  roomHeight = 960;
  staticObjects!: Phaser.Physics.Arcade.StaticGroup;
  scene: Phaser.Scene

  constructor(scene: Phaser.Scene) {
    this.scene = scene
  }

  preload() {
    const assets = [
      '0-Tileset', 'Big-Filing-Cabinet', 'Big-Office-Printer', 'Big-Plant', 
      'Big-Round-Table', 'Big-Sofa', 'Big-Sofa-2', 'Bin', 'Board', 'Books', 
      'Bookshelf', 'Boss-Chair', 'Boss-Desk', 'Chair', 'Chair-2', 
      'Coffee-Machine', 'Desk', 'Desk-2', 'Filing-Cabinet-Open', 
      'Filing-Cabinet-Small', 'Filing-Cabinet-Tall', 'Folders', 'Folders-2', 
      'Mirror', 'Papers', 'Printer', 'Printer-Furniture', 'Small-Plant', 
      'Small-Sofa', 'Small-Table', 'Tall-Bookshelf', 'Toilet-Closed', 
      'Toilet-Open', 'Vending-Machine', 'WC-Paper', 'WC-Sink', 'Wall-Clock', 
      'Wall-Graph', 'Wall-Note', 'Wall-Note-2', 'Wall-Shelf', 
      'Water-Dispenser', 'Wide-Filing-Cabinet'
    ];
    
    this.scene.load.image('Tileset', '/office/0-Tileset.png');
    assets.forEach(asset => {
        if (asset !== '0-Tileset') {
            this.scene.load.image(asset, `/office/${asset}.png`);
        }
    });

    // Generate Floor (Wooden planks) for fallback / custom layout
    const floorGraphics = this.scene.add.graphics();
    floorGraphics.fillStyle(0xDEB887, 1);
    floorGraphics.fillRect(0, 0, 64, 64);
    floorGraphics.lineStyle(2, 0xCDBA96, 1);
    floorGraphics.strokeRect(0, 0, 64, 64);
    floorGraphics.lineStyle(1, 0x8B7355, 0.5);
    floorGraphics.beginPath();
    floorGraphics.moveTo(0, 32);
    floorGraphics.lineTo(64, 32);
    floorGraphics.moveTo(32, 0);
    floorGraphics.lineTo(32, 32);
    floorGraphics.moveTo(16, 32);
    floorGraphics.lineTo(16, 64);
    floorGraphics.strokePath();
    floorGraphics.generateTexture('floor', 64, 64);
    floorGraphics.destroy();

    // Generate Wall for fallback
    const wallGraphics = this.scene.add.graphics();
    wallGraphics.fillStyle(0x7f8c8d, 1);
    wallGraphics.fillRect(0, 0, 64, 64);
    wallGraphics.lineStyle(2, 0x95a5a6, 1);
    wallGraphics.strokeRect(0, 0, 64, 64);
    wallGraphics.generateTexture('wall', 64, 64);
    wallGraphics.destroy();
  }

  create() {
    this.scene.add.tileSprite(this.roomWidth/2, this.roomHeight/2, this.roomWidth, this.roomHeight, 'floor');
    
    this.staticObjects = this.scene.physics.add.staticGroup();

    // Draw Walls
    for(let x=0; x<this.roomWidth; x+=64) {
       this.staticObjects.create(x+32, 32, 'wall'); // Top
       this.staticObjects.create(x+32, this.roomHeight-32, 'wall'); // Bottom
    }
    for(let y=64; y<this.roomHeight-64; y+=64) {
       this.staticObjects.create(32, y+32, 'wall'); // Left
       this.staticObjects.create(this.roomWidth-32, y+32, 'wall'); // Right
    }

    // Add desks
    const desks = [
      { x: 300, y: 200, type: 'Desk' }, { x: 300, y: 400, type: 'Desk-2' }, { x: 300, y: 600, type: 'Boss-Desk' },
      { x: 800, y: 200, type: 'Desk' }, { x: 800, y: 400, type: 'Desk-2' }, { x: 800, y: 600, type: 'Desk' },
      { x: 550, y: 800, type: 'Desk-2' },
    ];
    desks.forEach(pos => {
      const obj = this.staticObjects.create(pos.x, pos.y, pos.type);
      obj.setScale(2).refreshBody();
    });

    // Add chairs
    const chairs = [
      { x: 300, y: 250, type: 'Chair' }, { x: 300, y: 450, type: 'Chair-2' }, { x: 300, y: 650, type: 'Boss-Chair' },
      { x: 800, y: 250, type: 'Chair' }, { x: 800, y: 450, type: 'Chair-2' }, { x: 800, y: 650, type: 'Chair' },
      { x: 550, y: 850, type: 'Chair-2' },
    ];
    chairs.forEach(pos => {
      const obj = this.staticObjects.create(pos.x, pos.y, pos.type);
      obj.setScale(2).refreshBody();
    });

    // Add plants
    const plants = [
      { x: 100, y: 100, type: 'Big-Plant' }, { x: this.roomWidth - 100, y: 100, type: 'Small-Plant' },
      { x: 100, y: this.roomHeight - 100, type: 'Small-Plant' }, { x: this.roomWidth - 100, y: this.roomHeight - 100, type: 'Big-Plant' },
      { x: this.roomWidth / 2, y: 100, type: 'Small-Plant' }
    ];
    plants.forEach(pos => {
      const p = this.staticObjects.create(pos.x, pos.y, pos.type);
      p.setScale(2).refreshBody();
    });
    
    // Add other furniture
    const items = [
       { x: 150, y: 100, type: 'Big-Filing-Cabinet' },
       { x: 200, y: 100, type: 'Filing-Cabinet-Open' },
       { x: 250, y: 100, type: 'Water-Dispenser' },
       { x: this.roomWidth - 150, y: 150, type: 'Big-Round-Table' },
       { x: this.roomWidth - 150, y: 220, type: 'Big-Sofa' },
       { x: this.roomWidth - 150, y: 300, type: 'Big-Sofa-2' },
       { x: 150, y: this.roomHeight - 150, type: 'Coffee-Machine' },
       { x: 200, y: this.roomHeight - 150, type: 'Vending-Machine' },
       { x: 250, y: this.roomHeight - 150, type: 'Bin' },
       { x: 350, y: 100, type: 'Tall-Bookshelf' },
       { x: 450, y: 100, type: 'Bookshelf' },
       { x: 550, y: 100, type: 'Big-Office-Printer' },
    ];
    items.forEach(pos => {
       const obj = this.staticObjects.create(pos.x, pos.y, pos.type);
       obj.setScale(2).refreshBody();
    });
  }
}
