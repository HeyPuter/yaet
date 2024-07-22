#!/bin/bash
IFS='' read -r -d '' page <<"EOF"
<DOCTYPE html>
<html>
<head>
    <style>
        BODY { color: #FFF }
    </style>
</head>
<body>
    <h1>This is an HTML document!</h1>
</body>
</html>
EOF
echo -e "\x1B]21337;web-terminal;write-srcdoc;${page}\x1B\\"
# BUG: text renders under iframe without sleep
sleep 0.1
echo "this is text after"
