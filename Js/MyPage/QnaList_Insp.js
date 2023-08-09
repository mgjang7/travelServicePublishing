$(document).ready(function () {
    // 글쓰기 버튼
    $("#btnWrite").on("click", function () {
        window.location.href = "/MyPage/Qna_Insp.aspx";
    });

    // 더보기 버튼
    var cPage = 1;
    $("#btnMore").on("click", function () {
        $.ajax({
            url: PATH_STATIC_AJAX_MYPAGE + "AjaxQnaListProcess_Insp.aspx",
            data: { customerId: $("#hidCId").val(), cPage: ++cPage },
            type: "GET",
            //async: false,
            success: function (res) {
                if (res.Result == 10000) { // 성공
                    $("#tbodyContainer").append(res.QnaListHtml);
                    if (res.Have == "false") {
                        $("#btnMore").hide();
                    }
                } else if (res.Result == 10) { // 더이상 없음
                    funcGenerateCommonPopup("마이페이지", "더 이상 글이 존재하지 않습니다.", "MyPageResQnaList_Insp");
                    $("#btnMore").hide();
                } else {
                    funcGenerateCommonPopup("마이페이지", "오류가 발생하였습니다.<br />다시 시도해주십시오.", "MyPageResQnaList_Insp");
                }
            }
        });
    });
});

// AjAX에서 추가된 동적 이벤트 바인딩
$(document).on("click", ".clsTbodyItem", function () {
    var seq = $(this).data("seq");
    location.href = PATH_MYPAGE + "QnaDetail_Insp.aspx?Seq=" + seq;
});