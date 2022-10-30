const app = new PIXI.Application({
    resolution: devicePixelRatio,
    backgroundColor: 0x1099bb,
    antialias: true,
    resizeTo: window,
    autoDensity: true
});
document.body.appendChild(app.view);

let editor = false;

let cam = !editor;

let hookLen = 1;

app.view.addEventListener("click", (e) => {
    if (editor && !cam) return;
    app.view.requestPointerLock = app.view.requestPointerLock || app.view.mozRequestPointerLock;
    app.view.requestPointerLock();
    app.view.focus();
});


let chatInput = id("chat-input");
let chatLog = id("log");

function resize() {
    app.stage.hitArea = new PIXI.Rectangle(0, 0, window.innerWidth, window.innerHeight);
}

window.addEventListener("resize", resize);

resize();



let socket = io({ reconnection: false });



socket.on("position", (x, y) => {
    if (!canPlay) return;
    let diff = Vec2(x, y).sub(otherBox.body.getPosition());
    diff.mul(30);
    otherBox.body.setLinearVelocity(diff);
    lastOtherPos = Vec2(x, y);
    // otherBox.body.setPosition(Vec2(x, y));
});
socket.on("axe", (x, y) => {
    if (!canPlay) return;
    let diff = Vec2(x, y).sub(otherAxe.body.getPosition());
    diff.mul(30);
    otherAxe.body.setLinearVelocity(diff);
    // otherAxe.body.setPosition(Vec2(x, y));
});


app.stage.interactive = true;


const pl = planck;
const Vec2 = pl.Vec2;

const world = pl.World({ gravity: Vec2(0.0, 10.0) });

let lastOtherPos = Vec2(0, 0);

world.on("post-solve", (contact, impulse) => {
    if (contact.m_fixtureB.m_body.getUserData() == axe || contact.m_fixtureA.m_body.getUserData() == axe) {
        let vec;
        if (contact.m_fixtureB.m_body.getUserData() == axe) {
            vec = contact.v_normal.clone();
        } else {
            vec = contact.v_normal.clone().neg();
        }

        let normalDirection = vec.clone();
        let tangentDirection = Vec2(normalDirection.y, -normalDirection.x);
        let normalMagnitude = impulse.normalImpulses[0];
        let tangentMagnitude = impulse.tangentImpulses[0];
        // console.log(normalMagnitude);


        let normal = normalDirection.mul(normalMagnitude);
        let tangent = tangentDirection.mul(tangentMagnitude);

        normal.mul(1);
        tangent.mul(2);

        let total = normal.add(tangent);


        box.body.applyLinearImpulse(total, box.body.getWorldCenter(), true);

    }
});
function distance(p1, p2){
    let y = p2.x - p1.x;
    let x = p2.y - p1.y;
    
    return Math.sqrt(x * x + y * y);
}


world.on("end-contact", (contact) => {
    if (contact.m_fixtureB.m_body.getUserData() == box || contact.m_fixtureA.m_body.getUserData() == box) {
        let vec;
        if (contact.m_fixtureB.m_body.getUserData() == box) {
            vec = contact.v_normal.clone();
        } else {
            vec = contact.v_normal.clone().neg();
        }
        console.log(vec.y);
        setTimeout(() => {
            console.log("can dj");
            grounded = false;
            canDJ = true;
        }, 100);
    }
});
world.on("pre-solve", (contact) => {
    if (contact.m_fixtureB.m_body.getUserData() == box || contact.m_fixtureA.m_body.getUserData() == box) {
        let vec;
        if (contact.m_fixtureB.m_body.getUserData() == box) {
            vec = contact.v_normal.clone();
        } else {
            vec = contact.v_normal.clone().neg();
        }
        console.log(vec.y);
        if (vec.y < 0) {
            grounded = true;
            canDJ = false;
        } else {
            // grounded = false;
        }
    }
});


function resetBox() {
    box.body.setPosition(Vec2(5, 4));
    axe.body.setPosition(Vec2(5, 4))
    box.body.setLinearVelocity(Vec2(0, 0));
    axe.body.setLinearVelocity(Vec2(0, 0));
}

function resetOtherBox() {
    otherBox.body.setPosition(Vec2(5, 4));
    otherAxe.body.setPosition(Vec2(5, 4))
    otherBox.body.setLinearVelocity(Vec2(0, 0));
    otherAxe.body.setLinearVelocity(Vec2(0, 0));
}

let grounded = false;


const camera = new Camera();

