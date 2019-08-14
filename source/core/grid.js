"use strict";
module.exports = class Grid {
    constructor(binSize) {
        this.binSize = binSize;
        this.grid = new Map();
    }

    insert(data, rect) {
        var pMin = this.getKey(rect.minX, rect.minZ),
            pMax = this.getKey(rect.maxX, rect.maxZ);
        for (var x = pMin.x; x <= pMax.x; x++) {
            for (var z = pMin.z; z <= pMax.z; z++) {
                let key = x + "-" + z;
                if (!this.grid.has(key)) this.grid.set(key, []);
                this.grid.get(key).push(data)
            }
        }
        data._hashPMin = pMin;
        data._hashPMax = pMax;
    }

    delete(data) {
        for (var x = data._hashPMin.x; x <= data._hashPMax.x; x++) {
            for (var z = data._hashPMin.z; z <= data._hashPMax.z; z++) {
                let key = x + "-" + z;
                let cell = this.grid.get(key);
                let index = cell.indexOf(data);
                if (index != -1) cell.splice(index, 1);
            }
        }
        data._hashPMin = data._hashPMax = null;
    }

    retrieve(rect) {
        var results = new Map();
        var pMin = this.getKey(rect.minX, rect.minZ),
            pMax = this.getKey(rect.maxX, rect.maxZ);
        for (var x = pMin.x; x <= pMax.x; x++) {
            for (var z = pMin.z; z <= pMax.z; z++) {
                var key = x + "-" + z;
                var cell = this.grid.get(key);
                if (cell) {
                    for (var i = 0; i < cell.length; i++) {
                        results.set(cell[i].id, cell[i]);
                    }
                }
            }
        }
        return results;
    }

    update(data, rect) {
        var pMin = this.getKey(rect.minX, rect.minZ),
            pMax = this.getKey(rect.maxX, rect.maxZ);
        if (pMin.x !== data._hashPMin.x || pMin.z !== data._hashPMin.z || pMax.x !== data._hashPMax.x || pMax.z !== data._hashPMax.z) {
            this.delete(data);
            this.insert(data, rect);
        }
    }



    getKey(x, z) {
        return {x: Math.floor(x / this.binSize), z: Math.floor(z / this.binSize)};
    }
}
