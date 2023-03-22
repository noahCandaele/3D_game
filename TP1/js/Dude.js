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
        this.dx = 0;
        this.dz = -1;
        dudeMesh.Dude = this;

    }

    move(scene) {
        // follow the tank
        let house = scene.getMeshByName("house");
        if(!house) return;
        let bounds = house.getBoundingInfo();
        var size_x = Math.abs(bounds.minimum.x - bounds.maximum.x);
        var size_z = Math.abs(bounds.minimum.z - bounds.maximum.z);
        console.log("house sizex: "+size_x);
        console.log("house sizez: "+size_z);
        console.log("house posx: "+house.position.x);
        console.log("house posz: "+house.position.z);
        // // let's compute the direction vector that goes from Dude to the tank
        // let direction = duck.position.subtract(this.dudeMesh.position);

        // // direction._x et direction._y déterminent la distance du tank par rapport au dude
        // // peut être utile pour faire une simulation du dude qui voit notre tank au loin
        // let distance = direction.length(); // we take the vector that is not normalized, not the dir vector
        // //console.log(distance);

        // let dir = direction.normalize();
        // // angle between Dude and tank, to set the new rotation.y of the Dude so that he will look towards the tank
        // // make a drawing in the X/Z plan to uderstand....
        // let alpha = Math.atan2(-dir.x, -dir.z);
        // this.dudeMesh.rotation.y = 90;

        // // let make the Dude move towards the tank
        // if(distance > 30) {
        //     //a.restart(); 
        if(this.dudeMesh.position.z < -40 && this.dz == -1) {
            this.dz = 0;
            this.dx = 1;
            this.dudeMesh.rotation.y = -90;
        }else if(this.dudeMesh.position.x > 100 && this.dx == 1) {
            this.dz = 1;
            this.dx = 0;
            this.dudeMesh.rotation.y = 180;
        }else if(this.dudeMesh.position.z > 40 && this.dz == 1) {
            this.dz = 0;
            this.dx = -1;
            this.dudeMesh.rotation.y = 90;
        }else if(this.dudeMesh.position.x < 0 && this.dx == -1) {
            this.dz = -1;
            this.dx = 0;
            this.dudeMesh.rotation.y = 0;
        }
        this.dudeMesh.position.z += this.dz * this.speed;
        this.dudeMesh.position.x += this.dx * this.speed;

        console.log("dude posx: "+this.dudeMesh.position.x);
        console.log("dude posz: "+this.dudeMesh.position.z);
        // }
        // else {
        //     //a.pause();
        // }   
    }
}