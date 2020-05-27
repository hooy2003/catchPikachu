

/*
Images should resolve to the following:
{
  '1': '/1-hash.png',
  '2': '/2-hash.png',
  '3': '/3-hash.png'
}
*/
import images_png from './img/*.png';
import images_jpg from './img/*.jpg';

const pikachu_filename = 'pikachu_lg2'
const gengar_filename = 'gengar'
const ball_filename = 'ball'
const pikachu_png = images_png[`${pikachu_filename}`]
const gengar_png = images_png[`${gengar_filename}`]
const ball_jpg = images_jpg[`${ball_filename}`]


let Application = PIXI.Application,
    Container = PIXI.Container,
    loader = PIXI.loader,
    resources = PIXI.loader.resources,
    Graphics = PIXI.Graphics,
    TextureCache = PIXI.utils.TextureCache,
    Texture = PIXI.Texture,
    Sprite = PIXI.Sprite,
    Text = PIXI.Text,
    TextStyle = PIXI.TextStyle;

let app = new Application({
    backgroundColor: 0x1099bb,
    antialiasing: true,
    transparent: false,
    resolution: 1
});

document.body.querySelector('#vmfive-ad-unit-container-55667788 .wrap').appendChild(app.view);

loader
    .add([
        pikachu_png,
        ball_jpg
    ])
    .load(setup);

let state, Pikachus, Gengar, Ball, message, gameScene, gameOverScene;

function setup() {

    gameScene = new Container();
    app.stage.addChild(gameScene);

    let Pikachu_img = Texture.from(`${pikachu_png}`);
    let gengar_img = Texture.from(`${gengar_png}`);
    let Ball_img = Texture.from(`${ball_jpg}`);

    let numberOfPikachu = 3,
        spacing = 140,
        xOffset = 80,
        speed = 2,
        direction = 1;

    Pikachus = [];
    for (let i = 0; i < numberOfPikachu; i++) {

        let pikachu = new Sprite(Pikachu_img);
        pikachu.anchor.set(0.5);
        pikachu.scale.set(0.3, 0.3);

        let x = spacing * i + xOffset;
        //  todo 150 是固定值看要不要改
        let y = randomInt(-150, -150 + pikachu.height);
        pikachu.x = x;
        pikachu.y = y;

        pikachu.velocityY = speed * direction;
        // console.log(pikachu.x , pikachu.y )
        // console.log(pikachu.width , pikachu.height )

        Pikachus.push(pikachu)
        gameScene.addChild(pikachu)
    }

    Gengar = new Sprite(gengar_img);
    Gengar.anchor.set(0.5);
    Gengar.scale.set(0.3, 0.3);

    let x = spacing * 4 + xOffset;

    let y = randomInt(-150, -150 + Gengar.height);
    Gengar.x = x;
    Gengar.y = y;

    Gengar.velocityY = speed * direction;

    gameScene.addChild(Gengar)
    // ============================================

    Ball = new Sprite(Ball_img);
    Ball.interactive = true;
    Ball.buttonMode = true;
    Ball.anchor.set(0.5);
    Ball.scale.set(0.2, 0.2);
    Ball.x = 250;
    Ball.y = 350;
    // console.log(Ball.width , Ball.height )
    Ball
        .on('pointerdown', onDragStart)
        .on('pointerup', onDragEnd)
        .on('pointerupoutside', onDragEnd)
        .on('pointermove', onDragMove);
    gameScene.addChild(Ball);

    let style = new TextStyle({
        fontFamily: "Arial",
        fontSize: 36,
        fill: "white",
    });
    message = new Text("Hello Pixi!", style);
    message.position.set(50, 50);
    gameScene.addChild(message);

    //，它实际上最好的方式，所以听好啦！如果你想知道精灵到canvas左上角的距离，但是不知道或者不关心精灵的父亲是谁，用getGlobalPosition方法。这里展示如何用它来找到老虎的全局位置：

    state = play;

    app.ticker.add(delta => gameLoop(delta));
}

function gameLoop(delta) {
    //Update the current game state:
    state(delta);
}

