
/*构建http服务*/
var app = require('http').createServer()
/*引入socket.io*/
var io = require('socket.io')(app);
/*定义监听端口，可以自定义，端口不要被占用*/
var PORT = 8081;
/*监听端口*/
app.listen(PORT);

/*定义用户数组*/
var users = [];

//引入自定义 資料庫連線 的模块
var db = require('../app/db');  

io.on('connection', function (socket) {
    /*是否是新用户标识*/
    var isNewPerson = true; 
    /*当前登录用户*/
    var username = null;

    /*监听登录*/
    socket.on('login',function(data){
        for(var i=0;i<users.length;i++){
            if(users[i].username === data.username){
                  isNewPerson = false
                  break;
            }else{
                  isNewPerson = true
            }
        }

        if(isNewPerson){
            username = data.username
            users.push({
              username:data.username
            })
            /*登录成功*/
            socket.emit('loginSuccess',data)
            /*向所有连接的客户端广播add事件*/
            io.sockets.emit('add',data)
        }else{
            /*登录失败*/
            socket.emit('loginFail','')
        }
    })

    /*退出登录 (斷線時也會自動傳來事件) */
    socket.on('disconnect',function(){
        /*向所有连接的客户端广播leave事件*/
        io.sockets.emit('leave',username)
        //用户数组里面删除退出的用户
        users.map( function(val,index){
            if(val.username === username){
                users.splice(index,1);
            }
        })
    })

    //收到使用者發訊息
    socket.on('sendMessage',function(data){
        //存入資料庫
        var sql = 'INSERT INTO chat_records(user,chat) VALUES("'+data.username+'","'+data.message+'")';
        db.query(sql, [],function(results,fields){});

        io.sockets.emit('receiveMessage',data)
    })


})

console.log('app listen at'+PORT);
