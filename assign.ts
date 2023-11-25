export default function assign(target: Object, obj: Object) {
    Object.keys(obj).forEach(key => {
        if (obj.hasOwnProperty(key)) {
            if (typeof obj[key] !== 'undefined') {
                target[key] = obj[key];
            }
        }
    });
}