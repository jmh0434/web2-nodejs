var members = ['Mike', 'Ethan', 'Jay'];
console.log(members[0]);

var roles =  {
    'Engineer' : 'Mike',
    'Designer' : 'Ethan',
    'Manager' : 'Jay'
};

console.log(roles.Designer);

for (var name in roles) {
    console.log(name,roles[name]);
}