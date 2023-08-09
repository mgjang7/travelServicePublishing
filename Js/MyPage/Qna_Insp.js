$(document).ready(function () {
    $(".clsSelect2").select2();
    var errData = $("#hidExceptionData").data("value");
    funcException(errData);

    // 글쓰기
    $("#btnRegister").on("click", function () {
        funcShowAjaxLoadingLayer();
        // 예약번호
        var resId = $("#selResId").val();
        var reservationCnt = $("#hidReservationCnt").val();

        // 제목
        var title = $("#txtTitle").val().trim();
        title = title.replace(/</g, "&lt;");
        title = title.replace(/>/g, "&gt;");

        // 문의 구분
        var gubun = $("#selGubun option:selected").val();

        // 문의내용
        var content = $("#txtContent").val().trim();
        content = content.replace(/</g, "&lt;");
        content = content.replace(/>/g, "&gt;");

        if (reservationCnt === "0") {
            funcGenerateFocusCommonPopup("1:1문의", "예약하신 내역이 없습니다. 예약 후 이용해주십시오.", "");
            funcHideAjaxLoadingLayer();
            return;
        }

        if (resId.length == 0) {
            funcGenerateFocusCommonPopup("1:1문의", "예약번호를 선택해주십시오.", "selResId");
            funcHideAjaxLoadingLayer();
            return;
        }

        if (title.length == 0) {
            funcGenerateFocusCommonPopup("1:1문의", "제목을 입력해주십시오.", "txtTitle");
            funcHideAjaxLoadingLayer();
            return;
        } else if (title.length > 100) {
            funcGenerateFocusCommonPopup("1:1문의", "제목의 글자 수는 최대100자 이하만 가능합니다.", "txtTitle");
            funcHideAjaxLoadingLayer();
            return;
        }

        if (content.length == 0) {
            funcGenerateFocusCommonPopup("1:1문의", "문의내용을 입력해주십시오.", "txtContent");
            funcHideAjaxLoadingLayer();
            return;
        }

        var formData = new FormData();
        formData.append("resId", resId);
        formData.append("title", title);
        formData.append("gubun", gubun);
        formData.append("content", content);

        // 글 등록
        $.ajax({
            url: PATH_STATIC_AJAX_MYPAGE + "AjaxQnaRegisterProcess.aspx",
            processData: false,
            contentType: false,
            data: formData,
            type: "POST",
            success: function (res) {
                if (res.Result == 10000) {
                    funcGenerateCommonPopup("1:1문의", "문의하신 내용을 등록하였습니다", "MyPageResQna_Insp");
                } else if (res.Result == -10) {
                    funcGenerateCommonPopup("1:1문의", "예약번호가 다릅니다. <br />올바른 예약번호를 선택해주십시오.", "MyPageResQna_Insp");
                } else {
                    funcGenerateCommonPopup("1:1문의", "등록하는 중 오류가 발생 하였습니다 <br />다시 시도해주십시오.", "MyPageResQna_Insp");
                }
            },
            error: function () {
                console.log("error");
            },
            complete: funcHideAjaxLoadingLayer
        });
    });

    $("#btnMod").on("click", function () {
        funcShowAjaxLoadingLayer();
        // 글 번호
        var seq = $("#hidSeqData").val();

        // 예약번호
        var resId = $("#selResId option:selected").val();

        // 제목
        var title = $("#txtTitle").val().trim();
        title = title.replace(/</g, "&lt;");
        title = title.replace(/>/g, "&gt;");

        // 문의 구분
        var gubun = $("#selGubun option:selected").val();

        // 문의내용
        var content = $("#txtContent").val().trim();
        content = content.replace(/</g, "&lt;");
        content = content.replace(/>/g, "&gt;");

        if (resId.length == 0) {
            funcGenerateFocusCommonPopup("1:1문의", "예약번호를 선택해주십시오.", "selResId");
            funcHideAjaxLoadingLayer();
            return;
        }

        if (title.length == 0) {
            funcGenerateFocusCommonPopup("1:1문의", "제목을 입력해주십시오.", "txtTitle");
            funcHideAjaxLoadingLayer();
            return;
        } else if (title.length > 100) {
            funcGenerateFocusCommonPopup("1:1문의", "제목의 글자 수는 최대100자 이하만 가능합니다.", "txtTitle");
            funcHideAjaxLoadingLayer();
            return;
        }

        if (content.length == 0) {
            funcGenerateFocusCommonPopup("1:1문의", "문의내용을 입력해주십시오.", "txtContent");
            funcHideAjaxLoadingLayer();
            return;
        }

        var formData = new FormData();
        formData.append("Seq", seq);
        formData.append("resId", resId);
        formData.append("title", title);
        formData.append("gubun", gubun);
        formData.append("content", content);

        // 글 수정
        $.ajax({
            url: PATH_STATIC_AJAX_MYPAGE + "AjaxQnaModifyProcess.aspx",
            processData: false,
            contentType: false,
            data: formData,
            type: "POST",
            success: function (res) {
                if (res.Result == 10000) {
                    funcGenerateCommonPopup("1:1문의", "문의 내용이 수정되었습니다.", "MyPageResQnaMod_Insp");
                } else if (res.Result == -10) {
                    funcGenerateCommonPopup("1:1문의", "올바른 예약번호가 아닙니다.다시 확인해주십시오.", "MypageResQna_Insp");
                } else {
                    funcGenerateCommonPopup("1:1문의", "등록하는 중 오류가 발생 하였습니다 <br />다시 시도해주십시오.", "MyPageResQna_Insp");
                }

            },
            error: function () {
                console.log("error");
            },
            complete: funcHideAjaxLoadingLayer
        });
    });
});

function funcShowAjaxLoadingLayer() {
    $("#divAjaxLoadingLayer").show();
}

function funcHideAjaxLoadingLayer() {
    $("#divAjaxLoadingLayer").hide();
}

function funcException(errData) {
    if (errData == 40) {
        funcGenerateCommonPopup("마이페이지", "잘못된 요청입니다.", "MyPageResQna_Insp");
    }
}
