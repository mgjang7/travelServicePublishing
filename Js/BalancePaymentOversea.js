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
        var returnUrl = SERVICE_URL + $("#hidOrganUrl").val() + "BalancePaymentOverseaComplete.aspx?key=" + $("#hidKey").val() + "&type=" + paymentType;
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
                    "categoryId": "OVERSEA",
                    "uid": "" + $("#hidProductCd").val().replace("|", "") + "",
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

    // hidden
    $("#hidNetPrice").val(totalNetPrice);
    $("#hidDiscountPrice").val(totalDiscountPrice);
    $("#hidActPrice").val(totalActPrice);
}