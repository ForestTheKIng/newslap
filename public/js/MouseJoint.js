class MouseJoint {
    constructor(box, anchorPosition) {


        let groundBody = world.createBody();

        // this.mouseJointDef = {
        //     bodyA: groundBody,
        //     bodyB: box.body
        // };

        // this.mouseJointDef.target.set(anchorPosition);

        // this.mouseJointDef.maxForce = 1000;

        // this.mouseJointDef.frequencyHz = 5.0;
        // this.mouseJointDef.dampingRatio = 1.0;
        // this.mouseJointDef.target = anchorPosition;

        this.mouseJoint = new pl.MouseJoint({maxForce: 1000}, groundBody, box.body, Vec2.clone(anchorPosition));
        world.createJoint(this.mouseJoint);

        // this.joint = world.createJoint(pl.MouseJoint({
        //     bodyA: groundBody,
        //     bodyB: box.body,
        //     target: anchorPosition,
        //     frequencyHz: 5,
        //     dampingRatio: 1
        // }));


        // this.joint = world.createJoint(this.mouseJointDef);
    }

    // destroyJoint() {
    //     world.destroyJoint(this.joint);
    // }

    // update(position) {
    //     this.joint.setTarget(position);
    // }

}