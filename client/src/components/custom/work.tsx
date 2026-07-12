import Phaser from 'phaser';
import { Player } from '../layout/player';
import { OfficeLayout } from '../layout/office';
import { useState, useEffect, useRef } from 'react';

const WorkElement = () => {
  const gameRef = useRef<HTMLDivElement>(null);
  const phaserGameRef = useRef<Phaser.Game | null>(null);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (!gameRef.current) return;

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      parent: gameRef.current,
      pixelArt: true,
      scale: {
        mode: Phaser.Scale.RESIZE,
        width: '100%',
        height: '100%',
      },
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { x: 0, y: 0 },
          debug: false
        }
      },
      scene: [MainScene]
    };

    const game = new Phaser.Game(config);
    phaserGameRef.current = game;

    return () => {
      game.destroy(true);
      phaserGameRef.current = null;
    };
  }, []);

  return (
    <div 
      className="w-full h-full m-0 p-0 overflow-hidden bg-gray-900 relative"
      onClick={() => {
        setIsFocused(true);
      }}
      tabIndex={0}
      onBlur={() => setIsFocused(false)}
    >
      {!isFocused && (
        <div className="absolute inset-0 bg-black/60 z-10 flex flex-col items-center justify-center text-white cursor-pointer transition-opacity">
          <h2 className="text-3xl font-bold mb-4 font-mono">Click to Enter Space</h2>
          <p className="text-gray-300 font-mono">Use WASD or Arrow Keys to move</p>
        </div>
      )}
      <div ref={gameRef} className="w-full h-full" />
    </div>
  );
};

export default WorkElement;

class MainScene extends Phaser.Scene {
  player!: Player;
  office!: OfficeLayout;

  constructor() {
    super('MainScene');
  }

  preload() {
    this.player = new Player(this);
    this.office = new OfficeLayout(this);

    this.player.preload();
    this.office.preload();
  }

  create() {
    this.office.create();
    
    this.player.create(this.office.roomWidth / 2, this.office.roomHeight / 2);

    this.physics.world.setBounds(0, 0, this.office.roomWidth, this.office.roomHeight);
    
    this.physics.add.collider(this.player.sprite, this.office.staticObjects);

    this.cameras.main.setBounds(0, 0, this.office.roomWidth, this.office.roomHeight);
    this.cameras.main.startFollow(this.player.sprite, true, 0.09, 0.09);
    this.cameras.main.setZoom(1.5);

    if (this.input.keyboard) {
      this.input.keyboard.on('keydown', (e: KeyboardEvent) => {
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
          e.preventDefault();
        }
      });
    }
  }

  update() {
    this.player.update();
  }
}
