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
            background-color: #000000;
            font-family: 'Noto Sans';
            font-size: 14px;
            height: 100%;
            width: 100%;
            text-align: center;
            overflow: hidden;
        }
        .wrapper {
            display: flex;
            flex-direction: column;
            height: 100%;
            width: 100%;
            justify-content: space-between;
        }
        input[type=button] {
            height: 40px;
            font-size: 20px;
        }
        #btn_blue {
            background-color: blue;
        }
        #btn_red {
            background-color: red;
        }
    </style>
    <script>
        document.addEventListener('DOMContentLoaded', () => {
            document
                .getElementById('btn_blue')
                .addEventListener('click', () => {
                    window.parent.postMessage({
                        command: 'write-stdin',
                        text: 'b',
                    });
                });
            document
                .getElementById('btn_red')
                .addEventListener('click', () => {
                    window.parent.postMessage({
                        command: 'write-stdin',
                        text: 'r',
                    });
                });
        });
    </script>
</head>
<body>
    <div class="wrapper">
        <input value="blue pill" type="button" id="btn_blue" />
        <input value="red pill" type="button" id="btn_red" />
    </div>
</body>
</html>
EOF
echo -e "\x1B]21337;web-terminal;write-srcdoc?height=80;${page}\x1B\\"
# BUG: text renders under iframe without sleep

read -rsn 11 val

action=${val:8:1}

[ "$action" == "b" ] && echo "The Matrix has you..."
[ "$action" == "r" ] && echo "Follow the white rabbit."

echo "Received: $action"

echo -e "\x1B]21337;web-terminal;detach-all\x1B\\"
