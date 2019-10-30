function PWindow(content, title, options) {
    this.content = content;
    this.title = title;
    this.options = options || {};

    if (typeof this.Show != "function") {
        PWindow.prototype.Show = function() {
            var html = "";
            html += "<div class='shade' id='shade'>" +
                "<div class='wbox' id='wbox'>" +
                "<div id = 'boxHeader'>" +
                "<div class = 'boxHeaderName' >" + this.title + "</div>" +
                "<div id = 'close' onclick = 'TipShadeHidden()'> x </div> " +
                "</div>" +
                "<div id = 'boxContainer'>" + this.content + "</div>" +
                "</div>" +
                "</div>";

            document.getElementById('boxes').innerHTML += html;

            if (this.options.hasOwnProperty('onCloseShade')) {
                if (typeof this.options.onCloseShade == 'boolean' && this.options.onCloseShade) {
                    document.getElementById('wbox').addEventListener('click', closeClickWindow, false);
                    document.getElementById('shade').addEventListener('click', TipShadeHidden, false);
                }
            }

            if (this.options.hasOwnProperty('cssBoxWidth')) {
                var thisNode = document.getElementsByClassName("wbox");
                thisNode[thisNode.length - 1].style.width = this.options.cssBoxWidth;
            }

            if (this.options.hasOwnProperty('cssBoxHeight')) {
                var thisNode = document.getElementsByClassName("wbox");
                thisNode[thisNode.length - 1].style.height = this.options.cssBoxHeight;
            }
        }
    }
};

function closeClickWindow(event) {
    event.stopPropagation();
}

function TipShadeHidden() {
    var thisNode = document.getElementsByClassName("shade");
    thisNode[thisNode.length - 1].parentNode.removeChild(thisNode[thisNode.length - 1]);
}

function PathConvertToKey(keyPath, num) {

    num = num || 0;
    var keyLists = KeyPathConvertToList(keyPath);
    var key = "J";

    if (num < 0 && num >= keyLists.length) {
        num = 0;
    }

    for (var i = 0; i < keyLists.length; i++) {
        if (i != keyLists.length - num) {
            key += '_' + keyLists[i];
        }

    }

    return key;
}

function KeyPathConvertToList(keyPath) {
    if (GetJsonType(keyPath) != 'string') {
        return "key";
    }
    var keyLists = keyPath.split('/');
    return keyLists;
}

function GetPathJson(keyPath) {
    var json = infoJson;
    if (keyPath != "") {
        var pathLists = KeyPathConvertToList(keyPath);
        for (var key in pathLists) {
            json = json[pathLists[key]];
        }
    }
    return json;
}

function GetPathLastKey(keyPath) {
    var lastKey = "";
    if (keyPath != "") {
        var pathLists = KeyPathConvertToList(keyPath);
        lastKey = pathLists[pathLists.length - 1];
    }
    return lastKey;
}

/**
 * 显示提示框
 */
function ShowTipWbox() {

    var tipContent = [
        "1. 要拖动.json结尾的文件",
        "2. 如果显示为空或者有数据为undefined,注意下json中的格式",
        "3. json文件要是数组json,也就是最外面是[]框住",
        "4. 数组json不能为空"
    ];
    var content = "";
    for (var i = 0; i < tipContent.length; i++) {
        content += tipContent[i] + "<br>";
    }

    var options = {
        onCloseShade: true,
        cssBoxWidth: '50%',
        cssBoxHeight: '50%',
    };
    var tipWindow = new PWindow(content, "提示", options);
    tipWindow.Show();
}

/**
 * Array 显示框
 */
function ShowArrayJson(keyPath) {

    var json = GetPathJson(keyPath);
    var keyPathStr = '"' + keyPath + '"';
    var html = "";
    html += "<div class='cardDiv cardSize_big'>";
    html += "<div id='cardHead'>";
    html += "<button class='addBtn' id='addBtn' onclick='PressAddBtn(" + keyPathStr + ")'>添加</button>";

    html += "<button class='editBtn' id='editBtn" + keyPath + "' onclick='PressEditBtn(" + keyPathStr + ")'>编辑</button>";
    html += "</div>";
    html += "<div id='cardContainer'>";

    var type = "Array";
    var typeStr = '"' + type + '"';
    // 进行布局
    for (var key in json) {
        var keyStr = PathConvertToKey(keyPath) + "_" + key;
        html += "<label>" + key + ":  </label><input id='input_" + keyStr + "' type='text' value='" + json[key] + "' readonly='readonly' disabled='disabled'>";
        var delkeyStr = '"' + key + '"';
        html += "<button class='delBtn' id='delBtn_" + keyStr + "' onclick='PressDelBtn(" + keyPathStr + "," + delkeyStr + "," + typeStr + ")'>删除" + key + "</button><br/>";
    }

    html += "</div>";
    html += "</div>";

    var options = {
        cssBoxWidth: '80%',
        cssBoxHeight: '80%',
    };

    var tipWindow = new PWindow(html, keyPath, options);
    tipWindow.Show();
}

