// 일행정보 input 복호화
function funcDecodeUriHiddenInfo(str) {
    str = decodeURIComponent(str);
    str = str.replaceAll("+", " ");
    return str;
}

// 로딩 레이어
function funcShowReservationLoading() {
    $("#divResLoadingLayer").show();
}

// 로딩 레이어
function funcHideReservationLoading() {
    $("#divResLoadingLayer").hide();
}

// 사용자 제어 제한 On
function funcUserControlRestrictionOn() {
    document.onkeydown = function (e) {
        if ((event.ctrlKey == true && (event.keyCode == 78 || event.keyCode == 82)) || (event.keyCode == 116)) {
            if (e) {
                e.preventDefault();
            } else {
                event.keyCode = 0;
                event.cancelBubble = true;
                event.returnValue = false;
            }
        }
    };
    document.oncontextmenu = function (e) {
        if (e) {
            e.preventDefault();
        } else {
            event.keyCode = 0;
            event.returnValue = false;
        }
    };
}

// 문자열 전체에서 replace 진행
String.prototype.replaceAll = function (substr, newSubstr) {
    var str = this;
    while (str.indexOf(substr) != -1) {
        str = str.replace(substr, newSubstr);
    }

    return str;
};

// <, >를 html 특수문자로 변환
String.prototype.escapeXSS = function () {
    var str = this;
    return str.replaceAll("<", "&lt;").replaceAll(">", "&gt;")
};

// 쿼리스트링(파라미터) 값 가져오기
function funcGetParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

// 쿼리스트링(파라미터) 전체 값 객체로 가져오기
function funcGetParameter() {
    var url = document.location.href;
    var qs = url.substring(url.indexOf('?') + 1).split('&');
    for (var i = 0, result = {}; i < qs.length; i++) {
        qs[i] = qs[i].split('=');
        result[qs[i][0]] = decodeURIComponent(qs[i][1]);
    }
    return result;
}

// 쿼리스트링 객체 쿼리스트링화
function funcSerializeQueryString(obj) {
    var str = "";
    var idx = 0;

    for (var prop in obj) {
        if (idx++ == 0) {
            str = "?" + prop + "=" + encodeURIComponent(obj[prop]);
            continue;
        }

        str += "&" + prop + "=" + encodeURIComponent(obj[prop]);
    }

    return str;
}

// 숫자 콤마
Number.prototype.toNumberWithComma = function () {
    var value = this.toString();
    return value.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}