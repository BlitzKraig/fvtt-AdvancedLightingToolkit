class ALTUtilities {
    arraysEqual = (arr1, arr2) => {
        if (arr1.length !== arr2.length)
            return false;
        for (var i = arr1.length; i--;) {
            if (arr1[i] !== arr2[i])
                return false;
        }

        return true;
    };
    randRange = (min, max) => {
        return min + Math.ceil(Math.random() * (max - min));
    };
    scale = (num, in_min, in_max, out_min, out_max) => {
        return (num - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
    };
    fillArray = (length, fillValue) => {
        var arr = [];
        while (length--) {
            arr[length] = fillValue;
        }
        return arr;
    };
    /* beautify ignore:start */
    safeStringify = (obj, indent = 2) => {
        let cache = [];
        const retVal = JSON.stringify(
          obj,
          (key, value) =>
            typeof value === "object" && value !== null
              ? cache.includes(value)
                ? undefined // Duplicate reference found, discard key
                : cache.push(value) && value // Store value in our collection
              : value,
          indent
        );
        cache = null;
        return retVal;  
    }
}