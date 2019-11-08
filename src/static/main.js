var dropZone = document.getElementById('jsonContainer');
var info = document.getElementById('info');

var infoJson = undefined;
var addJson = undefined;
var fileName = ".json";

var indexType = '';
var modifyPath = []; // json 修改的位置

document.getElementById("addMainBtn").addEventListener('click', function() {
    if(typeof(infoJson) != 'undefined')
    {
        PressAddBtn("", true);
    }
}, false);

document.getElementById("editMainBtn").addEventListener('click', function() {
    if(typeof(infoJson) != 'undefined')
    {
        PressEditBtn("");
    }
}, false);

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
        fileText = fileText.trim();
        if (fileText.length > 0) {
            if (fileText[0] == '{') {
                fileText = '[' + fileText + ']';
            }
        } else {
            WriteInfo("文件不能为空", true);
        }

        indexType = '';
        modifyPath = [];

        infoJson = JSON.parse(fileText);
        InitJson(infoJson, "", GetJsonType(infoJson));

        for (var path in modifyPath) {
            var keyLists = KeyPathConvertToList(modifyPath[path]);
            var json = infoJson;
            var newJson = infoJson;
            for (var i = 0; i < keyLists.length; i++) {
                json = json[keyLists[i]];
            }

            for (var i = 0; i < keyLists.length - 1; i++) {
                newJson = newJson[keyLists[i]];
            }

            var t = json;
            var kt = [];
            kt.push(t);
            json = kt;
            newJson[keyLists[keyLists.length - 1]] = json;
        }

        info.innerHTML = "成功读取文件,共" + GetJsonLength(infoJson) + "个";
        var str = "";
        // dropZone.innerHTML = str;

        // 进行布局
        if (typeof(infoJson) == "undefined") {
            return;
        }

        if (GetJsonType(infoJson) != 'Array') {
            WriteInfo("json要是数组json,最外层加个[]", true);
            return;
        }

        if (GetJsonType(infoJson[0]) == 'Object') {
            ShowMainJson();
        } else {
            ShowMainArrayJson();
        }

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

function ShowMainArrayJson() {

    document.getElementById("editMainBtn").style.display = 'block';
    indexType = 'MainArray';
    var type = "Main";
    var typeStr = '"' + type + '"';

    var keyPath = "";
    var pKeyPath = '"' + keyPath + '"';

    var html = "";
    html += "<div class='cardDiv cardSize_big'>";
    html += "<div id='cardContainer'>";

    var typeStr = '"' + type + '"';
    // 进行布局
    for (var key in infoJson) {
        var keyStr = PathConvertToKey(keyPath) + "_" + key;
        var keyPathStr = '"' + keyPath + '"';
        html += "<label>" + key + ":  </label><input id='input_" + keyStr + "' type='text' value='" + infoJson[key] + "' readonly='readonly' disabled='disabled'>";
        var delkeyStr = '"' + key + '"';
        html += "<button class='delBtn' id='delBtn_" + keyStr + "' onclick='PressDelBtn(" + keyPathStr + "," + delkeyStr + "," + typeStr + ")'>删除" + key + "</button><br/>";
    }

    html += "</div>";
    html += "</div>";

    dropZone.innerHTML = html;
}

function ShowMainJson() {
    var html = "";
    indexType = "Main";
    var type = "Main";
    var typeStr = '"' + type + '"';

    var keyPath = "";
    var pKeyPath = '"' + keyPath + '"';
    for (var i = 0; i < GetJsonLength(infoJson); i++) {
        keyPath = i.toString();
        html += "<div class='cardDiv card_margin card_shadow cardSize_small'>";
        html += "<div id='cardHead'>";
        var keyPathStr = '"' + keyPath + '"';
        var delkeyStr = '"' + i + '"';
        html += "<button class='delBtn' id='delBtn" + keyPath + "' onclick='PressDelBtn(" + pKeyPath + "," + delkeyStr + "," + typeStr + ")'>删除</button>";
        html += "<button class='editBtn' id='editBtn" + keyPath + "' onclick='PressEditBtn(" + keyPathStr + ")'>编辑</button>";
        html += "</div>";
        html += "<div id='cardContainer'>";
        // 进行布局
        for (var key in infoJson[i]) {
            var keyStr = PathConvertToKey(keyPath) + "_" + key;
            html += "<lable for='label_" + keyStr + "'><b>" + key + ":</b></lable>";
            var jsonType = GetJsonType(infoJson[i][key]);
            if (jsonType == 'string' || jsonType == 'number') {
                html += " <input id='input_" + keyStr + "' type='text' value='" + infoJson[i][key] + "' readonly='readonly' disabled='disabled'><br/>";
            } else {
                var jsonLen = GetJsonLength(infoJson[i][key]);
                if (jsonLen == 0) {
                    WriteInfo("json中数组不能为空", true);
                    return;
                }

                var funcName = "";
                if (GetJsonType(infoJson[i][key]) == "Array") {
                    if (GetJsonType(infoJson[i][key][0]) == "Object") {
                        var tmpkeyPath = keyPath + "/" + key;
                        funcName = 'ShowObjectJson("' + tmpkeyPath + '")';
                    } else {
                        var tmpkeyPath = keyPath + "/" + key;
                        funcName = 'ShowArrayJson("' + tmpkeyPath + '")';
                    }

                    html += " <button class='nextJsonBtn' id='button_" + keyStr + "' onclick='" + funcName + "' >展开</button><br/>";
                }
            }
        }
        html += "</div>";
        html += "</div>";
    }

    dropZone.innerHTML = html;
}