/**
 * Object 显示框
 */
function ShowObjectJson(keyPath) {
    var json = GetPathJson(keyPath);

    var type = "Object";
    var typeStr = '"' + type + '"';
    var pKeyPath = '"' + keyPath + '"';

    var html = "<div class='mainContainer mainContainer_height_window'>" +
        "<div class='controlStrip'>" +
        "<button class='addBtn addBtn_size' id='addBtn' onclick='PressAddBtn(" + pKeyPath + ")'>添加</button>" +
        "</div>" +
        "<div class='jsonContainer' id='jsonContainer'>";

    for (var i = 0; i < GetJsonLength(json); i++) {
        var tmpkeyPath = keyPath + "/" + i.toString();
        html += "<div class='cardDiv card_margin card_shadow cardSize_small'>";
        html += "<div id='cardHead'>";
        var keyPathStr = '"' + tmpkeyPath + '"';
        var delkeyStr = '"' + i + '"';
        html += "<button class='delBtn' id='delBtn" + tmpkeyPath + "' onclick='PressDelBtn(" + pKeyPath + "," + delkeyStr + "," + typeStr + ")'>删除</button>";
        html += "<button class='editBtn' id='editBtn" + tmpkeyPath + "' onclick='PressEditBtn(" + keyPathStr + ")'>编辑</button>";
        html += "</div>";
        html += "<div id='cardContainer'>";

        // 进行布局
        for (var key in json[i]) {
            var keyStr = PathConvertToKey(tmpkeyPath) + "_" + key;
            html += "<lable for='label_" + keyStr + "'><b>" + key + ":</b></lable>";
            var jsonType = GetJsonType(json[i][key]);
            if (jsonType == 'string' || jsonType == 'number') {
                html += " <input id='input_" + keyStr + "' type='text' value='" + json[i][key] + "' readonly='readonly' disabled='disabled'><br/>";
            } else {
                var jsonLen = GetJsonLength(json[i][key]);
                if (jsonLen == 0) {
                    WriteInfo("json中数组不能为空", true);
                    return;
                }

                var funcName = "";
                if (GetJsonType(json[i][key][0]) == "Object") {
                    var ttkeyPath = tmpkeyPath + "/" + key;
                    funcName = 'ShowObjectJson("' + ttkeyPath + '")';
                } else {
                    var ttkeyPath = tmpkeyPath + "/" + key;
                    funcName = 'ShowArrayJson("' + ttkeyPath + '")';
                }

                html += " <button class='nextJsonBtn' id='button_" + keyStr + "' onclick='" + funcName + "' >展开</button><br/>";
            }
        }
        html += "</div>";
        html += "</div>";
    }
    html += "</div>";
    html += "</div>";

    var options = {
        cssBoxWidth: '80%',
        cssBoxHeight: '80%',
    };

    var tipWindow = new PWindow(html, keyPath, options);
    tipWindow.Show();
}

/**
 * 删除确认弹窗
 */
function ShowConfirmDel(keyPath, delIndex, type) {

    var html = "";
    var keyPathStr = '"' + keyPath + '"';
    var delIndexStr = '"' + delIndex + '"';
    var typeStr = '"' + type + '"';

    html += "<div class='confirmDelBtnContent'>";
    html += "<label>是否要删除</label><br>";
    html += "</div>";
    html += "<div class='confirmBtnDiv'>"
    html += "<button onclick='PressConfirmDelBtn(" + keyPathStr + ", " + delIndexStr + ", " + typeStr + ")'>是</button>";
    html += "<button onclick='TipShadeHidden()'>否</button>";
    html += "</div>";
    var options = {
        cssBoxWidth: '40%',
        cssBoxHeight: '20%',
    };

    var tipWindow = new PWindow(html, " ", options);
    tipWindow.Show();
}

/**
 * 增加Array number
 */
