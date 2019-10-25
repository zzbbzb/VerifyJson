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
    if (GetJsonType(keyPath) != 'string') {
        return "key";
    }
    var keyLists = keyPath.split('/');
    var key = "J";

    for (var i = 0; i < keyLists.length; i++) {
        key += '_' + keyLists[i];
    }

    return key;
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
    var tipWindow = new PWindow(content, "提示", { onCloseShade: true });
    tipWindow.Show();
}

/**
 * Array 显示框
 */
function ShowArrayJson(keyPath, json) {
    var html = "";
    // 进行布局
    for (var key in json) {
        var keyStr = PathConvertToKey(keyPath) + "_" + key;
        html += " <input id='" + keyStr + "' type='text' value='" + json[key] + "' readonly='readonly' disabled='disabled'>";
    }

    var tipWindow = new PWindow(html, keyPath);
    tipWindow.Show();
}