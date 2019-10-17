var dropZone = document.getElementById('jsonContainer');
var info = document.getElementById('info');

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
        var infoJson = JSON.parse(fileText);
        info.innerHTML = "成功读取文件,共" + infoJson.length + "个";
        var str = "";

        for (var i = 0; i < infoJson.length; i++) {
            str += infoJson[i].skillId + "<br/>";
            str += infoJson[i].skillType + "<br/>";
            str += infoJson[i].value + "<br/>";
            str += "=================" + "<br/>";
        }
        // dropZone.innerHTML = str;

        // 进行布局
        JsonLayout(infoJson);
    };
};

function JsonLayout(infoJson) {
    var html = "";
    for (var i = 0; i < infoJson.length; i++) {
        html += "<div id='jsonDiv'>";
        html += "<div id='singleContainer'>"
            // TODO 进行布局
        for (var key in infoJson[i]) {
            html += "<b>" + key + ":</b>" + "  <input type='text' value='" + infoJson[i][key] + "'><br/>";
        }
        html += "</div>";
        html += "</div>";
    }
    dropZone.innerHTML = html;
};

dropZone.addEventListener('dragenter', handleFileDragEnter, false);
dropZone.addEventListener('dragleave', handleFileDragLeave, false);
dropZone.addEventListener('dragover', handleFileDragOver, false);
dropZone.addEventListener('drop', handleFileDrop, false);

document.getElementById('tipShade').style.display = "none";

document.getElementById('tipWbox').addEventListener('click', closeClickWindow, false);
document.getElementById('tipShade').addEventListener('click', TipShadeHidden, false);

function ShowTipWbox() {
    document.getElementById('tipShade').style.display = "";
}

function closeClickWindow(event) {
    event.stopPropagation();
}

function TipShadeHidden(event) {
    document.getElementById('tipShade').style.display = "none";
}