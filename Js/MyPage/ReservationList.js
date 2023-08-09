$(document).ready(function () {
    // 이벤트 바인딩
    // 더보기
    var cPage = 1;
    $("#btnMore").on("click", function () {
        $.ajax({
            url: PATH_STATIC_AJAX_MYPAGE + "AjaxGetReservationList.aspx",
            data: { cPage: ++cPage },
            type: "GET",
            success: function (res) {
                if (res.Result == 10000) { // 성공
                    $("#divReservationListContainer").append(res.ReservationListHtml);
                    if (res.Exist == "false") {
                        $("#btnMore").hide();
                    }
                } else if (res.Result == 10) { // 더이상 없음
                    funcGenerateCommonPopup("마이페이지", "예약이 더이상 존재하지 않습니다.", "MyPageReservationList");
                    $("#btnMore").hide();
                } else {
                    funcGenerateCommonPopup("마이페이지", "오류가 발생하였습니다.<br />다시 시도해주십시오.", "MyPageReservationList");
                }
            }
        });
    });
});

// 동적 이벤트 바인딩
$(document).on("click", ".clsReservationDetail", function () {
    var reservationId = $(this).parents(".clsReservation").data("reservationId");
    var business = $(this).parents(".clsReservation").data("business");
    if (business == "domestic") {
        location.href = PATH_MYPAGE + "ReservationDetail.aspx?reservationId=" + reservationId;
    } else {
        location.href = PATH_MYPAGE + "ReservationDetailOversea.aspx?reservationId=" + reservationId;
    }
});
$(document).on("click", ".clsAlarm", function () {
    var detailCd = $(this).data("detailCd");
    var randingUrl = $(this).data("randingUrl");
    var talktalkId = $(this).data("talktalkId");
    var url = "https://pkgtour.naver.com/domestic-products" + randingUrl + detailCd;
    open("https://talk.naver.com/ct/" + talktalkId + "?ref=" + encodeURIComponent(url));
});
$(document).on("click", ".clsDelete", function () {
    var reservationId = $(this).data("reservationId");

    funcShowAjaxLoadingLayer();

    if (confirm("예약을 삭제하시겠습니까?") == false) {
        funcHideAjaxLoadingLayer();
        return;
    }

    $.ajax({
        url: PATH_STATIC_AJAX_MYPAGE + "AjaxReservationDeleteProcess.aspx",
        data: { reservationId: reservationId },
        type: "GET",
        success: function (res) {
            if (res.Result == 10000) { // 성공
                funcGenerateCommonPopup("마이페이지", "예약을 삭제하였습니다.", "ReservationDelete");
            } else { // 오류 발생
                funcGenerateCommonPopup("마이페이지", "오류가 발생하였습니다.<br />다시 시도해주십시오.", "ReservationDelete");
            }
        },
        complete: funcHideAjaxLoadingLayer
    });
});
$(document).on("click", ".clsAddPayment", function () {
    location.href = $(this).children("input:hidden").val();
});

// ajax 로딩 레이어
function funcShowAjaxLoadingLayer() {
    $("#divAjaxLoadingLayer").show();
}
function funcHideAjaxLoadingLayer() {
    $("#divAjaxLoadingLayer").hide();
}