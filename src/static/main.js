var dropZone = document.getElementById('jsonContainer');
var info = document.getElementById('info');

var infoJson = undefined;
var fileName = ".json";

function handleFileDragStart(e) {
    e.stopPropagation();
    e.preventDefault();
}

function handleFileDragEnter(e) {
    e.stopPropagation();
    e.preventDefault();
    this.classList.add('hovering');
}

function handleFileDragLeave(e) {
    e.stopPropagation();
    e.preventDefault();
    this.classList.remove('hovering');
}

function handleFileDragOver(e) {
    e.stopPropagation();
    e.preventDefault();
}

function handleFileDrop(e) { // TODO 代码优化
    e.stopPropagation();
    e.preventDefault();
    infoJson = undefined;

    this.classList.remove('hovering');

    info.classList.remove('error');
    info.innerHTML = "";

    var files = e.dataTransfer.files;
    var outputStr = [];
    // 放入一个文件
    if (files.length == 0) {
        info.classList.add('error');
        info.innerHTML = "拖放是要一个文件";
        return;
    }

    if (files.length > 1) {
        info.classList.add('error');
        info.innerHTML = "只能放入一个文件";
        return;
    }
    // 判断文件是json结尾
    var pattern = /.json/i;
    var file = files[0];
    fileName = file.name;
    if (!pattern.test(file.name)) {
        info.classList.add('error');
        info.innerHTML = "需要放入一个.json结尾文件";
        return;
    }

    // json解析
    var reader = new FileReader();
    reader.readAsText(file, 'utf-8');

    reader.onerror = function() {
        info.innerHTML = "不能读取文件, 错误编码 " + reader.error.code;
    };
    reader.onprogress = function(event) {
        // if (event.lengthComputable) {
        //     info.innerHTML = event.loaded + "/" + event.total + " ";
        // }
    };
    reader.onload = function() {
        var fileText = reader.result;
        // var jsonText = JSON.stringify(fileText);
        infoJson = JSON.parse(fileText);
        info.innerHTML = "成功读取文件,共" + GetJsonLength(infoJson) + "个";
        var str = "";
        // dropZone.innerHTML = str;

        // 进行布局
        JsonLayout();
    };
};

function GetJsonLength(json) {
    if (typeof(json) == 'number') {
        return 1;
    } else if (json.length == undefined) {
        var count = 0;
        for (var key in json) {
            count++;
        }
        return count;
    } else {
        return json.length;
    }
}

function WriteInfo(msg, errorFlag) {

    info.classList.remove('error');
    info.innerHTML = "";
    if (errorFlag) {
        info.classList.add('error');
    }

    info.innerHTML = msg;
}

function GetJsonType(json) {

    console.log(typeof(json));
    if (typeof(json) == 'object') {
        if (json instanceof Array) {
            return 'Array';
        } else {
            return 'Object';
        }
    } else {
        return typeof(json);
    }
}

function JsonLayout() {
    var html = "";
    if (typeof(infoJson) == "undefined") {
        return;
    }

    if (GetJsonType(infoJson) != 'Array') {
        WriteInfo("json要是数组json,最外层加个[]", true);
        return;
    }
    // TODO适应各种json
    var keyPath = "";
    for (var i = 0; i < GetJsonLength(infoJson); i++) {
        keyPath = i + "";
        html += "<div class='cardDiv cardSize_small'>";
        html += "<div id='cardHead'>";
        html += "<button class='editBtn' id='editBtn" + i + "' onclick='PresEditBtn(" + i + ")'>编辑</button>";
        html += "</div>";
        html += "<div id='cardContainer'>";
        // 进行布局
        for (var key in infoJson[i]) {

            html += "<lable for='" + key + i + "'><b>" + key + ":</b></lable>";
            var jsonType = GetJsonType(infoJson[i][key]);
            if (jsonType == 'string' || jsonType == 'number') {
                html += " <input id='" + key + i + "' type='text' value='" + infoJson[i][key] + "' readonly='readonly' disabled='disabled'><br/>";
            } else {
                keyPath += "/" + key;
                var jsonLen = GetJsonLength(infoJson[i][key]);
                if (jsonLen == 0) {
                    WriteInfo("json中数组不能为空", true);
                    return;
                }

                var funcName = "";
                if (GetJsonType(infoJson[i][key]) == "Object") {
                    funcName = 'NextJsonObject(" + infoJson[i][key] + ")';
                } else {
                    funcName = 'ShowArrayJson("' + keyPath + '",[' + infoJson[i][key] + '])';
                }

                html += " <button class='nextJsonBtn' id='" + key + i + "' onclick='" + funcName + "' >展开</button><br/>";
            }
        }
        html += "</div>";
        html += "</div>";
    }

    dropZone.innerHTML = html;
}


function PresEditBtn(keyIndex) {

    var btnName = "editBtn" + keyIndex;

    var btn = document.getElementById(btnName);
    if (btn.innerText == '编辑') {
        for (var key in infoJson[keyIndex]) {
            var keyName = key + keyIndex;
            document.getElementById(keyName).removeAttribute('readonly');
            document.getElementById(keyName).removeAttribute('disabled');
        }
        btn.innerText = '完成';
    } else if (btn.innerText == '完成') {
        for (var key in infoJson[keyIndex]) {
            var keyName = key + keyIndex;
            var jsonType = GetJsonType(infoJson[keyIndex][key]);
            if (jsonType == 'string' || jsonType == 'number') {
                document.getElementById(keyName).readOnly = "readonly";
                document.getElementById(keyName).disabled = "disabled";
            }
        }

        for (var key in infoJson[keyIndex]) {
            var keyName = key + keyIndex;
            var jsonType = GetJsonType(infoJson[keyIndex][key]);
            if (jsonType == 'string' || jsonType == 'number') {
                var jsonValue = document.getElementById(keyName).value;
                infoJson[keyIndex][key] = jsonValue;
            }
        }
        btn.innerText = '编辑';
    }
}

function SaveJson() {
    var aTag = document.createElement('a');
    var jsonStr = JSON.stringify(infoJson);
    var blob = new Blob([jsonStr]);
    aTag.download = fileName;
    aTag.href = URL.createObjectURL(blob);
    aTag.click();
    URL.revokeObjectURL(blob);
}

dropZone.addEventListener('dragenter', handleFileDragEnter, false);
dropZone.addEventListener('dragleave', handleFileDragLeave, false);
dropZone.addEventListener('dragover', handleFileDragOver, false);
dropZone.addEventListener('drop', handleFileDrop, false);


function NextJsonArray(fKey, json) {

    console.log('Array' + key);
}

function NextJsonObject(key) {
    console.log('Object' + key);
}