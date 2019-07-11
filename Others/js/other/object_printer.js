String.prototype.hashCode = function() {
    var hash = 0, i, chr;
    if (this.length === 0) return hash;
    for (i = 0; i < this.length; i++) {
      chr   = this.charCodeAt(i);
      hash  = ((hash << 5) - hash) + chr;
      hash |= 0; // Convert to 32bit integer
    }
    return hash;
};

var traversedObject = (() => {
    const map = new WeakMap();
    const fxMap = {};

    return (object) => {
        if (typeof object === 'object') {
            if (!map.has(object)) {
                try {
                    map.set(object, 1);
                } catch (err) {}
                return false;
            }
            return true;
        } else if (typeof object === 'function') {
            object = object.toString().hashCode().toString();
            if (!fxMap[object]) {
                fxMap[object] = 1;
                return false;
            }
            return true;
        }
    };
})();

function printObject(object) {
    var output = '';
    var callObjs = [{root: "Panopto", obj: object}];
    while(callObjs.length > 0 && callObjs.length < 20000) {
        var kvp = callObjs.shift();
        if (kvp.obj && (typeof kvp.obj === 'object' || typeof kvp.obj === 'function')) {
            if (!traversedObject(kvp.obj)) {
                //var output = '';
                var props = Object.keys(kvp.obj);
                props.forEach((property) => {
                    output += `${kvp.root}.${property} (${typeof kvp.obj[property]})\n`;
                    let newObj = kvp.obj[property];
                    if(typeof newObj === 'object' || typeof newObj === 'function')
                        callObjs.push({root: `${kvp.root}.${property}`, obj: kvp.obj[property]});
                });
                //console.log(output);
            }
        }
    }
    console.info(output);
}

printObject(Panopto);