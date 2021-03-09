$(function(){
    /*建立socket连接，使用websocket协议，端口号是服务器端监听端口号*/
    // var socket = io('ws://localhost:8081'); //使用預設參數
    var socket = io('ws://localhost:8081',{
        'reconnectionAttempts': 5,  //最大重新連線次數5次
        'timeout': 3000, //連線3秒還沒有成功的話就跳connect_error
    });
    /*定义用户名*/
    var uname = null;

    //連線次數
    var connectTime = 0;

    //連接成功
    socket.on('connect',function(name){
        console.log('connect');
    })
    //連接失敗
    socket.on('connect_error',function(name){
        console.log('connect_error');
        if ( connectTime < 5) {
            connectTime ++;
        } else {
            socket.close();  //關閉連線(一定要再使用socket.open()才能重新開啟)
            console.log('Failed too many times, please check internet!');
        }
    })
    //重新連接中
    socket.on('reconnecting',function(name){
        console.log('reconnecting');
    })


    /*登录*/
    $('.login-btn').click(function(){
        uname = $.trim($('#loginName').val());
        if(uname){
            /*向服务端发送登录事件*/
            socket.emit('login',{username:uname});
        }else{
            alert('请输入昵称');
        }
    })

    /*登录成功*/
    socket.on('loginSuccess',function(data){
        if(data.username === uname){
            checkin();
        }else{
            alert('用户名不匹配，请重试');
        }
    })

    /*隐藏登录界面 显示聊天界面*/
    function checkin(){
        $('.login-wrap').hide('slow');
        $('.chat-wrap').show('slow');
    }

    /*登录失败*/
    socket.on('loginFail',function(){
        alert('昵称重复');
    })

    /*新人加入提示*/
    socket.on('add',function(data){
        var html = '<p>系统消息:'+data.username+'已加入群聊</p>';
        $('.chat-con').append(html);

        keepScrollDown();
    })

    /*有用戶退出群聊提示*/
    socket.on('leave',function(name){
        // console.log('leave :', name);
        if(name != null){
            var html = '<p>'+name+'已退出群聊</p>';
            $('.chat-con').append(html);

            keepScrollDown();
        }
    })

    /*发送消息*/
    $('.sendBtn').click(function(){
        sendMessage();
    });
    $(document).keydown(function(event){
        if(event.keyCode == 13){ //鍵盤enter
            sendMessage();
        }
    })
    function sendMessage(){
        var txt = $('#sendtxt').val();
        $('#sendtxt').val('');
        if(txt){
            socket.emit('sendMessage',{username:uname,message:txt});
        }
    }

    /*接收到訊息*/
    socket.on('receiveMessage',function(data){
        var html;
        if(data.username === uname){
            html = '<div class="chat-item item-right clearfix"><span class="img fr"></span><span class="message fr">'+data.message+'</span></div>'
        }else{
            html='<div class="chat-item item-left clearfix rela"><span class="abs uname">'+data.username+'</span><span class="img fl"></span><span class="fl message">'+data.message+'</span></div>'
        }
        $('.chat-con').append(html);

        keepScrollDown();
    })

    //保持卷軸在底部
    function keepScrollDown(){
        var scrollHeight = $('.chat-con')[0].scrollHeight;
        $('.chat-wrap').scrollTop(scrollHeight);
    }



})