let canPlay = true;

function map(value, inMin, inMax, outMin, outMax) {
    return (value - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
}


let pressed = {};

let spectating = false;

function addChatMsg(sender, msg) {
    let msgEl = document.createElement("span");
    if (sender) msgEl.innerText += sender + ": ";
    msgEl.innerText += msg;
    chatLog.appendChild(msgEl);
    chatLog.lastElementChild.scrollIntoView();
}



socket.on("full", () => {
    console.log("SERVER FULL!");
    canPlay = false;
    alert("There are already 2 people playing. Right now, the game only supports 2 players at a time, so you have been placed in a singleplayer server.");
    window.close();
});

socket.on("chat", (msg) => {
    addChatMsg("Red", msg);
});

addChatMsg("", "Send /help for instructions!");

document.addEventListener("keydown", (e) => {
    if (document.activeElement === chatInput) {
        if (e.key == "Enter") {
            let msg = chatInput.value;
            if (msg == "/help") {
                addChatMsg("", "t/enter = chat");
                addChatMsg("", "escape = show cursor");
                addChatMsg("", "click game = hide cursor");
                addChatMsg("", "w,a,s,d,space = move and jump");
                addChatMsg("", "mouse movement = move swinger");
                addChatMsg("", "r = reset");
                addChatMsg("", "q = spectate red");
                addChatMsg("", "f = fix red's position");
                addChatMsg("", "h = set hook length");
                addChatMsg("", "1,2,3,4,5 = set map");
                addChatMsg("", "/editor = switch to editor mode");
                chatInput.value = "";
                return;
            } else if (msg == "/editor") {
                socket.emit("map", 0);

                addChatMsg("", "Switched to editor mode!");
                addChatMsg("", "type /game to switch back to game mode");
                addChatMsg("", "-- EDITOR CONTROLS --");
                
                addChatMsg("", "e = toggle first person camera");
                addChatMsg("", "click = click once to set block start, click again to set block end and place block");
                addChatMsg("", "shift+click = If you shift+click the block end position, it will place a no-hammer block instead of a regular block");

                addChatMsg("", "m+click and drag = move block");
                addChatMsg("", "q+click = delete clicked block");
                addChatMsg("", "i+click = log clicked block info in console");
                addChatMsg("", "l+click = set player's position to mouse position");


                addChatMsg("", "q = log map data in console");
                addChatMsg("", "right click drag = pan camera");

                addChatMsg("", "Once you've finished making your map, press p and right click the object that is pasted into the console, and select 'copy object'. Then send me this data and I'll add your map to the game.");


                editor = true;
                cam = !editor;
                chatInput.value = "";
                return;
            } else if (msg == "/game") {
                addChatMsg("", "Switched to game mode!");
                editor = false;
                cam = !editor;

                chatInput.value = "";
                return;
            }
     

            console.log("Sending", msg);
            if (canPlay) socket.emit("chat", msg);
            addChatMsg("You", msg);
            chatInput.value = "";

        }
    }
    if ((e.key == "t" || e.key == "Enter") && document.activeElement !== chatInput) {
        chatInput.focus();
        e.preventDefault();
        return false;
    }
    if (document.activeElement === chatInput) return;
    pressed[e.key] = true;

    if (e.key == "e") {
        cam = !cam;
    } else if (e.key == " ") {
        if (canDJ || grounded) {
            box.body.setLinearVelocity(Vec2(box.body.getLinearVelocity().x, 0));
            box.body.applyLinearImpulse(Vec2(0, -1.5), box.body.getWorldCenter(), true);
            canDJ = false;
        }
    } else if (e.key == "p") {
        console.log("SAVING!");
        let data = [];
        for (let ground of grounds) {
            let curr = {
                position: ground.body.getPosition(),
                angle: ground.body.getAngle(),
                width: ground.width,
                height: ground.height
            };
            if (ground.noHammer) {
                curr["noHammer"] = true;
            }
            data.push(curr);
        }
        console.log(data);
    } else if (e.key == "r") {
        resetBox();
        startTime = Date.now();
        totalTime = null;
    } else if (e.key == "q") {
        spectating = !spectating;
    } else if ("0123456".includes(e.key) && canPlay) {
        socket.emit("map", e.key);
    } else if (e.key == "f") {
        otherBox.body.setPosition(lastOtherPos);
        otherAxe.body.setPosition(lastOtherPos);
    } else if (e.key == "h") {
        hookLen = parseInt(prompt("Hook length? (default is 1)"));
    }
});

socket.on("map", (mapNum) => {
    if (!canPlay) return;
    clearMap();
    resetBox();
    startTime = Date.now();
    totalTime = null;
    http_request("GET", `/maps/map${mapNum}.json`, {}, {}, (response) => {
        loadMap(JSON.parse(response.response));
    });
});

document.addEventListener("keyup", (e) => {
    pressed[e.key] = false;
});


let GROUND = 0x0001;
let PLAYER =0x0002;
let AXE = 0x0004;
let OTHERPLAYER = 0x0008;
let OTHERAXE = 0x0010;


let gf = 0.5;
let gr = 0;


let pixelsPerMeter = 100;

let grounds = [];


let currentFinish;


function loadMap(loadGrounds) {
    for (let ground of loadGrounds) {
        if (ground["finish"]) {
            currentFinish = ground["finish"];
            continue;
        }
        let currentMaskBits;

        if (ground["noHammer"]) {
            currentMaskBits = PLAYER | OTHERPLAYER;
        } else {
            currentMaskBits = PLAYER | AXE | OTHERPLAYER | OTHERAXE;
        }

        let n = new Box(
            type = "static",
            position = Vec2(ground.position.x, ground.position.y),
            angle = ground.angle,
            width = ground.width, height = ground.height,
            density = 0,
            friction = gf,
            restitution = gr,
            color = 0x0037ad,
            categoryBits = GROUND,
            maskBits = currentMaskBits
        );

        if (ground["noHammer"]) {
            n.graphics.alpha = 0.5;
        }

        
        grounds.push(n);

        
    }
}

function clearMap() {
    for (let ground of grounds) {
        world.destroyBody(ground.body);
        ground.graphics.destroy();
        // grounds.splice(i, 1);
    }
    grounds = [];
}


http_request("GET", "/maps/map1.json", {}, {}, (response) => {
    loadMap(JSON.parse(response.response));
});





const box = new Box(
    type = "dynamic",
    position = Vec2(5, 4),
    angle = 0,
    width = 0.5, height = 0.5,
    density = 1,
    friction = 0,
    restitution = 0,
    color = 0x098021,
    categoryBits = PLAYER,
    maskBits = GROUND | OTHERPLAYER | OTHERAXE
);

const axe = new Box(
    type = "dynamic",
    position = Vec2(5, 3.25),
    angle = 0,
    width = 0.1, height = 0.1,
    density = 1,
    friction = 2,
    restitution = 0,
    color = 0x098021,
    categoryBits = AXE,
    maskBits = GROUND | OTHERPLAYER | OTHERAXE
);

const otherBox = new Box(
    type = "dynamic",
    position = Vec2(6, 4),
    angle = 0,
    width = 0.5, height = 0.5,
    density = 1,
    friction = 0,
    restitution = 0,
    color = 0xa30f05,
    categoryBits = OTHERPLAYER,
    maskBits = GROUND | PLAYER | AXE
);

const otherAxe = new Box(
    type = "dynamic",
    position = Vec2(6, 3.25),
    angle = 0,
    width = 0.1, height = 0.1,
    density = 1,
    friction = 2,
    restitution = 0,
    color = 0xa30f05,
    categoryBits = OTHERAXE,
    maskBits = GROUND | PLAYER | AXE
);

box.body.setFixedRotation(true);
axe.body.setFixedRotation(true);
axe.body.setBullet(true);
otherBox.body.setFixedRotation(true);
otherAxe.body.setFixedRotation(true);
otherAxe.body.setBullet(true);

let canDJ = false;




let mouseJoint = null;

document.addEventListener("mousemove", (e) => {
    // console.log(e);
});


function test(pos, color = 0x03fc9da) {
    let t = new PIXI.Graphics();
    t.beginFill(color);
    t.drawRect(0, 0, 10, 10);
    t.endFill();
    t.position = Vec2(pos.x * pixelsPerMeter, pos.y * pixelsPerMeter);
    camera.container.addChild(t);

    return t;

}

let clickPos = null;
let initialPos = null;

let mouseDown = false;

let point1;

let clickedWall;

function midpoint(p1, p2) {
    return Vec2((p1.x + p2.x) / 2, (p1.y + p2.y) / 2)
}

function angleFrom2(p1, p2) {
    return Math.atan2(p2.x - p1.x, p2.y - p1.y);
}

let mouseDownPos;
let initialGroundPos;





app.stage.on("pointerdown", (event) => {
    let localPosition = camera.container.toLocal(event.data.global);
    let lp = Vec2(localPosition.x / pixelsPerMeter, localPosition.y / pixelsPerMeter);

    if (!editor) return;
    if (cam) return;
    mouseDown = true;
    mouseDownPos = lp.clone();

    if (pressed["m"]) {
        for (let ground of grounds) {
            if (ground.body.getFixtureList().testPoint(lp.clone())) {
                clickedWall = ground;
                initialGroundPos = ground.body.getPosition().clone();
            }
        }

        return;
    }
    if (pressed["q"]) {
        for (let i = 0; i < grounds.length; i++) {
            let ground = grounds[i];
            if (ground.body.getFixtureList().testPoint(lp.clone())) {
                world.destroyBody(ground.body);
                ground.graphics.destroy();
                grounds.splice(i, 1);
            }
        }
        return;

    }
    if (pressed["i"]) {
        for (let i = 0; i < grounds.length; i++) {
            let ground = grounds[i];
            if (ground.body.getFixtureList().testPoint(lp.clone())) {
                console.log("Selected ground:");
                console.log(ground.body.getPosition());
                console.log(ground.body.getAngle());
            }
        }
        return;
    }
    if (pressed["l"]) {
        box.body.setPosition(lp.clone());
        axe.body.setPosition(lp.clone());
    }

    if (event.data.button == 2) return;

    if (point1) {
        let point2 = lp.clone();

        let currentMaskBits;

        if (pressed["Shift"]) {
            currentMaskBits = PLAYER | OTHERPLAYER;
        } else {
            currentMaskBits = PLAYER | AXE | OTHERPLAYER | OTHERAXE;
        }


        let n = new Box(
            type = "static",
            position = midpoint(point1, point2),
            angle = -angleFrom2(point1, point2) + (Math.PI / 2),
            width = distance(point1, point2), height = 0.5,
            density = 0,
            friction = gf,
            restitution = gr,
            color = 0x0037ad,
            categoryBits = GROUND,
            maskBits = currentMaskBits
        );

        if (pressed["Shift"]) {
            n.graphics.alpha = 0.5;
            n.noHammer = true;

        }

        
        grounds.push(n);

        point1 = null;


    } else {
        point1 = lp.clone();
    }

});

(function () {
    var blockContextMenu, myElement;
  
    blockContextMenu = function (evt) {
      evt.preventDefault();
    };
  
    document.body.addEventListener('contextmenu', blockContextMenu);
})();


let lastt;



app.stage.on("pointermove", (event) => {
    let localPosition = camera.container.toLocal(event.data.global);
    let lp = Vec2(localPosition.x / pixelsPerMeter, localPosition.y / pixelsPerMeter);

    if (isMobile) {
        // Pointer was just locked
        lastMouse = lp.clone();
        // lastMouse = lastMouse.add(Vec2(e.movementX, e.movementY).mul(1 / 100).mul(sens));
        // let boxPos = box.body.getPosition();

        // let d = distance(boxPos, lastMouse);
        // let r = hookLen;
        // let dest;
    
        // if (d > r) {
        //     dest = lastMouse.clone().sub(boxPos).mul(r / d).add(boxPos);
        // } else {
        //     dest = lastMouse;
        // }
        // // test(dest);
        // lastMouse = dest.clone();
        // // test(lastMouse);
    }

    if (!editor) return;
    if (clickedWall) {
        clickedWall.body.setPosition(initialGroundPos.clone().add(lp.clone().sub(mouseDownPos)));
    }

});


document.addEventListener("mousedown", (e) => {
    if (!editor) return;
    if (e.button == 2) {
        clickPos = Vec2(e.clientX, e.clientY);
        initialPos = camera.position.clone();
    }
});

let lastMouse = Vec2(0, 0);

let sens = 2;

let isMobile = false;

function tmove(e, mobile) {
    if (mobile) {
        isMobile = true;

    } else if (document.pointerLockElement === app.view || document.mozPointerLockElement === app.view || document.webkitPointerLockElement === app.view) {
        // Pointer was just locked

        lastMouse = lastMouse.add(Vec2(e.movementX, e.movementY).mul(1 / 100).mul(sens));
        let boxPos = box.body.getPosition();

        let d = distance(boxPos, lastMouse);
        let r = hookLen;
        let dest;
    
        if (d > r) {
            dest = lastMouse.clone().sub(boxPos).mul(r / d).add(boxPos);
        } else {
            dest = lastMouse;
        }
        // test(dest);
        lastMouse = dest.clone();
        // test(lastMouse);
    } else {
        lastMouse = Vec2(e.clientX, e.clientY);
    }
      

    if (!editor) return;
    if (clickPos) {
        let diff = clickPos.clone().sub(Vec2(e.clientX, e.clientY));
        // console.log(diff);
        camera.setPosition(initialPos.clone().add(diff.clone().mul(1/pixelsPerMeter)));
        
    }
}

document.addEventListener("touchmove", (e) => { tmove(e, true) });
document.addEventListener("pointermove", tmove);


document.addEventListener("mouseup", (e) => {
    if (!editor) return;
    // if (e.button == 2) {
    clickPos = null;
    // }
});

let scrollSpeed = 0.01;

document.addEventListener("wheel", (e) => {
    let zoomFactor = (e.deltaY / pixelsPerMeter) * scrollSpeed + 1;
    let newScale = camera.scale * zoomFactor;

    // let newPos = camera.position.clone();
    // newPos.x += ((lastMouse.x / pixelsPerMeter) / newScale) - ((lastMouse.x / pixelsPerMeter) / camera.scale);
    // newPos.y += ((lastMouse.y / pixelsPerMeter) / newScale) - ((lastMouse.y / pixelsPerMeter) / camera.scale);

    // camera.setPosition(newPos);
    camera.setScale(newScale);
});





app.stage.on("pointerup", (event) => {
    if (!editor) return;
    clickedWall = null;
});

function mod(a,b) {
    return ((a % b) + b) % b;
}

const timeStep = 1 / 60;

const velocityIterations = 6;
const positionIterations = 2;

let last;
let lastLine;
let lastLine1;

const text = new PIXI.Text("0:0:0", {
    fill: "#000000",
    fontSize: 40,
    fontWeight: 'bold',
});

app.stage.addChild(text);

let startTime = Date.now();
let totalTime;




app.ticker.autoStart = false;
app.ticker.stop();

let updateFPS = 60;
let dt = 1 / updateFPS;

let elapsedTime = 0;
let accumulator = 0;


let before;
let after;


let currentTime = performance.now();

function animate(timeTest) {
    // Process system events here...

    let newTime = performance.now()
    let frameTime = (newTime - currentTime) / 1000;

    // Avoid spiral of death
    if (frameTime > 0.25) {
        frameTime = 0.25;
    }

    currentTime = newTime;
    accumulator += frameTime;

    // Logic update
    while (accumulator >= dt)
    {
        elapsedTime += dt;
        accumulator -= dt;
        // Update game entities
        // console.log(dt);
        before = box.body.getPosition().clone()
        world.step(dt, velocityIterations, positionIterations);
        after = box.body.getPosition().clone()

        step();
    }

    let alpha = accumulator / dt;
    // Render code.....

    app.ticker.update();
    app.renderer.render(app.stage);

    requestAnimationFrame(animate);

}

animate(performance.now());

// function animate(time) {
//     let newTime = Date.now();
//     let frameTime = newTime - currentTime;

//     if ( frameTime > 0.25 ) {
//         frameTime = 0.25;
//     }
//     currentTime = newTime;

//     accumulator += frameTime;

//     while ( accumulator >= dt ) {
//         // previousState = currentState;
//         before = box.body.getPosition().clone();
//         // console.log(dt);
//         world.step(dt, velocityIterations, positionIterations);
//         after = box.body.getPosition().clone()
//         // integrate( currentState, t, dt );
//         t += dt;
//         accumulator -= dt;
//     }

//     let alpha = accumulator / dt;

//     // let state = currentState * alpha + previousState * ( 1.0 - alpha );


//     step();

//     app.ticker.update(time);
//     app.renderer.render(app.stage);

//     requestAnimationFrame(animate);
// }

// animate(performance.now());


function step() {

    if (currentFinish) {
        let finish = Vec2(currentFinish.x, currentFinish.y);

        if (distance(after, finish) < currentFinish.r && !totalTime) {
            console.log("FINISHED!", Date.now() - startTime);
            totalTime = new Date(Date.now() - startTime);
        }
    
    }

    let axePosition = axe.body.getPosition();

    let elapsed = new Date(Date.now() - startTime);

    if (!totalTime) {
        text.text = `${elapsed.getMinutes()}:${elapsed.getSeconds()}:${elapsed.getMilliseconds()}`;
    } else {
        text.text = `${totalTime.getMinutes()}:${totalTime.getSeconds()}:${totalTime.getMilliseconds()}`;
    }
    
    if (canPlay) {
        socket.emit("position", after.x, after.y);
        socket.emit("axe", axePosition.x, axePosition.y);
    }


    let theDiff = after.sub(before);
    lastMouse.add(theDiff.clone());

    for (let ground of grounds) {
        ground.display();
    }

    box.display();
    otherBox.display();
    axe.display();
    otherAxe.display();




    const centerPos = box.body.getPosition().clone();
    let otherCenterPos = otherBox.body.getPosition().clone();

    if (!editor || cam) {
        if (!spectating) {
            camera.setPosition(Vec2(
                centerPos.x - (app.screen.width / 2 / pixelsPerMeter) * (1 / camera.scale),
                centerPos.y - (app.screen.height / 2 / pixelsPerMeter) * (1 / camera.scale)
            ));
        } else {
            camera.setPosition(Vec2(
                otherCenterPos.x - (app.screen.width / 2 / pixelsPerMeter) * (1 / camera.scale),
                otherCenterPos.y - (app.screen.height / 2 / pixelsPerMeter) * (1 / camera.scale)
            ));
        }

    }


    let desiredVel = 0;
    if (pressed["a"] && pressed["d"]) {
        desiredVel = box.body.getLinearVelocity().x * 0.98;
    } else if (pressed["a"]) {
        desiredVel = Math.min(box.body.getLinearVelocity().x, Math.max(box.body.getLinearVelocity().x - 0.8, -5));
        // desiredVel = Math.max(box.body.getLinearVelocity().x - 0.8, -5)
    } else if (pressed["d"]) {
        desiredVel = Math.max(box.body.getLinearVelocity().x, Math.min(box.body.getLinearVelocity().x + 0.8, 5));
        // desiredVel = Math.min(box.body.getLinearVelocity().x + 0.8, 5);
    } else {
        desiredVel = box.body.getLinearVelocity().x * 0.98;

    }

    // console.log(deltaTime);
    let velChange = desiredVel - box.body.getLinearVelocity().x;
    let impulse = box.body.getMass() * velChange * 1; //disregard time factor
    // let impulse = box.body.getMass() * velChange; //disregard time factor

    box.body.applyLinearImpulse(Vec2(impulse, 0), box.body.getWorldCenter(), true);

    let mouse;
    if (isMobile || document.pointerLockElement === app.view || document.mozPointerLockElement === app.view || document.webkitPointerLockElement === app.view) {
        mouse = lastMouse.clone();
    } else {
        let pos = app.renderer.plugins.interaction.mouse.global;
        let localPosition = camera.container.toLocal(pos);
        mouse = Vec2(localPosition.x / pixelsPerMeter, localPosition.y / pixelsPerMeter);
    }

    // console.log(mouse);


    // if (last) last.destroy();


    let boxPos = box.body.getPosition();
    let axePos = axe.body.getPosition();


    let d = distance(boxPos, mouse);

    let r = hookLen;

    let dest;

    // // console.log(d);

    if (d > r) {
        dest = mouse.clone().sub(boxPos).mul(r / d).add(boxPos);
    } else {
        dest = mouse;
    }

    // // test(dest);

    let diff = dest.clone().sub(axePos);

    
    axe.body.setLinearVelocity(diff.mul(30));

    if (lastLine) lastLine.destroy();
    if (lastLine1) lastLine1.destroy();


    
    lastLine = new PIXI.Graphics();
    lastLine.lineStyle(5)
    lastLine.moveTo(boxPos.x * pixelsPerMeter, boxPos.y * pixelsPerMeter);
    lastLine.lineTo(axePos.x * pixelsPerMeter, axePos.y * pixelsPerMeter);
    lastLine.endFill();
    camera.container.addChild(lastLine);

    let otherBoxPos = otherBox.body.getPosition();
    let otherAxePos = otherAxe.body.getPosition();

    lastLine1 = new PIXI.Graphics();
    lastLine1.lineStyle(5)
    lastLine1.moveTo(otherBoxPos.x * pixelsPerMeter, otherBoxPos.y * pixelsPerMeter);
    lastLine1.lineTo(otherAxePos.x * pixelsPerMeter, otherAxePos.y * pixelsPerMeter);
    lastLine1.endFill();
    camera.container.addChild(lastLine1);


    axe.graphics.zIndex = 12;
    otherAxe.graphics.zIndex = 10;

}

  