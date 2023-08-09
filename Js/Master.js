$(document).ready(function () {
    $("#btnPersonalInforTerms").on("click", function () {
        window.open(SERVICE_URL + "/PersonalInfoTerms.aspx?organSeq=" + $(this).data("organSeq"));
    });
});

// 동적 이벤트 추가
// 공통 팝업 확인 버튼 Click
$(document).on("click", "#btnCommonPopupConfirm", funcCommonPopupConfirm);
// 핸드폰 번호 마스크
$(document).on("focus", ".clsMaskPhone", function () {
    var $this = $(this);
    var masks = ['000-000-00000', '000-0000-0000'];
    var options = {
        onKeyPress: function (cep, e, field, options) {
            var mask = (cep.length == 13) ? masks[1] : masks[0];
            $this.mask(mask, options);
        }
    };
    var mask = ($(this).val().length == 13) ? masks[1] : masks[0];
    $this.mask(mask, options);
});
// 생년월일 마스크
$(document).on("focus", ".clsMaskBirthday", function () {
    $(this).mask("0000-00-00");
});