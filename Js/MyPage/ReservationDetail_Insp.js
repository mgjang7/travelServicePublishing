$(document).ready(function () {
    funcInit();

    // 이벤트 바인딩
    // 리스트
    $("#btnGoList").on("click", function () {
        location.href = PATH_MYPAGE + "ReservationList_Insp.aspx";
    });
    // 예약취소
    $("#btnResCancel").on("click", function () {
        $("#divCancelReason").show();

        posY = $(window).scrollTop();
        $("html, body").addClass("not_scroll");
        $(".all_warp").css("top", -posY);
    });
    // 타이틀
    $("#h2Title").on("click", function () {
        var organLandingUrl = $("#hidOrganLandingUrl").val();
        var detailCd = $("#hidDetailCd").val();
        if (organLandingUrl != "" && detailCd != "") {
            open("https://pkgtour.naver.com/domestic-products/" + organLandingUrl + "/" + encodeURIComponent(detailCd));
        }
    });
    // 예약취소
    $("#btnCancelConfirm").on("click", function () {
        var cancelReason1 = $("[name=rdoCancelReason]:checked").val();
        var cancelReason2 = $("#taCancelReason").val().trim();

        if (cancelReason1 == undefined) {
            funcGenerateCommonPopup("마이페이지", "취소사유를 선택해주십시오.", "ReservationCancelReason");
            return;
        }
        if (cancelReason1 == "4" && cancelReason2.length == 0) {
            funcGenerateCommonPopup("마이페이지", "기타사유를 입력해주십시오.", "ReservationCancelReason");
            return;
        } else if (cancelReason2.length > 50) {
            funcGenerateCommonPopup("마이페이지", "기타사유는 최대 50자까지 입력할 수 있습니다.", "ReservationCancelReason");
            return;
        }

        funcShowAjaxLoadingLayer();

        var reservationId = $("#hidResId").val();
        var type = $("#btnResCancel").data("type");

        var message = "";
        if (type == "cancel") {
            message = "취소를 진행하시겠습니까?";
        } else if (type == "cancelRequest") {
            message = "관리자에게 취소요청을 합니다..\n계속 진행하시겠습니까?";
        }

        if (confirm(message) == false) {
            funcHideAjaxLoadingLayer();
            return;
        }

        funcCloseCancelReason();

        $.ajax({
            url: PATH_STATIC_AJAX_MYPAGE + "AjaxReservationCancelProcess.aspx",
            data: { reservationId: reservationId, type: type, cancelReason1: cancelReason1, cancelReason2: cancelReason2 },
            type: "POST",
            success: function (res) {
                if (res.Result == 10000) { // 성공
                    if (type == "cancel") {
                        funcGenerateCommonPopup("마이페이지", "예약이 취소되었습니다.", "ReservationCancel");
                    } else {
                        funcGenerateCommonPopup("마이페이지", "예약취소 요청을 성공하였습니다.", "ReservationCancel");
                    }
                } else if (res.Result == 10 || res.Result == 20 || res.Result == 30) { // 잘못된 요청
                    funcGenerateCommonPopup("마이페이지", "잘못된 요청입니다.", "ReservationCancel");
                } else { // 오류 발생
                    funcGenerateCommonPopup("마이페이지", "오류가 발생하였습니다.<br />다시 시도해주십시오.", "ReservationCancel");
                }
            },
            complete: funcHideAjaxLoadingLayer
        });
    });
    // 예약취소 닫기
    $("#btnCancelClose").on("click", funcCloseCancelReason);
    // 취소사유 선택
    $("[name=rdoCancelReason]").on("click", function () {
        if ($(this).val() != "4") {
            $("#taCancelReason").prop("disabled", true).hide();
        } else {
            $("#taCancelReason").prop("disabled", false).show();
        }
    });
    // 카드사 적립 프로모션 안내 문구 동적 변경
    $(window).resize(function () {
        if (window.innerWidth < 768) {
            $(".clsCardPromotionPC").hide();
            $(".clsCardPromotionMO").show();
        } else {
            $(".clsCardPromotionPC").show();
            $(".clsCardPromotionMO").hide();
        }
    }).resize();
});

// FUNCTION

function funcInit() {
    if ($("#hidResDetailErr") != undefined && $("#hidResDetailErr").val() == "Y") {
        funcGenerateCommonPopup("마이페이지", "잘못된 접근입니다.", "MyPageResDetailErr_Insp");
    }
}

// ajax 로딩 레이어
function funcShowAjaxLoadingLayer() {
    $("#divAjaxLoadingLayer").show();
}
function funcHideAjaxLoadingLayer() {
    $("#divAjaxLoadingLayer").hide();
}

// 예약취소 닫기
function funcCloseCancelReason() {
    $("#divCancelReason").hide();
    $("[name=rdoCancelReason]").first().click();
    $("#taCancelReason").val("");

    $("html, body").removeClass("not_scroll");
    posY = $(window).scrollTop(posY);
}
