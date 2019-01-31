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

  var messageId;
  var roomId;
  var lat;
  var lng;
  var maxIndex;
  var selectShopName = [];
  var selectShopUrl = [];
  var selectAnsCount = [];

  var gurunaviAPI = 'e0c8d42fc13d93b856b036308c97368c';//取得したアクセスキー
  var url = 'https://api.gnavi.co.jp/RestSearchAPI/v3/?keyid=e0c8d42fc13d93b856b036308c97368c&latitude=36.228067&longitude=137.969049&hit_per_page=100';
  var distance_url = 'https://vldb.gsi.go.jp/sokuchi/surveycalc/surveycalc/bl2st_calc.pl?outputType=json&ellipsoid=bessel&amp;'
  // console.log(url);
  // url = url + 'keyid='+ gurunaviAPI;
  // url = url + '&freeword=ラーメン';

  robot.respond(/PING$/i, (res) => {
    res.send('PONG');
  });

  robot.hear(/らんちーむ$/i, (resp) => {
    resp.send("今ココスタンプを押してください");
    robot.hear('map', (res) => {
      // res.send(`Your location is ${res.json.place} at ${res.json.lat}, ${res.json.lng}`);
      let lat = res.json.lat;
      let lng = res.json.lng;
      url = url + '&latitude='+lat+'&longitude='+lng + '&lunch=1';

      const req = https.request(url, (res) => {
        // console.log(res);
        let body = '';
        res.setEncoding('utf8');
        res.on('data', (chunk) => {
          body += chunk;
        });
        res.on('end', () => {
          res = JSON.parse(body);
          
          var num = Object.keys(res.rest).length
          while (num) {
            var i = Math.floor(Math.random() * num);
            var str = res.rest[--num];
            res.rest[num] = res.rest[i];
            res.rest[i] = str;
          }

          for (let i = 0; i < 5; i++) { 
            // console.log(res.rest[i].name);

            var distance_url_req = distance_url + 'latitude1=' + lat + '&amp;longitude1=' + lng + '&amp;latitude2=' + res.rest[i].latitude + '&amp;longitude2=' + res.rest[i].longitude;
            console.log(distance_url_req);
            // 送る
            const req_dis = https.request(distance_url_req, (res_dis) => {
              // console.log(res);
              let body_dis = '';
              res_dis.setEncoding('utf8');
              res_dis.on('data', (chunk_dis) => {
                body_dis += chunk_dis;
              });
              res_dis.on('end', () => {
                console.log(body_dis);
                res_dis = JSON.parse(body_dis);
               
                console.log('距離:' + res_dis.OutputData.geoLength);
                resp.send(res.rest[i].name + '\n' + '(' + res.rest[i].category + ')' +'\n' + '(予算'+ (res.rest[i].lunch||res.rest[i].budget) +'円・距離' + res_dis.OutputData.geoLength + 'm)' + '\n'+ res.rest[i].url);
            
              });
            });

            req_dis.on('error', (e) => {
              console.error(`problem with request: ${e.message}`);
            });
        
            

            req_dis.end();
          }
          // sendSelectButton(res, resp);
          // countAnswer(res);
          setTimeout(() => {
            sendSelectButton(res, resp);
            countAnswer(res);
          }, 5000)
          setTimeout(() => {
            robot.send({ room: roomId }, {close_select: messageId});
            culcMaxCount(selectAnsCount);
            // console.log(selectAnsCount);
            robot.send({ room: roomId }, { text:`*** アンケート結果 *** \n今日のお昼は${selectShopName[maxIndex]}に決まりました！\n${selectShopUrl[maxIndex]}`});
            // console.log(selectAnsCount);
          }, 15000)
            
        });
      })
  
      req.on('error', (e) => {
        console.error(`problem with request: ${e.message}`);
      });
  
      req.end();
    });
    
    
    
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
    for(let i = 0; i < res.rest.length; i++){
    	selectShopName[i] = res.rest[i].name;
    	selectShopUrl[i] = res.rest[i].url;
    }
  }

  function countAnswer(res){
  	for(let i = 0; i < selectShopName.length; i++){
  		selectAnsCount[i] = 0;
  	}
  	robot.hear('select', (res) => {
  		for(let i = 0; i < selectShopName.length; i++){
  			if(res.json.options[res.json.response] == selectShopName[i]){
  				selectAnsCount[i]++;
  			}
  		}
	});
  }

	function culcMaxCount(countArray){
		maxIndex = 0;
		for(let i = 0; i < countArray.length; i++){
			if(selectAnsCount[i] > countArray[maxIndex]){
				maxIndex = i;
			}
		}
		console.log(maxIndex);
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
