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

function PathConvertToKey(keyPath) {

    var keyLists = KeyPathConvertToList(keyPath);
    var key = "J";

    for (var i = 0; i < keyLists.length; i++) {
        key += '_' + keyLists[i];
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

    var pathLists = KeyPathConvertToList(keyPath);
    var json = infoJson;
    for (var key in pathLists) {
        json = json[pathLists[key]];
    }

    var html = "";
    html += "<div class='cardDiv cardSize_big'>";
    html += "<div id='cardHead'>";
    html += "<button class='addBtn' id='addBtn' onclick='PressAddBtn()'>添加</button>";
    var keyPathStr = '"' + keyPath + '"';
    html += "<button class='editBtn' id='editBtn" + keyPath + "' onclick='PressEditBtn(" + keyPathStr + ")'>编辑</button>";
    html += "</div>";
    html += "<div id='cardContainer'>";

    // 进行布局
    for (var key in json) {
        var keyStr = PathConvertToKey(keyPath) + "_" + key;
        html += " <input id='input_" + keyStr + "' type='text' value='" + json[key] + "' readonly='readonly' disabled='disabled'><br/>";
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
    var pathLists = KeyPathConvertToList(keyPath);
    var json = infoJson;
    for (var key in pathLists) {
        json = json[pathLists[key]];
    }

    var html = "<div class='jsonContainer jsonContainer_margin_window jsonContainer_height_100' id='jsonContainer'>";
    for (var i = 0; i < GetJsonLength(json); i++) {
        var tmpkeyPath = keyPath + "/" + i.toString();
        html += "<div class='cardDiv card_margin card_shadow cardSize_small'>";
        html += "<div id='cardHead'>";
        var keyPathStr = '"' + tmpkeyPath + '"';
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
    var options = {
        cssBoxWidth: '80%',
        cssBoxHeight: '80%',
    };

    var tipWindow = new PWindow(html, keyPath, options);
    tipWindow.Show();
}