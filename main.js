var http = require('http');
var fs = require('fs');
var url = require('url');
var qs = require('querystring');
var template = require('./lib/template.js'); // 외부에 모듈 생성 후 호출
var path = require('path');
var sanitizeHtml = require('sanitize-html');
 
var app = http.createServer(function(request,response){
    var _url = request.url; // 요청한 url을 담아두는 변수
    var queryData = url.parse(_url, true).query; // url에서 쿼리데이터 받아오기
    var pathname = url.parse(_url, true).pathname; // url에서 pathname(경로) 받아오기
    if(pathname === '/'){ // pathname이 '/'라면, 즉 폴더 내의 주소라면
      if(queryData.id === undefined){ // querydata가 없다면, 즉 선택된 파일이 없다면
        fs.readdir('./data', function(error, filelist){ // data 디렉터리 내의 filelist를 읽어오고
          var title = 'Welcome'; // 제목
          var description = 'Hello, Node.js'; // 본문
          var list = template.list(filelist); // 리스트
          var html = template.HTML(title, list, 
            `<h2>${title}</h2>${description}`,
            `<a href="/create">create</a>`
          );
            response.writeHead(200);
            response.end(html);
          });
      } else { // querydata가 있다면, 선택된 리스트 파일이 있다면
          fs.readdir('./data', function(error, filelist){ // data 디렉터리 내의 filelist를 읽어오고
            var filteredId = path.parse(queryData.id).base; // 사용자가 상위 경로로 접근하는 것을 막아줌
            fs.readFile(`data/${filteredId}`, 'utf8', function(err, description){ // 파일 자체도 읽어온다
              var title = queryData.id;
              var sanitizedTitle = sanitizeHtml(title);
              var sanitizedDescription = sanitizeHtml(description, {
                allowedTags:['h1']
              });
              var list = template.list(filelist);
              var html = template.HTML(title, list,
                `<h2>${sanitizedTitle}</h2>${sanitizedDescription}`,
                `<a href="/create">create</a>
                <a href="/update?id=${sanitizedTitle}">update</a>
                <form action = "delete_process" method = "post">
                  <input type = "hidden" name = "id" value = "${sanitizedTitle}">
                  <input type = "submit" value = "delete">
                </form>` // 생성, 수정, 삭제 링크
              );
              response.writeHead(200); // 올바른 경로로 잘 통신이 되었을 때
              response.end(html);
            });
          });
        }
    } else if(pathname === '/create'){ // create 링크를 눌렀다면
        fs.readdir('./data', function(error, filelist){ // data 디렉터리 내의 filelist를 읽어오고
          var title = 'WEB - create';
          var list = template.list(filelist);
          var html = template.HTML(title, list, `
            <form action="/create_process" method="post">
              <p><input type="text" name="title" placeholder="title"></p>
              <p>
                <textarea name="description" placeholder="description"></textarea>
              </p>
              <p>
                <input type="submit">
              </p>
            </form>
          `, ''); // form input으로 입력을 받고 post 방식으로 /create_process 로 넘긴다.
            response.writeHead(200);
            response.end(html);
          });
    } else if(pathname === '/create_process'){ // 입력 등록을 하고 넘어갔을 때
      var body = '';
      request.on('data', function(data){
          body = body + data;
      });
      request.on('end', function(){
          var post = qs.parse(body);
          var title = post.title;
          var description = post.description;
          fs.writeFile(`data/${title}`, description, 'utf8', function(err){
            response.writeHead(302, {Location: `/?id=${title}`}); // 302는 리다이렉션을 의미 (생성된 파일을 바로 페이지에 뿌려주기)
            response.end();
          })
      });
    } else if(pathname === '/update'){ // update 링크를 눌렀을 때
      fs.readdir('./data', function(error, filelist){
        var filteredId = path.parse(queryData.id).base;
        fs.readFile(`data/${filteredId}`, 'utf8', function(err, description){
          var title = queryData.id;
          var list = template.list(filelist);
          var html = template.HTML(title, list,
            `
            <form action="/update_process" method="post">
              <input type="hidden" name="id" value="${title}">
              <p><input type="text" name="title" placeholder="title" value="${title}"></p>
              <p>
                <textarea name="description" placeholder="description">${description}</textarea>
              </p>
              <p>
                <input type="submit">
              </p>
            </form>
            `,
            `<a href="/create">create</a> <a href="/update?id=${title}">update</a>`
          );
            response.writeHead(200);
            response.end(html);
          });
      });
    } else if(pathname === '/update_process') { // update 처리
      var body = '';
      request.on('data', function(data){
          body = body + data;
      });
      request.on('end', function(){
          var post = qs.parse(body);
          var id = post.id;
          var title = post.title;
          var description = post.description;
          fs.rename(`data/${id}`, `data/${title}`, function(error){ // 파일의 이름을 바꿔주는 메소드
            fs.writeFile(`data/${title}`, description, 'utf8', function(err){
            response.writeHead(302, {Location: `/?id=${title}`}); // 수정된 페이지로 리다이렉션
            response.end();
          })
        });
      });
    } else if(pathname === '/delete_process') { // 삭제 처리
        var body = '';
        request.on('data', function(data){
          body = body + data;
        });
        request.on('end', function(){
          var post = qs.parse(body);
          var id = post.id;
          var filteredId = path.parse(id).base;
          fs.unlink(`data/${filteredId}`, function(error){ // 파일 삭제
            response.writeHead(302, {Location: `/`});
          })
        });
    } else {
        response.writeHead(404); // 다 아니라면 존재하지 않는 파일을 참조한 것이므로 404 에러
        response.end('Not found'); // Not Found
      }
});
app.listen(3000);