

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
    .load(start);

let gameDuringTime = 20;
let state,
    Flowers, Leaf, Bottle, id,
    startMessage, scoreＭessage, countdownMessage, endMessage,
    startGraphic, background,
    dropPostion = [],
    flowerCount, score = 0,
    gameStartScene, gameScene, gameOverScene,
    gameStartTime;

let positionTack = 4,
    numberOfFlower = 7,
    numberOfLeaf = 3, // 目前只有一個，若要多增則要讓 leaf 也 for
    spacing = app.screen.width / 5, // screen 寬度的 1/5
    xOffset = 30, // 每個花之間的間距，等於一半花寬多一點點
    screenOuterOffset = 100, // 遊戲螢幕上下的 offset，讓花葉可以超出去
    speed = 3,
    direction = 1;

function start() {
    /*
    /  gameStartScene
    */
    gameStartScene = new Container();
    app.stage.addChild(gameStartScene);

    let style_end = new TextStyle({
        fontFamily: "Arial",
        fontSize: 30,
        fill: "white"
    });
    startMessage = new Text("Click To Start!", style_end);
    startMessage.x = app.screen.width / 2 - 80;
    startMessage.y = app.screen.height / 2 - 32;
    gameStartScene.addChild(startMessage);

    startGraphic = new Graphics();
    startGraphic.beginFill(0x66CCFF);
    startGraphic.drawRect(0, 0, 64, 64);
    startGraphic.endFill();
    startGraphic.x = app.screen.width / 2 - 80;
    startGraphic.y = app.screen.height / 2;
    startGraphic.interactive = true;
    gameStartScene.addChild(startGraphic);

    startGraphic.on('pointerdown', onClick)
    function onClick() {
        /*
        / 狀態控制
        */

        // 初始 被抓花數
        flowerCount = 0;

        state = play;

        app.ticker.add(delta => gameLoop(delta));
    }

    /*
    /  gameScene
    */
    gameScene = new Container();
    app.stage.addChild(gameScene);
    gameScene.visible = false;

    // 先把掉落軌道固定好
    for (let i = 0; i < positionTack; i++) {
        let dropX = (app.screen.width / 4) * i + xOffset;
        dropPostion.push(dropX)
    }
    console.log(app.screen.width, dropPostion)


    const texture = loader.resources[sheet_png].texture.baseTexture;
    const sheet = new Spritesheet(texture, sheet_json);
    // 雪碧圖加載完才 load 後續的
    sheet.parse((texture_sheet) => {
        id = texture_sheet;
        /*
        /  背景位置
        */
        background = new Sprite(id[`bg.jpg`]);
        background.width = app.screen.width;
        //    background.height = 300;
        background.x = 0;
        background.y = 0;
        gameScene.addChild(background);

        /*
        /  花的位置
        */
        Flowers = [];
        for (let i = 0; i < numberOfFlower; i++) {

            let flower = new Sprite(id[`flower.png`]);
            flower.anchor.set(0.5);
            flower.scale.set(0.5, 0.5);

            // let x = spacing * i + xOffset;
            let flower_x = dropPostion[randomInt(0, positionTack - 1)];
            // 花的起始 Y
            let flower_y = randomInt(-app.screen.height, -flower.height); // 距離頂關 一倍遊戲螢幕高 到 花的高之間
            flower.x = flower_x;
            flower.y = flower_y;

            flower.velocityY = speed * direction;
            flower.beenHit = false;

            Flowers.push(flower)
            // console.log('flower', flower.x, flower.y, app.screen.height, app.screen.width, flower.height)
            gameScene.addChild(flower)
        }

        /*
        /  葉子的位置
        */
        Leaf = new Sprite(id[`leaf.png`]);
        Leaf.anchor.set(0.5);
        Leaf.scale.set(0.5, 0.5);

        // let x = spacing * 3 + xOffset; // screen 寬度的 1/5，目前暫定為第四個
        let leaf_x = dropPostion[randomInt(0, positionTack - 1)];
        // 葉子的起始點，看要不要改
        let leaf_y = randomInt(-screenOuterOffset, -Leaf.height);
        Leaf.x = leaf_x;
        Leaf.y = leaf_y;

        Leaf.velocityY = speed * direction;
        Leaf.beenHit = false;

        gameScene.addChild(Leaf)

        /*
        /  瓶子的位置
        */
        Bottle = new Sprite(id[`bottle_0.png`]);
        Bottle.interactive = true;
        Bottle.buttonMode = true;
        Bottle.anchor.set(0.5);
        Bottle.scale.set(0.5, 0.5);
        Bottle.x = app.screen.width / 2; // 置中
        Bottle.y = app.screen.height - (Bottle.height / 2);

        Bottle
            .on('pointerdown', onDragStart)
            .on('pointerup', onDragEnd)
            .on('pointerupoutside', onDragEnd)
            .on('pointermove', onDragMove);
        gameScene.addChild(Bottle);

        /*
        /  訊息的位置
        */
        let style_message = new TextStyle({
            fontFamily: "Arial",
            fontSize: 12,
            fill: "white",
        });
        scoreＭessage = new Text(`Score: 0`, style_message);
        scoreＭessage.position.set(20, 20);
        gameScene.addChild(scoreＭessage);

        let style_countdown = new TextStyle({
            fontFamily: "Arial",
            fontSize: 36,
            fill: "white",
        });
        countdownMessage = new Text(`${gameDuringTime}s`, style_countdown);
        countdownMessage.position.set(app.screen.width / 2 - 24, 20);
        gameScene.addChild(countdownMessage);


        /*
        /  gameOverScene
        */
        gameOverScene = new Container();
        app.stage.addChild(gameOverScene);
        gameOverScene.visible = false;

        let style_end = new TextStyle({
            fontFamily: "Arial",
            fontSize: 40,
            fill: "white"
        });
        endMessage = new Text("The End!", style_end);
        endMessage.x = app.screen.width / 2 - 80;
        endMessage.y = app.screen.height / 2 - 32;
        gameOverScene.addChild(endMessage);

    });
}

