
planck.testbed("Tests", function(testbed) {
      // Viewbox center and size
    testbed.x = 0;
    testbed.y = 0;

    // Viewbox size
    testbed.width = 30;
    testbed.height = 20;
    
    var pl = planck, Vec2 = pl.Vec2;

    var world = new pl.World({ gravity: Vec2(0, -10) });


    let groundBodyDef = {
        position: planck.Vec2(0.0, -10.0)
    };
    let groundBody = world.createBody(groundBodyDef);
    let groundBox = planck.Box(50.0, 10.0);

    groundBody.createFixture(groundBox, 0.0);
  


    let body = world.createBody({
        type: "dynamic",
        position: planck.Vec2(0.0, 4.0)
    });

    let dynamicBox = planck.Box(1.0, 1.0);

    let fixtureDef = {
        shape: dynamicBox,
        density: 2,
        friction: 0.3,
    }

    body.createFixture(fixtureDef);


    // var columnShape = pl.Box(0.1, 1);

    // var fd = {};
    // fd.density = 20;
    // fd.friction = 0.1;

    // for (var i = 0; i < 10; ++i) {
    //     var body1 = world.createDynamicBody(Vec2(-6 + 1 * i, 11.25));
    //     body1.createFixture(columnShape, fd);
    // }



    // world.createDynamicBody(Vec2(0.0, 2.5)).createFixture(pl.Circle(0.5), 10.0);
  
    // world.createDynamicBody(Vec2(0.0, 3.5)).createFixture(pl.Circle(0.5), 10.0);
  
    // var heavy = null;
  
    // function toggleHeavy() {
    //   if (heavy) {
    //     world.destroyBody(heavy);
    //     heavy = null;
    //   } else {
    //     heavy = world.createDynamicBody(Vec2(0.0, 9.0));
    //     heavy.createFixture(pl.Circle(5.0), 10.0);
    //   }
    // }
  
    testbed.keydown = function(code, char) {

    };

    return world;
  });
  