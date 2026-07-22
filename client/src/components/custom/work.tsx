import Phaser from 'phaser';
import { Player } from '../layout/player';
import { OfficeLayout } from '../layout/office';
import { useState, useEffect, useRef } from 'react';
import { socket } from '@/socket';

const WorkElement = () => {
  const gameRef = useRef<HTMLDivElement>(null);
  const phaserGameRef = useRef<Phaser.Game | null>(null);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (!gameRef.current) return;

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      parent: gameRef.current,
      pixelArt: false,
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
      className="w-full h-full m-0 p-0 overflow-hidden bg-gray-900 relative z-0"
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
  otherPlayers: Map<string, Phaser.Physics.Arcade.Sprite> = new Map();

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

    this.player.sprite.setInteractive({ useHandCursor: true });
    this.player.sprite.on('pointerdown', (pointer: Phaser.Input.Pointer, localX: number, localY: number, event: Phaser.Types.Input.EventData) => {
      event.stopPropagation();
      window.dispatchEvent(new CustomEvent('toggle-bottom-bar', { detail: { show: false } }));
    });

    // Clicking anywhere else on the scene hides the bottomBar
    this.input.on('pointerdown', () => {
      window.dispatchEvent(new CustomEvent('toggle-bottom-bar', { detail: { show: false } }));
    });

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

    socket.on('initial-player-load', (data: { socketId: string, username: string, x: number, y: number, anim: string, isMoving: boolean }) => {
      this.spawnOrUpdatePlayer(data);
    });

    socket.on('other-player-movement', (data: { socketId: string, username: string, x: number, y: number, anim: string, isMoving: boolean }) => {
      this.spawnOrUpdatePlayer(data);
    });

    socket.on('other-player-disconnected', (socketId: string) => {
      const otherPlayer = this.otherPlayers.get(socketId);
      if (otherPlayer) {
        const nameText = otherPlayer.getData('nameText') as Phaser.GameObjects.Text;
        if (nameText) nameText.destroy();
        otherPlayer.destroy();
        this.otherPlayers.delete(socketId);
      }
    });

    this.events.on('shutdown', () => {
      socket.off('initial-player-load');
      socket.off('other-player-movement');
      socket.off('other-player-disconnected');
    });

    socket.emit('send-player-load');
  }

  spawnOrUpdatePlayer(data: { socketId: string, username: string, x: number, y: number, anim: string, isMoving: boolean }) {
    let otherPlayer = this.otherPlayers.get(data.socketId);
    
    if (!otherPlayer) {
      otherPlayer = this.physics.add.sprite(data.x, data.y, 'playerDown');
      otherPlayer.setCollideWorldBounds(true);
      otherPlayer.body?.setSize(32, 24);
      otherPlayer.body?.setOffset(8, 44);
      
      const nameText = this.add.text(0, -20, data.username, { 
        fontSize: '12px', 
        color: '#ffffff',
        backgroundColor: '#00000088'
      }).setOrigin(0.5, 0.5);
      
      otherPlayer.setData('nameText', nameText);
      this.otherPlayers.set(data.socketId, otherPlayer);

      otherPlayer.setInteractive({ useHandCursor: true });
      otherPlayer.on('pointerdown', (pointer: Phaser.Input.Pointer, localX: number, localY: number, event: Phaser.Types.Input.EventData) => {
        event.stopPropagation();
        window.dispatchEvent(new CustomEvent('toggle-bottom-bar', { detail: { show: true } }));
      });
    }

    otherPlayer.setPosition(data.x, data.y);
    
    const nameText = otherPlayer.getData('nameText') as Phaser.GameObjects.Text;
    if (nameText) {
      nameText.setPosition(data.x, data.y - 20);
    }

    if (data.isMoving && data.anim) {
      otherPlayer.anims.play(data.anim, true);
    } else {
      if (data.anim === 'left') otherPlayer.setTexture('playerLeft', 0);
      else if (data.anim === 'right') otherPlayer.setTexture('playerRight', 0);
      else if (data.anim === 'up') otherPlayer.setTexture('playerUp', 0);
      else if (data.anim === 'down') otherPlayer.setTexture('playerDown', 0);
      otherPlayer.anims.stop();
    }
  }

  update() {
    this.player.update();
  }
}
