

export function distance (a, b) {
    return Math.sqrt(Math.pow(Math.abs(a[0] - b[0]), 2) + Math.pow(Math.abs(a[1] - b[1]), 2));
}

export function random (min, max, precision=1) {
    return Math.floor(Math.random() * precision * (max - min)) / precision + min;
}
