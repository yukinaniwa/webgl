
/**
  シェーダーファイルの読み込み
*/
function loadShaderFile(fileName) {
    var reqFile = new XMLHttpRequest();
    reqFile.open('GET', fileName, false);
    reqFile.send(null);
    
    return reqFile.responseText;
}