function play(delta) {
    // console.log('Pikachus --', Pikachus)

    // contain(Ball, {x: 28, y: 10, width: 488, height: 480});

    let cathchPikachu = false,
        cathchGengar = false;
    // 碰撞檢測
    Pikachus.forEach(function (Pikachu) {
        //Move the Pikachu
        Pikachu.y += Pikachu.velocityY;

        // x, y 是指外框的位置
        let pikachuHitsWall = contain(Pikachu, { x: 0, y: -150, width: 500, height: 700 });

        if (pikachuHitsWall === "top" || pikachuHitsWall === "bottom") {
            Pikachu.y = -150;
        }

        //Test for a collision. If any of the enemies are touching
        //the explorer, set `explorerHit` to `true`
        if (hitTestRectangle(Ball, Pikachu)) {
            cathchPikachu = true;
        }
    });

    // for Gengar
    Gengar.y += Gengar.velocityY;

    // x, y 是指外框的位置
    let GengarHitsWall = contain(Gengar, { x: 0, y: -150, width: 500, height: 700 });

    if (GengarHitsWall === "top" || GengarHitsWall === "bottom") {
        Gengar.y = -150;
    }

    //Test for a collision. If any of the enemies are touching
    //the explorer, set `explorerHit` to `true`
    if (hitTestRectangle(Ball, Gengar)) {
        cathchGengar = true;
    }


    if (cathchPikachu) {
        message.text = "Hit";
    } else if (cathchGengar) {
        message.text = "Youe dead";
    } else {
        message.text = "No collision...";
    }
}

function onDragStart(event) {
    // store a reference to the data
    // the reason for this is because of multitouch
    // we want to track the movement of this particular touch
    this.data = event.data;
    // this.alpha = 0.5;
    this.dragging = true;
}

function onDragEnd() {
    // this.alpha = 1;
    this.dragging = false;
    // set the interaction data to null
    this.data = null;
}

function onDragMove() {
    if (this.dragging) {
        const newPosition = this.data.getLocalPosition(this.parent);
        console.log('newPosition ====', newPosition.x, newPosition.y)
        this.x = newPosition.x;
        this.y = newPosition.y;
    }
}

/* Helper functions */

function contain(sprite, container) {

    let collision = undefined;

    //Left
    if (sprite.x < container.x) {
        sprite.x = container.x;
        collision = "left";
    }

    //Top
    if (sprite.y < container.y) {
        sprite.y = container.y;
        collision = "top";
    }

    //Right
    if (sprite.x + sprite.width > container.width) {
        sprite.x = container.width - sprite.width;
        collision = "right";
    }

    //Bottom
    if (sprite.y + sprite.height > container.height) {
        sprite.y = container.height - sprite.height;
        collision = "bottom";
    }

    //Return the `collision` value
    return collision;
}

//The `randomInt` helper function
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

//The `hitTestRectangle` helper function
function hitTestRectangle(r1, r2) {

    //Define the variables we'll need to calculate
    let hit, combinedHalfWidths, combinedHalfHeights, vx, vy;

    //hit will determine whether there's a collision
    hit = false;

    //Find the center points of each sprite
    // Beacuse anchor set 0.5, we cant not count halfwidth
    r1.centerX = r1.x;
    r1.centerY = r1.y;
    r2.centerX = r2.x;
    r2.centerY = r2.y;

    //Find the half-widths and half-heights of each sprite
    r1.halfWidth = r1.width / 2;
    r1.halfHeight = r1.height / 2;
    r2.halfWidth = r2.width / 2;
    r2.halfHeight = r2.height / 2;

    //Calculate the distance vector between the sprites
    vx = r1.centerX - r2.centerX;
    vy = r1.centerY - r2.centerY;

    //Figure out the combined half-widths and half-heights
    combinedHalfWidths = r1.halfWidth + r2.halfWidth;
    combinedHalfHeights = r1.halfHeight + r2.halfHeight;

    //Check for a collision on the x axis
    if (Math.abs(vx) < combinedHalfWidths) {

        //A collision might be occuring. Check for a collision on the y axis
        if (Math.abs(vy) < combinedHalfHeights) {

            //There's definitely a collision happening
            hit = true;
        } else {

            //There's no collision on the y axis
            hit = false;
        }
    } else {

        //There's no collision on the x axis
        hit = false;
    }

    //`hit` will be either `true` or `false`
    return hit;
};


function onResize() {

    // Get the p
    const parent = app.view.parentNode;

    // Resize the renderer
    app.renderer.resize(parent.clientWidth, parent.clientHeight);

    // You can use the 'screen' property as the renderer visible
    // area, this is more useful than view.width/height because
    // it handles resolution
    // 內容物.position.set(app.screen.width, app.screen.height);
}
onResize();
window.onresize = onResize;