$(document).ready(function () {
    // 목록보기
    $("#btnList").on("click", function () {
        window.location.href = PATH_MYPAGE + "QnaList_Insp.aspx";
    });

    // 수정
    $("#btnModify").on("click", function () {
        var seq = $("#hidSeq").data("seq");
        window.location.href = PATH_MYPAGE + "Qna_Insp.aspx?Seq=" + seq;
    });

    var errData = $("#hidExceptionData").data("value");
    funcException(errData);
});



function funcException(errData) {
    if (errData == 30) {
        funcGenerateCommonPopup("마이페이지", "접근할 수 없습니다.", "MyPageResQna_Insp");
    }
}