function gameLoop(delta) {
    //Update the current game state:
    state(delta);
}

function play(delta) {
    gameStartScene.visible = false;
    gameScene.visible = true;
    gameOverScene.visible = false;

    // 設定 20s 後結束
    gameStartTime = Date.now();

    let cathchFlower = false,
        cathchLeaf = false;

    // 碰撞檢測
    Flowers.forEach(function (Flower) {
        //Move the Flower
        Flower.y += Flower.velocityY;

        // x, y 是指外框的位置，這個可能要改 TODO
        let flowerHitsWall = contain(Flower, { x: 0, y: -app.screen.height, width: app.screen.width, height: app.screen.height });

        // 如果碰到底或頂的時候，要重新刷新位置
        if (flowerHitsWall === "bottom") {

            Flower.x = dropPostion[randomInt(0, positionTack - 1)];
            Flower.y = randomInt(-screenOuterOffset, -Flower.height);

            // 如果這朵花又從上面下來了，重置它的碰撞狀態
            Flower.beenHit = false;
            Flower.alpha = 1;
        }

        //Test for a collision. If any of the enemies are touching
        //the explorer, set `explorerHit` to `true`
        if (!Flower.beenHit) {
            if (hitTestRectangle(Bottle, Flower)) {
                // 這朵花已經碰撞過了
                Flower.beenHit = true;
                Flower.alpha = 0;
                // 抓到花了
                cathchFlower = true;
            }
        }
    });

    // for Leaf
    Leaf.y += Leaf.velocityY;

    // x, y 是指外框的位置，這個可能要改 TODO
    let LeafHitsWall = contain(Leaf, { x: 0, y: -app.screen.height, width: app.screen.width, height: app.screen.height });
    console.log(' width: app.screen.width', app.screen.width, app.screen.height)

    if (LeafHitsWall === "bottom") {
        Leaf.x = dropPostion[randomInt(0, positionTack - 1)];
        Leaf.y = randomInt(-screenOuterOffset, -Leaf.height);

        // 如果這葉子又從上面下來了，重置它的碰撞狀態
        Leaf.beenHit = false;
        Leaf.alpha = 1;
    }

    if (!Leaf.beenHit) {
        if (hitTestRectangle(Bottle, Leaf)) {
            // 這葉子已經碰撞過了
            Leaf.beenHit = true;
            Leaf.alpha = 0;
            // 抓到葉子
            cathchLeaf = true;
        }
    }

    // 時間到就結束
    let currentTime = Date.now();
    let leftTime = gameDuringTime - Math.floor((currentTime - gameStartTime) / 1000);
    countdownMessage.text = `${leftTime}s`;
    if (leftTime <= 0) {
        state = end;
        endMessage.text = "Time out";
    }

    // 碰撞物體計分
    if (cathchLeaf) {
        // state = end;
        // endMessage.text = "Lose game";
        score = score -= 500;
        scoreＭessage.text = `Scroe: ${score}`;
    }
    else if (cathchFlower) {
        score = score += 1000;
        scoreＭessage.text = `Scroe: ${score}`;
        flowerCount = flowerCount >= 5 ? 5 : flowerCount + 1;
        Bottle.setTexture(id[`bottle_${flowerCount}.png`])
    } else {
    }

    // 抓到超過 n 朵花就結束
    if (flowerCount >= 100) {
        state = end;
        endMessage.text = "Time out";
    }
}

function end() {
    gameStartScene.visible = false;
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
        // sprite.x = container.x;
        collision = "left";
    }

    //Top
    if (sprite.y < container.y) {
        // sprite.y = container.y;
        collision = "top";
    }

    //Right
    if (sprite.x + sprite.width > container.width) {
        // sprite.x = container.width - sprite.width;
        collision = "right";
    }

    //Bottom
    // 物件低於底部一半的物件高度才讓他回到最上面
    if (sprite.y - (sprite.height / 2) > container.height) {
        // sprite.y = container.height - sprite.height;
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