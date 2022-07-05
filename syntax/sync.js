var fs = require('fs');

/*console.log('a');
var result = fs.readFileSync('syntax/sample.txt', 'utf8');
console.log(result);
console.log('c');
*/

console.log('a');
fs.readFile('syntax/sample.txt', 'utf8', function(err, result){
    console.log(result);
});

console.log('c');