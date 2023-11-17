// https://stackoverflow.com/a/196991/4334568
export function toTitleCase(str) {
    return str.replace(
        /\w\S*/g,
        function(txt) {
            return txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase();
        }
    );
}
