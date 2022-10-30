class Box {
    constructor(type, position, angle, width, height, density, friction, restitution, color = 0x0325ad, categoryBits = parseInt("100", 2), maskBits = parseInt("100", 2)) {
        this.width = width;
        this.height = height;
        
        // Pixi.js stuff
        this.graphics = new PIXI.Graphics();

        this.graphics.beginFill(color);
        this.graphics.drawRect(-(this.width * pixelsPerMeter) / 2, -(this.height * pixelsPerMeter) / 2, width * pixelsPerMeter, height * pixelsPerMeter);
        // this.graphics.drawRect(0, 0, width * pixelsPerMeter, height * pixelsPerMeter);
        this.graphics.endFill();

        this.graphics.position = Vec2(this.width * pixelsPerMeter, this.height * pixelsPerMeter);

        camera.container.addChild(this.graphics);

        console.log(categoryBits, maskBits);
        // Planck.js stuff
        this.bodyDef = {
            type: type,
            position: position,
            angle: angle,
        };
        this.body = world.createBody(this.bodyDef);

        this.shape = pl.Box(width / 2, height / 2);
        this.fixtureDef = {
            shape: this.shape,
            density: density,
            friction: friction,
            restitution: restitution,
            filterCategoryBits: categoryBits,
            filterMaskBits: maskBits
        }

        this.body.createFixture(this.fixtureDef);
        this.body.setUserData(this);
    }

    display() {
        const centerPos = this.body.getPosition();
        const angle = this.body.getAngle();
        this.graphics.position = Vec2(centerPos.x * pixelsPerMeter, centerPos.y * pixelsPerMeter);
        // console.log(angle);
        this.graphics.rotation = angle;
        // camera.setPosition(Vec2(centerPos.x - (app.screen.width / 2 / pixelsPerMeter), centerPos.y - (app.screen.height / 2 / pixelsPerMeter)));
        // camera.setPosition(Vec2(centerPos.x - app.screen.width / 2, centerPos.y - app.screen.height / 2));
        // this.graphics.position = camera.worldToPixels(centerPos);
    }
}