var a = {
    v1 : 'v1',
    v2 : 'v2',
    f1 : function() {
        console.log(this.v1); // 객체 안에 함수를 담을 수 있고 객체 내의 변수나 메소드를 접근할 때는 this라고 한다.
    },
    f2 : function() {
        console.log(this.v2);
    }
}

a.f1();
a.f2();