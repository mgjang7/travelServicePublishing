$(document).ready(function () {
    funcInit();

    // 이벤트 바인딩
    $(".clsTabMenu").on("click", function () {
        var type = $(this).data("type");

        if (type == "res") {
            location.href = PATH_MYPAGE + "ReservationList_Insp.aspx";
        } else if (type == "qna") {
            location.href = PATH_MYPAGE + "QnaList_Insp.aspx";
        }
    });
});

// FUNCTION

function funcInit() {
    // 마이페이지 로그인 에러인 경우
    var loginErrCd = $("#hidLoginErrCd").val();

    /**
    *  에러코드
    *  10: 잘못된 접근
    *  20: 네아로 미동의
    *  30: 신규유저 접속
    *  40: 네아로 오류
    */
    if (loginErrCd != undefined) {
        switch (loginErrCd) {
            case "0":
                funcGenerateCommonPopup("마이페이지", "오류가 발생하였습니다.<br />잠시후 다시 시도해주십시오.", "MyPageLoginErr");
                break;
            case "10":
            case "20":
            case "30":
                funcGenerateCommonPopup("마이페이지", "잘못된 접근입니다.<br />다시 접속해주십시오.", "MyPageLoginErr");
                break;
            case "40":
                funcGenerateCommonPopup("마이페이지", "네이버 간편 로그인 오류가 발생하였습니다.<br />잠시후 다시 시도해주십시오.", "MyPageLoginErr");
                break;
            default:
                break;
        }
    }
}