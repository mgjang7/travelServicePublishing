var commonPopupTemplate = "";
commonPopupTemplate += "<div class='popup'>";
commonPopupTemplate += "    <input type='hidden' id='hidCommonPopupGubun' value='#POPUP_GUBUN#' />";
commonPopupTemplate += "    <div class='alt_pop'>";
commonPopupTemplate += "        <div class='alt_t'>#POPUP_TITLE#</div>";
commonPopupTemplate += "        <div class='alt_info'>";
commonPopupTemplate += "            <div class='txt t_center'>";
commonPopupTemplate += "                <br>";
commonPopupTemplate += "                <br>";
commonPopupTemplate += "                #POPUP_CONTENT#";
commonPopupTemplate += "                <br>";
commonPopupTemplate += "                <br>";
commonPopupTemplate += "            </div>";
commonPopupTemplate += "            <br>";
commonPopupTemplate += "            <div class='t_center'>";
commonPopupTemplate += "                #BUTTON#";
commonPopupTemplate += "            </div>";
commonPopupTemplate += "        </div>";
commonPopupTemplate += "    </div>";
commonPopupTemplate += "</div>";

// 팝업 생성
function funcGenerateCommonPopup(title, content, popupGubun) {
    $("#divCommonPopup").empty();

    var commonPopup = "";
    commonPopup = commonPopupTemplate;
    commonPopup = commonPopup.replace(/#POPUP_TITLE#/g, title);
    commonPopup = commonPopup.replace(/#POPUP_CONTENT#/g, content);
    commonPopup = commonPopup.replace(/#POPUP_GUBUN#/g, popupGubun);
    commonPopup = commonPopup.replace(/#BUTTON#/g, "<button type='button' id='btnCommonPopupConfirm' class='btn_pop'>확인</button>");

    switch (popupGubun) {
        default:
            break;
    }

    $("#divCommonPopup").html(commonPopup);
    $("#divCommonPopup").show();
}

// 확인 버튼 클릭
function funcCommonPopupConfirm() {
    var popupGubun = $("#hidCommonPopupGubun").val();

    switch (popupGubun) {
        case "NpayProcessError": // 네이버페이 오류
            var returnUrl = sessionStorage.getItem("TRIPPLAT_NPAY_ERROR_RETURN_URL");
            if (returnUrl != undefined) {
                sessionStorage.removeItem("TRIPPLAT_NPAY_ERROR_RETURN_URL");
                location.replace(returnUrl);
            }
            break;
        case "ReservationCancel": // 예약 취소
            location.reload();
            break;
        case "ReservationDelete": // 예약 삭제
            location.reload();
            break;
        case "MyPageResDetailErr": // 마이페이지 예약리스트로 이동
            location.replace(PATH_MYPAGE + "ReservationList.aspx");
            break;
        case "MyPageResDetailErr_Insp": // 마이페이지 예약리스트로 이동, 검수완료되지 않은 상품의 마이페이지
            location.replace(PATH_MYPAGE + "ReservationList_Insp.aspx");
            break;
        case "MyPageLoginErr": // 팝업 닫힘 막기
            break;
        case "MyPageResQnaMod": // 수정후 목록 페이지 이동
        case "MyPageResQna": // 등록후 목록 페이지 이동
            location.replace(PATH_MYPAGE + "QnaList.aspx");
            break;
        case "MyPageResQnaMod_Insp": // 수정후 목록 페이지 이동, 검수완료되지 않은 상품의 마이페이지
        case "MyPageResQna_Insp": // 등록후 목록 페이지 이동, 검수완료되지 않은 상품의 마이페이지
            location.replace(PATH_MYPAGE + "QnaList_Insp.aspx");
            break;
        default:
            funcCommonPopupClose();
            break;
    }
}

// 팝업 제거
function funcCommonPopupClose() {
    var popupGubun = $("#hidCommonPopupGubun").val();

    switch (popupGubun) {
        default:
            $("#divCommonPopup").html("");
            $("#divCommonPopup").hide();
            break;
    }
}

// 포커스용 공통팝업
function funcGenerateFocusCommonPopup(title, content, focusId) {
    $("#divCommonPopup").empty();

    var commonPopup = commonPopupTemplate;
    commonPopup = commonPopup.replace(/#POPUP_TITLE#/g, title);
    commonPopup = commonPopup.replace(/#POPUP_CONTENT#/g, content);
    commonPopup = commonPopup.replace(/#POPUP_GUBUN#/g, "");
    commonPopup = commonPopup.replace(/#BUTTON#/g, "<button type='button' class='btn_pop' onclick='funcFocusOn(\"" + focusId + "\")'>확인</button>");

    $("#divCommonPopup").html(commonPopup);
    $("#divCommonPopup").show();
}

// 포커싱
function funcFocusOn(focusId) {
    $("#divCommonPopup").hide();
    if (focusId !== undefined &&  focusId !== "") {
        $("#" + focusId).focus();
    }
}