function SaveJson() {
    if (typeof(infoJson) == 'undefined') {
        WriteInfo("没有json文件", true);
        return;
    }
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

/**
 * 按下编辑键
 */
function PressEditBtn(keyPath) {

    var json = GetPathJson(keyPath);

    console.log(json);

    var btnName = "editBtn" + keyPath;
    if (indexType == "MainArray") {
        btnName = "editMainBtn";
    }
    var keyPathStr = PathConvertToKey(keyPath);
    var btn = document.getElementById(btnName);
    if (btn.innerText == '编辑') {
        for (var key in json) {
            var jsonType = GetJsonType(json[key]);
            if (jsonType == 'string' || jsonType == 'number') {
                var keyName = 'input_' + keyPathStr + '_' + key;
                document.getElementById(keyName).removeAttribute('readonly');
                document.getElementById(keyName).removeAttribute('disabled');
            }
        }
        btn.innerText = '完成';
    } else if (btn.innerText == '完成') {
        for (var key in json) {
            var jsonType = GetJsonType(json[key]);
            if (jsonType == 'string' || jsonType == 'number') {
                var keyName = "input_" + keyPathStr + "_" + key;
                document.getElementById(keyName).readOnly = "readonly";
                document.getElementById(keyName).disabled = "disabled";
            }
        }

        for (var key in json) {
            var keyName = "input_" + keyPathStr + "_" + key;
            var jsonType = GetJsonType(json[key]);
            if (jsonType == 'string' || jsonType == 'number') {
                var jsonValue = document.getElementById(keyName).value;
                json[key] = jsonValue;
            }
        }
        btn.innerText = '编辑';
    }
}

/**
 * 按下删除键,弹出确认弹框
 */
function PressDelBtn(keyPath, delIndex, type) {
    ShowConfirmDel(keyPath, delIndex, type);
}

/**
 * 确认删除
 */
function PressConfirmDelBtn(keyPath, delIndex, type) {
    // 关闭删除确认弹窗
    TipShadeHidden();
    console.log(keyPath);

    var json = GetPathJson(keyPath);

    console.log(json);

    if (json.length == 1) {
        WriteInfo("要留一个,不能全部删除", true);
        return;
    }

    json.splice(Number(delIndex), 1);

    WriteInfo("删除成功");

    console.log(json);

    // 刷新
    if (type == "Array") {
        TipShadeHidden();
        ShowArrayJson(keyPath);
    } else if (type == "Object") {
        TipShadeHidden();
        ShowObjectJson(keyPath);
    } else if (type == "Main") {
        dropZone.innerHTML = "";
        if (indexType == 'Main') {
            ShowMainJson();
        } else if (indexType == 'MainArray') {
            ShowMainArrayJson();
        }

    }
}

/**
 * 增加
 */
function PressAddBtn(keyPath, mainFlag, newKeyPath) {
    newKeyPath = newKeyPath || keyPath;
    mainFlag = mainFlag || false;
    var json = GetPathJson(keyPath);

    var type = GetJsonType(json);
    if (type == 'Array') {
        json = json[0];
        if (GetJsonType(json) == 'Object') {
            addJson = {};
        } else {
            addJson = "";
        }
    } else if (type == 'Object') {
        addJson = {};
    }

    InitAddJson(json, addJson);
    AddJson(keyPath, newKeyPath, 'm', mainFlag);
}

/**
 * 区别是Array还是Object
 */
function AddJson(keyPath, newKeyPath, windowPath, mainFlag) {
    var keyPathStr = '"' + keyPath + '"';
    console.log(keyPath);

    // 检测数据是Object还是Array
    var json = GetPathJson(keyPath);
    var type = GetJsonType(json[0]);

    if (type == 'Object') {
        ShowAddObjectJson(keyPath, newKeyPath, windowPath, mainFlag);
    } else {
        ShowAddArrayJson(keyPath, newKeyPath, windowPath, mainFlag);
    }
}

/**
 * 初始化addJson 模板
 */
function InitAddJson(json, newJson) {

    for (var key in json) {
        var type = GetJsonType(json[key]);
        if (type == 'string' || type == 'number') {
            newJson[key] = "";
        } else if (type == 'Object') {
            newJson[key] = {};
            InitAddJson(json[key], newJson[key]);
        } else {
            newJson[key] = []
            var aType = GetJsonType(json[key][0]);
            if (aType == 'string' || aType == 'number') {
                newJson[key][0] = "";
            } else if (aType == 'Object') {
                newJson[key][0] = {};
                InitAddJson(json[key][0], newJson[key][0]);
            }
        }
    }
}

/**
 * 初始化json ,把json中object用[] 括起来
 */
function InitJson(json, path, lastType) {

    if (GetJsonType(json) != 'string' && GetJsonType(json) != 'number') {
        if (GetJsonType(json) == 'Object') {
            if (lastType == 'Object') {
                modifyPath.push(path);
            }
        }
    }

    for (var key in json) {
        if (lastType == 'Object') {
            if (GetJsonType(json[key]) != 'string' && GetJsonType(json[key]) != 'number') {
                var aPath = "";
                if (path == "") {
                    aPath = key;
                } else {
                    aPath = path + "/" + key;
                }
                InitJson(json[key], aPath, GetJsonType(json));
            }
        } else if (lastType == 'Array') {
            var aPath = "";
            if (path == "") {
                aPath = key;
            } else {
                aPath = path + "/" + key;
            }

            InitJson(json[key], aPath, GetJsonType(json));

        }
    }
}


/**
 * 判断json是否为空，空为true
 */
function JudgeJsonEmpty(json) {
    if (GetJsonType(json) == 'string' || GetJsonType(json) == 'number') {
        if (json == "") {
            return true;
        }
    } else {
        for (var key in json) {
            if (JudgeJsonEmpty(json[key])) {
                return true;
            }
        }
    }
    return false;
}

/**
 *  按了确定添加按钮
 */
function PressConfirmAddBtn(keyPath, newKeyPath, type, windowPath, mainFlag) {
    if (type == 'Array') { // array number
        console.log(windowPath);
        var json = GetPathJson(keyPath);
        var windowKey = GetPathLastKey(windowPath);
        if (windowKey != 'm') {
            var json = GetPathJson(keyPath);
            var inputKeyStr = "input_" + PathConvertToKey(newKeyPath);
            var input = document.getElementById(inputKeyStr);
            if (input.value == "") {
                WriteInfo("设置值的时候不能为空", true);
                return;
            }
            var tmpAddJson = GetAddJsonByPath(GetPathExceptFirst(windowPath));
            tmpAddJson[0] = input.value;
            // json.push(addJson);
            TipShadeHidden();
        } else {
            var json = GetPathJson(keyPath);
            var inputKeyStr = "input_" + PathConvertToKey(newKeyPath);
            var input = document.getElementById(inputKeyStr);
            if (input.value == "") {
                WriteInfo("设置值的时候不能为空", true);
                return;
            }
            addJson = input.value;
            json.push(addJson);
            if (mainFlag === 'true') {
                TipShadeHidden();
                dropZone.innerHTML = "";
                if (indexType == 'Main') {
                    ShowMainJson();
                } else if (indexType == 'MainArray') {
                    ShowMainArrayJson();
                }
            } else {
                TipShadeHidden();
                TipShadeHidden();
                ShowArrayJson(keyPath);
            }

        }

    } else if (type == 'Object') {
        console.log(windowPath);
        var json = GetPathJson(keyPath);
        var windowKey = GetPathLastKey(windowPath);
        if (windowKey != 'm') {
            var tmpAddJson = GetAddJsonByPath(GetPathExceptFirst(windowPath));
            if (GetJsonType(tmpAddJson) == 'Array') {
                var addJ = tmpAddJson[0];
                for (var key in addJ) {
                    if (GetJsonType(addJ[key]) == 'string' || GetJsonType(addJ[key]) == 'number') {
                        var inputKeyStr = "input_" + PathConvertToKey(newKeyPath) + "_" + key;
                        var input = document.getElementById(inputKeyStr);
                        if (input.value == "") {
                            WriteInfo("设置值的时候不能为空", true);
                            return;
                        }
                        addJ[key] = input.value;
                    }
                }
            }
            TipShadeHidden();
        } else { // 主的完成
            for (var key in addJson) {
                if (GetJsonType(addJson[key]) == 'string' || GetJsonType(addJson[key]) == 'number') {
                    var inputKeyStr = "input_" + PathConvertToKey(newKeyPath) + "_" + key;
                    var input = document.getElementById(inputKeyStr);
                    if (input.value == "") {
                        WriteInfo("设置值的时候不能为空", true);
                        return;
                    }
                    addJson[key] = input.value;
                }
            }

            // 不为空
            if (JudgeJsonEmpty(addJson)) {
                WriteInfo("添加的数据有为空", true);
                return;
            }

            json.push(addJson);
            if (mainFlag === 'true') {
                TipShadeHidden();
                dropZone.innerHTML = "";
                ShowMainJson();
            } else {
                TipShadeHidden();
                TipShadeHidden();
                ShowObjectJson(keyPath);
            }

        }
    }
}

function SaveInputValue(keyPath, newKeyPath, key, windowPath, mainFlag, value) {
    console.log(key);
    console.log(windowPath);
    console.log(value);
    var windowKey = GetPathLastKey(windowPath);
    if (windowKey == 'm') {
        if (GetJsonType(addJson[key]) == 'string' || GetJsonType(addJson[key]) == 'number') {
            addJson[key] = value;
        }
        TipShadeHidden();
        ShowAddObjectJson(keyPath, newKeyPath, windowPath, mainFlag)
    }
}