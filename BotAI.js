module.exports = class BotAI {
    constructor(client) {
        client.on('updateInput', this.update.bind(client));
    }
    update() {
        var myEntity = this.myEntity;
        if (!myEntity) return;

        const targetPlayers = false;
        const avoidFlails = true;
        const avoidIntersections = true;
        const eatStuff = false;

        var closest, closestDist = Infinity;
        var closestEnemyBall, closestEnemyBallDist = Infinity;
        var runAwayEnemies = [];
        var runAwayIntersections = [];
        for (var i in this.entities) {
            var e = this.entities[i];
            if (e.nick == "Cr4xy" || e.nick == "forsen") continue;
            if ((!e.nick || (targetPlayers && e.id !== myEntity.id)) && eatStuff) {
                var dx = myEntity.dstX - e.dstX;
                var dy = myEntity.dstY - e.dstY;
                var dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < closestDist && dist >= 50) {
                    closest = e;
                    closestDist = dist;
                }
            }

            if ((avoidFlails || avoidIntersections) && e.id !== myEntity.id && e.flailX) {
                var dx = myEntity.dstX - e.flailDstX;
                var dy = myEntity.dstY - e.flailDstY;
                var dist = Math.sqrt(dx * dx + dy * dy);
                if (e.attracting)
                {
                    var flailDirX = e.dstX - e.flailDstX;
                    var flailDirY = e.dstY - e.flailDstY;
                    var len = Math.sqrt(flailDirX * flailDirX + flailDirY * flailDirY);
                    flailDirX /= len;
                    flailDirY /= len;
                    var flailClosestX = flailDirX * Math.min(dist, len);
                    var flailClosestY = flailDirY * Math.min(dist, len);

                    var intersectionDx = myEntity.dstX - (e.flailDstX + flailClosestX);
                    var intersectionDy = myEntity.dstY - (e.flailDstY + flailClosestY);
                    var distToIntersection = Math.sqrt(intersectionDx * intersectionDx + intersectionDy * intersectionDy);

                    if (distToIntersection < 300) {
                        runAwayIntersections.push({ e: e, flailClosestX: flailClosestX, flailClosestY: flailClosestY });
                    }
                }

                dist -= e.flailDstRadius;
                if (dist < closestEnemyBallDist) {
                    closestEnemyBall = e;
                    closestEnemyBallDist = dist;
                }
                if (avoidFlails && dist < 300) {
                    runAwayEnemies.push(e);
                }
            }
        }
        if (1) {
            var runAwayAngles = [];
            for (var i in runAwayEnemies) {
                var e = runAwayEnemies[i];
                dx = myEntity.dstX - e.flailDstX;
                dy = myEntity.dstY - e.flailDstY;
                var dist = Math.sqrt(dx * dx + dy * dy);
                dx /= dist;
                dy /= dist;
                var angle = Math.atan(-dy / dx);
                if (0 > dx) angle += Math.PI;
                angle += Math.PI / 2;
                runAwayAngles.push(angle);
            }
            for (var i in runAwayIntersections) {
                var ie = runAwayIntersections[i];
                var e = ie.e;
                dx = myEntity.dstX - (e.flailDstX + ie.flailClosestX);
                dy = myEntity.dstY - (e.flailDstY + ie.flailClosestY);
                var dist = Math.sqrt(dx * dx + dy * dy);
                dx /= dist;
                dy /= dist;
                var angle = Math.atan(-dy / dx);
                if (0 > dx) angle += Math.PI;
                angle += Math.PI / 2;
                runAwayAngles.push(angle);
            }
            if (runAwayAngles.length > 0) {
                var avgAngle = runAwayAngles.reduce((a, v) => a + v, 0) / runAwayAngles.length;
                this.inputAngle = avgAngle;
                this.throttle = true;
            } else if (closest) {
                var dx = closest.dstX - myEntity.dstX;
                var dy = closest.dstY - myEntity.dstY;
                var dist = Math.sqrt(dx * dx + dy * dy);
                dx /= dist;
                dy /= dist;
                if (dist > 0) {
                    var angle = Math.atan(-dy / dx);
                    if (0 > dx) angle += Math.PI;
                    angle += Math.PI / 2;
                    this.inputAngle = angle;
                    this.throttle = true;
                }
            }
        }
    }
}