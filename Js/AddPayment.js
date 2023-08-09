var oPay;

$(document).ready(function () {
    if ($("#promotionCount").val() == "0") {
        $("#promotionInfo").hide();
    }

    // 요금계산
    funcCalcPrice();

    // 이벤트 등록
    $("#btnNPay").on("click", function () {
        // 세션스토리지에 url 저장
        var paramObj = funcGetParameter();
        sessionStorage.setItem("TRIPPLAT_NPAY_ERROR_RETURN_URL", location.pathname + funcSerializeQueryString(paramObj));

        var paymentType = $("#hidPaymentType").val();
        var tempReservationId = $("#hidTempReservationId").val();
        var returnUrl = SERVICE_URL + $("#hidOrganUrl").val() + "AddPaymentComplete.aspx?key=" + $("#hidKey").val() + "&tempReservationId=" + tempReservationId + "&type=" + paymentType;
        if (paymentType == "NPAYPT01") { // 일반 결제
            oPay.open({
                "merchantPayKey": "" + $("#hidReservationId").val() + "",
                "merchantUserKey": "" + $("#hidCustomerId").val() + "",
                "productName": "" + $("#hidProductNm").val() + "",
                "productCount": $("#hidTotalTraveler").val(),
                "totalPayAmount": $("#hidPayment").val(),
                "taxScopeAmount": $("#hidPayment").val(),
                "taxExScopeAmount": 0,
                "returnUrl": returnUrl,
                "useCfmYmdt": "" + $("#hidConfirmDate").val() + "",
                "productItems": [{
                    "categoryType": "TRAVEL",
                    "categoryId": "DOMESTIC",
                    // "uid": "" + $("#hidProductCd").val().replace("|", "") + "",
                    "uid": "" + $("#hidProductCd").val().replaceAll("|", "") + "",
                    "name": "" + $("#hidProductNm").val() + "",
                    "startDate": "" + $("#hidDepartureDate").val() + "",
                    "endDate": "" + $("#hidArrivalDate").val() + "",
                    "count": $("#hidTotalTraveler").val()
                }]
            });
        } else {
            oPay.open({
                "actionType": "NEW",
                "productCode": "" + $("#hidProductCd").val() + "",
                "productName": "" + $("#hidProductNm").val() + "",
                "totalPayAmount": + $("#hidPayment").val(),
                "returnUrl": "" + returnUrl + ""
            });
        }
    });
});

// 요금 계산
function funcCalcPrice() {
    var totalNetPrice = Number($("#hidPayment").val());
    var totalDiscountPrice = 0;
    var totalActPrice = totalNetPrice - totalDiscountPrice;

    // display
    $("#spnActPrice2").text(totalActPrice.toNumberWithComma());

    // promotionData init
    if ($("#taPromotionData").length > 0) {
        PROMOTION_DATA = JSON.parse(funcDecodeUriHiddenInfo($("#taPromotionData").text()));
    }

    var accPromotionAmount = 0;
    if (totalActPrice > 0) {
        var basicPromotionAmount = Math.floor(Math.min(100000, (totalActPrice * 0.01)));

        if ($("#hidPromotionYn").val() == "Y") {
            PROMOTION_DATA.forEach(function (promotion) {
                var promotionAmount = 0;

                promotionAmount = Math.floor(totalActPrice * promotion.NPayAccPercent * 0.01);

                if (promotion.NPayAccLimit > 0) {
                    promotionAmount = Math.min(promotion.NPayAccLimit, promotionAmount);
                }

                $("#str" + promotion.PromotionCd).text(promotionAmount.toNumberWithComma() + " 원");
                accPromotionAmount += promotionAmount;
            });

            $("#strNPayMaxPoint").text((basicPromotionAmount + accPromotionAmount).toNumberWithComma() + " 원");
            $("#strBasicPromotion").text(basicPromotionAmount.toNumberWithComma() + " 원");
            $("#spnBasicPromotion").text("※ 출발일(" + $("#hidDepartureDay").data("month") + "/" + $("#hidDepartureDay").data("day") + ") 이후 1영업일에 적립");
            $(".clsPromotion").show();
        } else {
            $("#strNPayPoint").text(basicPromotionAmount.toNumberWithComma() + " 원");
            $("#spnNPayPointDesc").text("※ 출발일(" + $("#hidDepartureDay").data("month") + "/" + $("#hidDepartureDay").data("day") + ") 이후 1영업일에 적립");
            $("#divNpayPoint").show();
        }

        $("#strNPayPrice").text(Math.max(0, (totalActPrice - (basicPromotionAmount + accPromotionAmount))).toNumberWithComma() + " 원");
        $("#divNPayPrice").show();
    } else {
        if ($("#hidPromotionYn").val() == "Y") {
            PROMOTION_DATA.forEach(function (promotion) {
                $("#str" + promotion.PromotionCd).empty();
            });

            $("#strNPayMaxPoint").empty();
            $("#strBasicPromotion").empty();
            $("#spnBasicPromotion").empty();
            $(".clsPromotion").hide();
        } else {
            $("#divNpayPoint").hide();
            $("#strNPayPoint").empty();
            $("#spnNPayPointDesc").empty();
        }

        $("#strNPayPrice").empty();
        $("#divNPayPrice").hide();
    }

    // hidden
    $("#hidNetPrice").val(totalNetPrice);
    $("#hidDiscountPrice").val(totalDiscountPrice);
    $("#hidActPrice").val(totalActPrice);
    $("#hidPromotionAmount").val(accPromotionAmount);
}