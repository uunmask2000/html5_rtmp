#
# sudo npm install pm2 -g
use pm2
EX : pm2 start app.js --watch
$ pm2 start  <app_name|namespace|id|'all'|json_conf>
$ pm2 list
$ pm2 stop     <app_name|namespace|id|'all'|json_conf>
$ pm2 restart  <app_name|namespace|id|'all'|json_conf>
$ pm2 delete   <app_name|namespace|id|'all'|json_conf>