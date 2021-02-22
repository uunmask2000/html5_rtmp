const express = require('express')
var fs = require('fs');
var path = require('path');
var cmd = require('node-cmd');
const app = express()
const port = 3000

function set_cors(res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE'); // If needed
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type'); // If needed
    res.setHeader('Access-Control-Allow-Credentials', true); // If needed
    return res;
}

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.use('/static', express.static(__dirname + '/public'));

app.get('/all_mv', (req, res) => {

    res = set_cors(res);

    var readDir = fs.readdirSync("./MV");
    console.log(readDir);
    var vedio_list = [];

    readDir.forEach(element => {
        if (element.indexOf('.mp4')) {
            vedio_list.push({
                name : element ,
                rmtp: 'rtmp://localhost/live/' + element.replace('.mp4', ''),
                flv: 'http://192.168.0.116:8000/live/' + element.replace('.mp4', '') + '.flv'
            });
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
    if (syncData.data == null) {
        var cmd_line = 'nohup ffmpeg -re -i MV/' + id + ' -c copy -f flv rtmp://localhost/live/' + playerName + ' >/dev/null 2>/dev/null &'
        cmd.run(cmd_line);
        console.log(cmd_line);
    } else {
        cmd_type = true
    }

    var rmtp = 'rtmp://192.168.0.116/live/' + playerName
    var flv = 'http://192.168.0.116:8000/live/' + playerName + '.flv'
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