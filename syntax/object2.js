var f = function() {
    console.log(1+1);
    console.log(2+2);
} // 자바스크립트에서 함수는 변수로 선언될 수 있다.

var a = [f]; // 배열로써 선언
a[0](); // == f();

var o = {
    func : f
} // 객체로써 선언
o.func(); // == f();