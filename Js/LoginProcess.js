$(document).ready(function () {
    // result 확인
    var result = $("#hidResult").val();

    if (Number(result) < 0) {
        var msg = "";

        if (result == -20) {
            msg = "<br />네이버 간편로그인 미동의로 인하여 예약이 진행되지 않습니다.";
        } else {
            msg = "처리 중 오류가 발생하였습니다.<br />다시 시도해주십시오.";
        }

        if ($("#hidUrl").val() != undefined && $("#hidUrl").val() != "") {
            msg += "<br />예약페이지로 돌아갑니다.";

            $("#btnConfirm").on("click", function () {
                location.replace($("#hidUrl").val());
            });
        }

        $("#divPopupContent").append(msg);

        $("#divPopup").show();
    }
});