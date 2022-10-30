class Camera {
    constructor() {
        this.position = Vec2(0, 0);
        this.scale = 0.7;

        this.container = new PIXI.Container();
        app.stage.addChild(this.container);
        this.container.sortableChildren = true

        this.container.pivot = Vec2(0, 0);
        this.container.scale = Vec2(this.scale, this.scale);
    }


    setPosition(position) {
        this.container.pivot = Vec2(position.x * pixelsPerMeter, position.y * pixelsPerMeter);
        this.position = position;
    }

    setScale(scale) {
        this.container.scale = Vec2(scale, scale);
        this.scale = scale;
    }
}