function ShowAddArrayJson(keyPath, newKeyPath, windowPath, mainFlag) {
    var keyPathStr = '"' + keyPath + '"';

    var json = GetPathJson(keyPath);

    var tmpNewKeyPath = newKeyPath;
    if (keyPath == newKeyPath) {
        if (newKeyPath = "") {
            tmpNewKeyPath = length.toString();
        } else {
            tmpNewKeyPath = newKeyPath + "/" + json.length;
        }
    } else {
        tmpNewKeyPath = newKeyPath + "/0";
    }


    var type = "Array";
    var typeStr = '"' + type + '"';

    var html = "";
    var keyStr = PathConvertToKey(tmpNewKeyPath);
    html += "<div class='confirmAddBtnContent'>";
    var inputValue = "";
    var windowKey = GetPathLastKey(windowPath);
    if (windowKey != 'm') {
        inputValue = addJson[windowKey][0];
    }
    html += "<input id='input_" + keyStr + "' value='" + inputValue + "'  >";
    html += "</div>";
    html += "<div class='confirmBtnDiv'>"
    var newKeyStr = '"' + tmpNewKeyPath + '"';
    var tempWindowStr = '"' + windowPath + '"';
    var tempMainFlag = '"' + mainFlag + '"';
    html += "<button onclick='PressConfirmAddBtn(" + keyPathStr + "," + newKeyStr + "," + typeStr + "," + tempWindowStr + "," + tempMainFlag + ")'>是</button>";
    html += "<button onclick='TipShadeHidden()'>否</button>";
    html += "</div>";

    var options = {
        cssBoxWidth: '40%',
        cssBoxHeight: '20%',
    };

    var tipWindow = new PWindow(html, "增加页：" + tmpNewKeyPath, options);
    tipWindow.Show();
}

/**
 * 增加Object
 */
function ShowAddObjectJson(keyPath, newKeyPath, windowPath, mainFlag) {
    var keyPathStr = '"' + keyPath + '"';
    var newKeyPathStr = '"' + newKeyPath + '"';

    var html = "";
    html += "<div class='confirmAddBtnContent'>";

    var type = 'Object';
    var typeStr = '"' + type + '"';
    var json = GetPathJson(keyPath);
    var length = json.length;

    var tmpNewPath = newKeyPath;
    if (tmpNewPath == keyPath) {
        if (tmpNewPath = "") {
            tmpNewPath = length.toString();
        } else {
            tmpNewPath = newKeyPath + "/" + length.toString();
        }
    } else {
        tmpNewPath = newKeyPath + "/0";
    }


    for (var key in json[0]) {
        var keyStr = PathConvertToKey(tmpNewPath) + "_" + key;
        html += "<lable for='label_" + keyStr + "'><b>" + key + ":</b></lable>";
        var jsonType = GetJsonType(json[0][key]);
        if (jsonType == 'string' || jsonType == 'number') {
            var kStr = '"' + key + '"';
            var tempWindowStr = '"' + windowPath + '"';
            var windowKey = GetPathLastKey(windowPath);
            var inputValue = '';
            if (windowKey != 'm') {
                inputValue = addJson[windowKey][0][key];
            } else {
                inputValue = addJson[key];
            }
            var tempMainFlag = '"' + mainFlag + '"';
            html += " <input id='input_" + keyStr + "' type='text' value='" + inputValue + "' onchange ='SaveInputValue(" + keyPathStr + "," + newKeyPathStr + "," + kStr + "," + tempWindowStr + "," + tempMainFlag + ",this.value)'><br/>";
        } else {
            var tempWindow = windowPath + "/" + key;
            var funcName = "";
            var ttKeyPath = keyPath;
            if (keyPath == "") {
                ttKeyPath += "0/" + key;
            } else {
                ttKeyPath += "/0/" + key;
            }

            var ttNewPath = tmpNewPath + "/" + key;
            funcName = 'AddJson("' + ttKeyPath + '","' + ttNewPath + '","' + tempWindow + '","' + mainFlag + '")';
            html += " <button class='nextJsonBtn' id='button_" + keyStr + "' onclick='" + funcName + "' >增加</button><br/>";
        }
    }

    html += "</div>";
    html += "<div class='confirmBtnDiv'>"
    var newKeyPathStr = '"' + tmpNewPath + '"';
    var tempWindowStr = '"' + windowPath + '"';
    var tempMainFlag = '"' + mainFlag + '"';
    html += "<button onclick='PressConfirmAddBtn(" + keyPathStr + "," + newKeyPathStr + "," + typeStr + "," + tempWindowStr + "," + tempMainFlag + ")'>是</button>";
    html += "<button onclick='TipShadeHidden()'>否</button>";
    html += "</div>";

    var options = {
        cssBoxWidth: '80%',
        cssBoxHeight: '80%',
    };

    var tipWindow = new PWindow(html, "增加页：" + tmpNewPath, options);
    tipWindow.Show();
}
12