// 검수완료 구분
var inspectionCompleteYn = "";

// 사용자 입력 제한
funcUserControlRestrictionOn();

$(document).ready(function () {
    // 로딩 레이어
    funcShowReservationLoading();

    // 파라미터 에러 체크
    if ($("#hidParameterError").val() != undefined && $("#hidParameterError").val() == "Y") {
        funcGenerateCommonPopup("네이버페이", "파라미터가 잘못 설정되어있습니다.<br />확인해주시기 바랍니다.", "NpayProcessError");
    } else {
        var paymentType = $("#hidPaymentType").val();
        var paymentId = $("#hidPaymentId").val();
        var resultCode = $("#hidResultCode").val();
        var resultMessage = $("#hidResultMessage").val();
        var reservId = $("#hidReserveId").val();
        var tempReceiptId = $("#hidTempReceiptId").val();

        if (resultCode == "Success") {
            if (paymentType == "NPAYPT01") {
                if (paymentId != "") {
                    funcCheckReservation();
                } else {
                    funcHideReservationLoading();
                    funcGenerateCommonPopup("네이버페이", "결제 승인에 필요한 필수 데이터가 누락되었습니다.<br />다시 진행해주십시오.", "NpayProcessError");
                }
            } else {
                if (reservId != "" && tempReceiptId != "") {
                    funcCheckReservation();
                } else {
                    funcHideReservationLoading();
                    funcGenerateCommonPopup("네이버페이", "결제 승인에 필요한 필수 데이터가 누락되었습니다.<br />다시 진행해주십시오.", "NpayProcessError");
                }
            }
        } else {
            funcHideReservationLoading();
            switch (resultMessage) {
                case "userCancel":
                    funcGenerateCommonPopup("네이버페이", "결제를 취소하셨습니다. 주문 내용 확인 후 다시 결제해주세요.", "NpayProcessError");
                    break;
                case "webhookFail":
                    funcGenerateCommonPopup("네이버페이", "webhookUrl 호출 응답 실패. 주문 내용 확인 후 다시 결제해주세요.", "NpayProcessError");
                    break;
                case "OwnerAuthFail":
                    funcGenerateCommonPopup("네이버페이", "타인 명의 카드는 결제가 불가능합니다. 회원 본인 명의의 카드로 결제해주세요.", "NpayProcessError");
                    break;
                case "paymentTimeExpire":
                    funcGenerateCommonPopup("네이버페이", "결제 가능한 시간이 지났습니다. 주문 내용 확인 후 다시 결제해주세요.", "NpayProcessError");
                    break;
                default:
                    funcGenerateCommonPopup("네이버페이", resultMessage, "NpayProcessError");
                    break;
            }
        }
    }
});
// 동적 이벤트 바인딩

// 마이페이지 예약리스트로 이동
$(document).on("click", "#btnReservationComplete, #btnErrorAfterReservation", function () {
    if (inspectionCompleteYn == "Y") {
        location.replace(PATH_MYPAGE + "ReservationList.aspx");
    } else if (inspectionCompleteYn == "N") {
        location.replace(PATH_MYPAGE + "ReservationList_Insp.aspx");
    }
});
// 구매페이지로 이동
$(document).on("click", "#btnErrorBeforeReservation", function () {
    var url = sessionStorage.getItem("TRIPPLAT_NPAY_ERROR_RETURN_URL");
    if (url != null) {
        sessionStorage.removeItem("TRIPPLAT_NPAY_ERROR_RETURN_URL");
        location.replace(url);
    }
});

// FUNCTION
// 예약 진행
function funcCheckReservation() {
    var content = resultTemplate;

    $.ajax({
        url: PATH_STATIC_AJAX + "AjaxReservationProcess.aspx",
        data: $("#frmReservation").serialize(),
        type: "POST",
        success: function (res) {
            funcHideReservationLoading();

            inspectionCompleteYn = res.InspectionCompleteYn;

            if (res.Result == 10000) {
                if (res.PerksCouponUse == true && res.PerksCouponAllow == false) {
                    content = content.replace("#CONTENT#", "특전 쿠폰의 수량이 모두 소진되어 적용되지 않았으나, 고객 님의 예약은 ‘ <strong class='complete'>완료</strong> ’ 되었습니다.");
                    content = content.replace("#BTN_ID#", "btnReservationComplete");
                } else {
                    content = content.replace("#CONTENT#", "고객 님의 예약이 ‘ <strong class='complete'>완료</strong> ’ 되었습니다.");
                    content = content.replace("#BTN_ID#", "btnReservationComplete");
                }
            } else if (res.Result == 60 || res.Result == 30 || res.Result == 40) {
                content = content.replace("#CONTENT#", res.Message);
                content = content.replace("#BTN_ID#", "btnErrorAfterReservation");
            } else {
                content = content.replace("#CONTENT#", res.Message);
                content = content.replace("#BTN_ID#", "btnErrorBeforeReservation");
            }
        },
        error: function () {
            content = content.replace("#CONTENT#", "예약진행 중 오류가 발생하였습니다.<br />다시 시도해주십시오.");
            content = content.replace("#BTN_ID#", "btnErrorBeforeReservation");
        },
        complete: function () {
            $("#divContentContainer").empty().append(content);
        }
    });
}

// Template
// 결과 표시
var resultTemplate = "";
resultTemplate += "<div class='alt_pop'>";
resultTemplate += "    <div class='alt_t'>예약 알림</div>";
resultTemplate += "    <div class='alt_info'>";
resultTemplate += "        <div class='txt t_center'>";
resultTemplate += "            <br>";
resultTemplate += "            <br>";
resultTemplate += "            #CONTENT#";
//resultTemplate += "            고객 님의 예약이 ‘ <strong class='complete'>#RESULT#</strong> ’ 되었습니다.";
resultTemplate += "            <br>";
resultTemplate += "            <br>";
resultTemplate += "        </div>";
resultTemplate += "        <br>";
resultTemplate += "        <div class='t_center'>";
//resultTemplate += "            #RESULT_BUTTON#";
resultTemplate += "            <button type='button' id='#BTN_ID#' class='btn_pop'>확인</button>";
resultTemplate += "        </div>";
resultTemplate += "    </div>";
resultTemplate += "</div>";

// 결과 버튼
var resultButtonTemplate = "";
resultButtonTemplate += "<button type='button' id='#BTN_ID#' class='btn_pop'>확인</button>";