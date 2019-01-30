// Description:
//   Utility commands surrounding Hubot uptime.
//
// Commands:
//   ping - Reply with pong
//   echo <text> - Reply back with <text>
//   time - Reply with current time
'use strict';

module.exports = (robot) => {
  const https = require('https');
 

  var gurunaviAPI = 'e0c8d42fc13d93b856b036308c97368c';//取得したアクセスキー
  var url = 'https://api.gnavi.co.jp/RestSearchAPI/v3/?keyid=e0c8d42fc13d93b856b036308c97368c&latitude=36.228067&longitude=137.969049&hit_per_page=5';
  console.log(url);
  // url = url + 'keyid='+ gurunaviAPI;
  // url = url + '&freeword=ラーメン';

  robot.respond(/PING$/i, (res) => {
    res.send('PONG');
  });

  robot.respond(/らんちーむお昼探して$/i, (resp) => {
    const req = https.request(url, (res) => {
      // console.log(res);
      let body = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        res = JSON.parse(body);
        for (let i = 0; i < Object.keys(res.rest).length; i++) { 
          console.log(res.rest[i].name);
          resp.send(res.rest[i].name + '\n' + res.rest[i].category + '\n' + res.rest[i].url);
        }
        sendSelectButton(res, resp);
        setTimeout(() => {
          robot.send({ room: roomId }, {close_select: messageId});
        }, 6000)
          
      });
    })

    req.on('error', (e) => {
      console.error(`problem with request: ${e.message}`);
    });

    req.end();
    
    
  });

  function sendSelectButton(res, resp){
    resp.send({
        question: 'この周辺のお店でどこがいいか',
        options: [res.rest[0].name, res.rest[1].name, res.rest[2].name,res.rest[3].name,res.rest[4].name], //ここにAPIからの5件を格納
        closing_type: 1, //0 => 1人が回答, 1 => 全員が回答
        onsend: (sent) => {
            //res.send(`completed. messageId: ${sent.message.id}`); //デバッグ用
            messageId = sent.message.id;
        }
    });
    //res.send(`This room id is ${res.message.room}`); //デバッグ用
    roomId = resp.message.room;
  }

  robot.respond(/ADAPTER$/i, (res) => {
    res.send(robot.adapterName);
  });

  robot.respond(/ECHO (.*)$/i, (res) => {
    res.send(res.match[1]);
  });

  robot.respond(/TIME$/i, (res) => {
    res.send(`Server time is: ${new Date()}`);
  });
};
