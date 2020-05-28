

/*
Images should resolve to the following:
{
  '1': '/1-hash.png',
  '2': '/2-hash.png',
  '3': '/3-hash.png'
}
*/
// import images_png from './img/*.png';
// import images_jpg from './img/*.jpg';

// const pikachu_filename = 'pikachu_lg2'
// const gengar_filename = 'gengar'
// const ball_filename = 'ball'

// const pikachu_png = images_png[`${pikachu_filename}`]
// const gengar_png = images_png[`${gengar_filename}`]
// const ball_jpg = images_jpg[`${ball_filename}`]


import sheet_png from './img/sheet_a.png';
import sheet_json from './img/sheet_a.json';


let Application = PIXI.Application,
    Container = PIXI.Container,
    loader = PIXI.loader,
    resources = PIXI.loader.resources,
    Graphics = PIXI.Graphics,
    TextureCache = PIXI.utils.TextureCache,
    Texture = PIXI.Texture,
    Sprite = PIXI.Sprite,
    Spritesheet = PIXI.Spritesheet,
    Text = PIXI.Text,
    TextStyle = PIXI.TextStyle;
// console.log('Loader', PIXI)
let app = new Application({
    backgroundColor: 0x1099bb,
    antialiasing: true,
    transparent: false,
    resolution: 1
});

document.body.querySelector('#vmfive-ad-unit-container-55667788 .wrap').appendChild(app.view);

loader
    .add(sheet_png)
    .load(setup);

let gameDuringTime = 20;
let state,
    Flowers, Leaf, Bottle, id,
    message, countdownMessage, endMessage,
    gameScene, gameOverScene,
    gameStartTime;

function setup() {

    gameScene = new Container();
    app.stage.addChild(gameScene);


    const texture = loader.resources[sheet_png].texture.baseTexture;
    const sheet = new Spritesheet(texture, sheet_json);
    sheet.parse((texture_sheet) => {
        id = texture_sheet;
        let numberOfFlower = 3,
            spacing = 140,
            xOffset = 80,
            speed = 1,
            direction = 1;

        Flowers = [];
        for (let i = 0; i < numberOfFlower; i++) {

            // let pikachu = new Sprite(Pikachu_img);
            let flower = new Sprite(id[`flower.png`]);
            flower.anchor.set(0.5);
            flower.scale.set(0.5, 0.5);

            let x = spacing * i + xOffset;
            //  todo 150 是固定值看要不要改
            let y = randomInt(-150, -150 + flower.height);
            flower.x = x;
            flower.y = y;

            flower.velocityY = speed * direction;

            Flowers.push(flower)
            gameScene.addChild(flower)
        }

        // Gengar = new Sprite(gengar_img);
        Leaf = new Sprite(id[`leaf.png`]);
        Leaf.anchor.set(0.5);
        Leaf.scale.set(0.5, 0.5);

        let x = spacing * 4 + xOffset;

        let y = randomInt(-150, -150 + Leaf.height);
        Leaf.x = x;
        Leaf.y = y;

        Leaf.velocityY = speed * direction;

        gameScene.addChild(Leaf)
        // ============================================

        // Bottle = new Sprite(Ball_img);
        Bottle = new Sprite(id[`bottle_0.png`]);
        Bottle.interactive = true;
        Bottle.buttonMode = true;
        Bottle.anchor.set(0.5);
        Bottle.scale.set(0.5, 0.5);
        Bottle.x = 250;
        Bottle.y = 350;
        // console.log(Ball.width , Ball.height )
        Bottle
            .on('pointerdown', onDragStart)
            .on('pointerup', onDragEnd)
            .on('pointerupoutside', onDragEnd)
            .on('pointermove', onDragMove);
        gameScene.addChild(Bottle);

        let style_message = new TextStyle({
            fontFamily: "Arial",
            fontSize: 24,
            fill: "white",
        });
        message = new Text("Hello Pixi!", style_message);
        message.position.set(20, 20);
        gameScene.addChild(message);

        let style_countdown = new TextStyle({
            fontFamily: "Arial",
            fontSize: 36,
            fill: "white",
        });
        countdownMessage = new Text(`${gameDuringTime}s`, style_countdown);
        countdownMessage.position.set(400, 20);
        gameScene.addChild(countdownMessage);

        // 設定 20s 後結束
        console.log('gameStartTime.date', Date.now())
        gameStartTime = Date.now();


        /*
        /  gameOverScene
        */
        gameOverScene = new Container();
        app.stage.addChild(gameOverScene);
        gameOverScene.visible = false;

        let style_end = new TextStyle({
            fontFamily: "Arial",
            fontSize: 64,
            fill: "white"
        });
        endMessage = new Text("The End!", style_end);
        endMessage.x = 120;
        endMessage.y = app.stage.height / 2 - 32;
        gameOverScene.addChild(endMessage);


        /*
        / 狀態控制
        */
        state = play;

        app.ticker.add(delta => gameLoop(delta));
    });
}

function gameLoop(delta) {
    //Update the current game state:
    state(delta);
}

function play(delta) {

    let cathchFlower = false,
        cathchLeaf = false;
    // 碰撞檢測
    Flowers.forEach(function (Flower) {
        //Move the Flower
        Flower.y += Flower.velocityY;

        // x, y 是指外框的位置
        let flowerHitsWall = contain(Flower, { x: 0, y: -150, width: 500, height: 700 });

        if (flowerHitsWall === "top" || flowerHitsWall === "bottom") {
            Flower.y = -150;
        }

        //Test for a collision. If any of the enemies are touching
        //the explorer, set `explorerHit` to `true`
        if (hitTestRectangle(Bottle, Flower)) {
            cathchFlower = true;
        }
    });

    // for Leaf
    Leaf.y += Leaf.velocityY;

    // x, y 是指外框的位置
    let LeafHitsWall = contain(Leaf, { x: 0, y: -150, width: 500, height: 700 });

    if (LeafHitsWall === "top" || LeafHitsWall === "bottom") {
        Leaf.y = -150;
    }

    //Test for a collision. If any of the enemies are touching
    //the explorer, set `explorerHit` to `true`
    if (hitTestRectangle(Bottle, Leaf)) {
        cathchLeaf = true;
    }


    if (cathchLeaf) {
        state = end;
        message.text = "End game";
    }
    else if (cathchFlower) {
        message.text = "Hit";
        Bottle.setTexture(id[`bottle_3.png`])
    } else {
        message.text = "No collision...";
    }

    let currentTime = Date.now();
    let leftTime = gameDuringTime - Math.floor((currentTime - gameStartTime) / 1000);
    countdownMessage.text = `${leftTime}s`;
    if (leftTime <= 0) {
        state = end;
        message.text = "End game";
    }
}

function end() {
    gameScene.visible = false;
    gameOverScene.visible = true;
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