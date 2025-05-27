import phaser from 'phaser';
import MainScene from './mainScene'; 

const config = {
    type: phaser.AUTO,
    width: 800,
    height: 600,
    scale:{
        mode: phaser.Scale.FIT,
        autoCenter: phaser.Scale.CENTER_BOTH,
    },
    scene: [MainScene],
}