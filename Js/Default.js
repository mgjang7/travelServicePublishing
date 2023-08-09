
$(document).ready(function() {
    $(".clsGoProductDetail").on("click", function () {
        var organLandingUrl = $("#hidOrganLandingUrl").val();
        if (organLandingUrl != "") {
            open("https://pkgtour.naver.com/domestic-products/" + organLandingUrl + "/" + encodeURIComponent($(this).data("productCd")));
        }
    });
    $("#btnMyPage").on("click", function () {
        location.replace(SERVICE_URL + PATH_MYPAGE + "ReservationList.aspx");
    });
});

// PC 약관 클릭
$(document).on("click", ".clsBtnTerms_PC", function () {
    var idx = $(this).data("idx");
    $(".clsBtnTerms_PC").removeClass("active");
    $(this).addClass("active");
    $(".clsDivTerms").hide();
    $("#divTerms" + idx).show();
});

// MO 약관 클릭
$(document).on("click", ".clsBtnTerms_MO", function () {
    var idx = $(this).data("idx");

    $(".clsDivTerms_MO").get().forEach(function (div) {
        div.style.maxHeight = null;
    });
    $(".clsLblTemrs_MO").removeClass("cb_ov");
    $(this).toggleClass("active_ov");

    var panel = this.nextElementSibling;

    if ($(this).hasClass("active_ov") == true) {
        $("#lblTerms" + idx + "_MO").addClass("cb_ov");
        panel.style.maxHeight = panel.scrollHeight + "px";
        $(".clsBtnTerms_MO").not("[data-idx=" + idx + "]").removeClass("active_ov");
    } else {
        panel.style.maxHeight = null;
    }
});