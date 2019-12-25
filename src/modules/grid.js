"use strict";
module.exports = class Grid {
    constructor(binSize) {
        this.binSize = binSize;
        this.grid = new Map();
    }

    insert(data, rect) {
        const pMin = this.getKey(rect.minX, rect.minZ),
            pMax = this.getKey(rect.maxX, rect.maxZ);
        for (let x = pMin.x; x <= pMax.x; x++) {
            for (let z = pMin.z; z <= pMax.z; z++) {
                let key = x + "-" + z;
                if (!this.grid.has(key)) this.grid.set(key, []);
                this.grid.get(key).push(data);
            }
        }
        data._hashPMin = pMin;
        data._hashPMax = pMax;
    }

    delete(data) {
        for (let x = data._hashPMin.x; x <= data._hashPMax.x; x++) {
            for (let z = data._hashPMin.z; z <= data._hashPMax.z; z++) {
                let key = x + "-" + z;
                let cell = this.grid.get(key);
                let index = cell.indexOf(data);
                if (index != -1) cell.splice(index, 1);
            }
        }
        data._hashPMin = data._hashPMax = null;
    }

    retrieve(rect) {
        const results = new Map();
        const pMin = this.getKey(rect.minX, rect.minZ),
            pMax = this.getKey(rect.maxX, rect.maxZ);
        for (let x = pMin.x; x <= pMax.x; x++) {
            for (let z = pMin.z; z <= pMax.z; z++) {
                const key = x + "-" + z;
                const cell = this.grid.get(key);
                if (cell) {
                    for (let i = 0; i < cell.length; i++) {
                        results.set(cell[i].id, cell[i]);
                    }
                }
            }
        }
        return results;
    }

    update(data, rect) {
        const pMin = this.getKey(rect.minX, rect.minZ),
            pMax = this.getKey(rect.maxX, rect.maxZ);
        if (pMin.x !== data._hashPMin.x || pMin.z !== data._hashPMin.z || pMax.x !== data._hashPMax.x || pMax.z !== data._hashPMax.z) {
            this.delete(data);
            this.insert(data, rect);
        }
    }



    getKey(x, z) {
        return {x: Math.floor(x / this.binSize), z: Math.floor(z / this.binSize)};
    }
};
