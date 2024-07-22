#!/bin/bash
IFS='' read -r -d '' page <<"EOF"
<DOCTYPE html>
<html>
<head>
    <style>
        BODY {
            color: #FFF;
            margin: 0;
            padding: 0;
            background-color: #3ead74;
            font-family: 'Noto Sans';
            width: 100%;
            text-align: center;
            overflow: hidden;
        }
        H1 {
            text-align: center;
            margin-top: 70px;
            transform: rotate(20deg);
        }
    </style>
</head>
<body>
    <h1>Does your terminal do this?</h1>
</body>
</html>
EOF
echo -e "\x1B]21337;web-terminal;write-srcdoc;${page}\x1B\\"
# BUG: text renders under iframe without sleep
sleep 0.2
echo -e "\x1B]21337;web-terminal;write-srcdoc?height=50;${page}\x1B\\"
# BUG: text renders under iframe without sleep
sleep 0.1
echo "Maybe you should try YAET!"
