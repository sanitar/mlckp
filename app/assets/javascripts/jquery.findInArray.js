jQuery.findInArray = function (arr, fn) {
    for (var i = 0, len = arr.length; i < len; i++){
        if (fn(arr[i], i)){
            return arr[i];
        }
    }
    return -1;
}
