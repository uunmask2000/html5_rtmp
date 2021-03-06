const express = require('express')
const md5 = require('md5');
var fs = require('fs');
var path = require('path');
var cmd = require('node-cmd');
const app = express()
const port = 3000
const host = '192.168.0.116:8000';
// const host = 'c392abb4bc55.ngrok.io' ;

function set_cors(res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE'); // If needed
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type'); // If needed
    res.setHeader('Access-Control-Allow-Credentials', true); // If needed
    return res;
}

function resolveAfter2Seconds(video_url, dl_cmd) {
    return new Promise(resolve => {
        var syncData = cmd.run(dl_cmd);
        console.log(syncData)
        resolve({ video_url: video_url, syncData: "" });
        // return { video_url: video_url, syncData: syncData.data }
    });
}

async function asyncCall(req, video_url, res) {
    console.log('calling');
    let dl_cmd = "nohup youtube-dl -f mp4 -o 'MV/" + (req.params.url) + ".%(ext)s' " + video_url + ' >/dev/null 2>/dev/null &'
    const result = await resolveAfter2Seconds(video_url, dl_cmd);
    console.log(result);
    // expected output: "resolved"
    res.json(result)
}

app.use('/', express.static(__dirname + '/public'));
// app.get('/', (req, res) => {
//     res.send('Hello World!')
// })

app.get('/download_yt/:url', (req, res) => {
    let video_url = 'https://www.youtube.com/watch?v=' + req.params.url
    // let dl_cmd = "youtube-dl -f mp4 -o 'MV/%(title)s.f%(format_id)s.%(ext)s' " + video_url
    // let dl_cmd = "nohup youtube-dl -f 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/bestvideo+bestaudio' -o 'MV/" + (req.params.url) + ".%(ext)s' " + video_url + ' >/dev/null 2>/dev/null &'
    // var syncData = cmd.run(dl_cmd);
    // res.json({ video_url: video_url, syncData: syncData.data })
    asyncCall(req, video_url, res);
    // res.send('download video_url!' + video_url)
})


app.use('/static', express.static(__dirname + '/public'));

app.get('/all_mv', (req, res) => {

    res = set_cors(res);

    var readDir = fs.readdirSync("./MV");
    console.log(readDir);
    var vedio_list = [];

    readDir.forEach(element => {
        if (element.indexOf('.mp4')) {
            console.log(element.indexOf('.part'))
            if (element.indexOf('.part') == -1) {
                vedio_list.push({
                    name: element,
                    rmtp: 'rtmp://' + host + '/live/' + element.replace('.mp4', ''),
                    flv: 'http://' + host + '/live/' + element.replace('.mp4', '') + '.flv'
                });
            }

        }
    });

    res.json(vedio_list)
    // res.send('all_mv23' + readDir)
})

app.use('/mv/:id', function (req, res) {
    res = set_cors(res);

    console.log('ID:', req.params.id);
    var id = req.params.id;
    var playerName = id.replace('.mp4', '');
    var readDir = fs.readdirSync("./MV");
    if (!readDir.includes(id)) {
        res.send('mv is not online')
    }
    let cmd_type = false;
    var check_cmd = "ps ax | grep -v grep | grep 'rtmp://localhost/live/" + playerName + "'";
    console.log(check_cmd);
    const syncData = cmd.runSync(check_cmd);
    // console.log(syncData);
    if (syncData.data == null) {
        var cmd_line = 'nohup ffmpeg -threads 6 -re -i MV/' + id + ' -c copy -f flv rtmp://localhost/live/' + playerName + ' >/dev/null 2>/dev/null &'
        cmd.run(cmd_line);
        console.log(cmd_line);
    } else {
        cmd_type = true
    }

    var rmtp = 'rtmp://' + host + '/live/' + playerName
    var flv = 'http://' + host + '/live/' + playerName + '.flv'
    var json = {
        cmd: cmd_type,
        rmtp: rmtp,
        flv: flv
    }

    res.json(json)

});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})