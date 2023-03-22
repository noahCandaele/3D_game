export default class Dude {
    constructor(dudeMesh, speed) {
        this.dudeMesh = dudeMesh;

        if(speed)
            this.speed = speed;
        else
            this.speed = 1;

        // in case, attach the instance to the mesh itself, in case we need to retrieve
        // it after a scene.getMeshByName that would return the Mesh
        // SEE IN RENDER LOOP !
        dudeMesh.Dude = this;
    }

    move(scene) {
        // follow the tank
        let duck = scene.getMeshByName("voxel_duck");
        // let's compute the direction vector that goes from Dude to the tank
        let direction = duck.position.subtract(this.dudeMesh.position);

        // direction._x et direction._y déterminent la distance du tank par rapport au dude
        // peut être utile pour faire une simulation du dude qui voit notre tank au loin
        let distance = direction.length(); // we take the vector that is not normalized, not the dir vector
        //console.log(distance);

        let dir = direction.normalize();
        // angle between Dude and tank, to set the new rotation.y of the Dude so that he will look towards the tank
        // make a drawing in the X/Z plan to uderstand....
        let alpha = Math.atan2(-dir.x, -dir.z);
        this.dudeMesh.rotation.y = alpha;

        // let make the Dude move towards the tank
        if(distance > 30) {
            //a.restart();   
            this.dudeMesh.moveWithCollisions(dir.multiplyByFloats(this.speed, this.speed, this.speed));
        }
        else {
            //a.pause();
        }   
    }
}