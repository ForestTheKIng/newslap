// This is a fun demo that shows off the wheel joint
planck.testbed('Car', function(testbed) {

    testbed.speed = 1.3;
    testbed.hz = 60;
  
    var pl = planck, Vec2 = pl.Vec2;
    var world = new pl.World({
        gravity : Vec2(0, -10)
    });

    var ground = world.createBody();
  
    var groundFD = {
        density : 0.0,
        friction : 0.6
    };
  
    ground.createFixture(pl.Edge(Vec2(-20.0, 0.0), Vec2(20.0, 0.0)), groundFD);
  
    var hs = [ 0.25, 1.0, 4.0, 0.0, 0.0, -1.0, -2.0, -2.0, -1.25, 0.0 ];
  
    var x = 20.0, y1 = 0.0, dx = 5.0;
  
    for (var i = 0; i < 10; ++i) {
      var y2 = hs[i];
      ground.createFixture(pl.Edge(Vec2(x, y1), Vec2(x + dx, y2)), groundFD);
      y1 = y2;
      x += dx;
    }
  
    for (var i = 0; i < 10; ++i) {
      var y2 = hs[i];
      ground.createFixture(pl.Edge(Vec2(x, y1), Vec2(x + dx, y2)), groundFD);
      y1 = y2;
      x += dx;
    }
  
    ground.createFixture(pl.Edge(Vec2(x, 0.0), Vec2(x + 40.0, 0.0)), groundFD);
  
    x += 80.0;
    ground.createFixture(pl.Edge(Vec2(x, 0.0), Vec2(x + 40.0, 0.0)), groundFD);
  
    x += 40.0;
    ground.createFixture(pl.Edge(Vec2(x, 0.0), Vec2(x + 10.0, 5.0)), groundFD);
  
    x += 20.0;
    ground.createFixture(pl.Edge(Vec2(x, 0.0), Vec2(x + 40.0, 0.0)), groundFD);
  
    x += 40.0;
    ground.createFixture(pl.Edge(Vec2(x, 0.0), Vec2(x, 20.0)), groundFD);
  
  
   
    // Boxes
    var box = pl.Box(0.5, 0.5);
  
    world.createDynamicBody(Vec2(230.0, 0.5))
        .createFixture(box, 0.5);
  
   
    testbed.keydown = function() {
        if (testbed.activeKeys.down) {

        } else if (testbed.activeKeys.up) {

        }
    };
  
    testbed.step = function() {
        if (testbed.activeKeys.right && testbed.activeKeys.left) {

        }
    };
    
    return world;
  });
  