var oPay;
var PROMOTION_DATA;
var DISCOUNT_PRICE;

// NPay 메시지 표시
function funcNPayMessage(message) {
    funcGenerateCommonPopup("네이버페이", message, "NPayProcessMessage");
}

$(document).ready(function () {
    funcInit();
    $(".clsCalcBtn[data-calc=plus][data-type=AD]")[0].click();

    $(window).scroll(function () {
        if ($(this).scrollTop() > 200) {
            $('.go_top').fadeIn();
        } else {
            $('.go_top').fadeOut();
        }
    });
    // 이벤트 바인딩
    $("#h2Title").on("click", function () {
        var organLandingUrl = $("#hidOrganLandingUrl").val();
        var detailCd = $("#hidSlctdDetailCd").val().replaceAll("_", "|");
        if (organLandingUrl != "") {
            if (detailCd == "") {
                funcGenerateCommonPopup("예약", "먼저 날짜를 선택해주십시오.", "");
                return;
            }
            open("https://pkgtour.naver.com/domestic-products/" + organLandingUrl + "/" + encodeURIComponent(detailCd));
        }
    });
    // 달력 뒤로가기, 앞으로 가기
    $("#btnPreMonth").on("click", function () {
        var preLongDay = $("#hidPreLongDay").val();
        var preDate = new Date(preLongDay);
        var nowDate = new Date();

        if (preDate.getFullYear() < nowDate.getFullYear() ||
            (preDate.getFullYear() == nowDate.getFullYear() && preDate.getMonth() < nowDate.getMonth())) {
            return;
        }

        var yearAndMonth = $("#hidPreYearAndMonth").val();
        $("#spnCalendarYearAndMonth").empty();
        $("#spnCalendarYearAndMonth").append(yearAndMonth);

        var calendarDetail = $("#hidCalendarDetailPre").val();
        $("#tbdCalendarDetail").empty();
        $("#tbdCalendarDetail").append(calendarDetail);

        // 전, 후 달력 및 요금 데이터 추가
        funcSetCalendarData($(this).data("direction"));
    });
    $("#btnNextMonth").on("click", function () {
        var nextLongDay = $("#hidNextLongDay").val();
        var nextDate = new Date(nextLongDay);
        var endDate = new Date((new Date().getFullYear() + 2) + "-12-01");

        if (nextDate > endDate) {
            return;
        }

        var yearAndMonth = $("#hidNextYearAndMonth").val();
        $("#spnCalendarYearAndMonth").empty();
        $("#spnCalendarYearAndMonth").append(yearAndMonth);

        var calendarDetail = $("#hidCalendarDetailNext").val();
        $("#tbdCalendarDetail").empty();
        $("#tbdCalendarDetail").append(calendarDetail);

        // 전, 후 달력 및 요금 데이터 추가
        funcSetCalendarData($(this).data("direction"));
    });

    // 요금 필터링
    $(".clsPriceFilter").on("change", function () {

        var optionConditionArr = [];

        $(".clsPriceFilter").get().forEach(function (filteringConditionItem) {
            if ($(filteringConditionItem).val() != "all") {
                optionConditionArr.push($(filteringConditionItem).val());
            }
        });

        // 필터링
        var priceInfoArr = JSON.parse(funcDecodeUriHiddenInfo($("#hidPriceInfo").val()));
        
        var filteredPriceInfoArr = priceInfoArr;

        filteredPriceInfoArr = filteredPriceInfoArr.filter(function (item) {
            if (optionConditionArr.length == 0) {
                return true;
            }

            var result = true;

            optionConditionArr.forEach(function (option) {
                if (item["Options"].includes(option) == false) {
                    result = false;
                }
            });

            return result;
        });

        $("#ulPackagePriceList").empty();

        if (filteredPriceInfoArr.length > 0) {
            filteredPriceInfoArr.forEach(function (priceInfoObj) {
                var priceInfo = priceInfoTemplate;

                if (priceInfoObj.CDPrice == 0) {
                    var template = childZeroPriceInfoTemplate;
                    priceInfo = priceInfo.replace(/#CHILD_PRICE_DIV#/g, template);
                } else {
                    var template = childPriceInfoTemplate;
                    priceInfo = priceInfo.replace(/#CHILD_PRICE_DIV#/g, template);
                }

                priceInfo = priceInfo.replace(/#ADULT_RANGE_INFO#/g, priceInfoObj.AdultRangeInfo == null || priceInfoObj.AdultRangeInfo == "" ? "" : priceInfoObj.AdultRangeInfo + "  &nbsp;&nbsp;|&nbsp;&nbsp;");
                priceInfo = priceInfo.replace(/#CHILD_RANGE_INFO#/g, priceInfoObj.ChildRangeInfo == null || priceInfoObj.ChildRangeInfo == "" ? "" : (priceInfoObj.CDPrice > 0 ? priceInfoObj.ChildRangeInfo + "  &nbsp;&nbsp;|&nbsp;&nbsp;" : priceInfoObj.ChildRangeInfo));
                priceInfo = priceInfo.replace(/#INFANT_RANGE_INFO#/g, priceInfoObj.ChildRangeInfo == null || priceInfoObj.ChildRangeInfo == "" ? "" : priceInfoObj.ChildRangeInfo);
                priceInfo = priceInfo.replace(/#INFANT_RANGE_INFO#/g, priceInfoObj.InfantRangeInfo);
                priceInfo = priceInfo.replace(/#MASTERCD#/g, priceInfoObj.MasterCd);
                priceInfo = priceInfo.replace(/#DETAILCD#/g, priceInfoObj.DetailCd);
                priceInfo = priceInfo.replace(/#ORGANSEQ#/g, priceInfoObj.OrganSeq);
                priceInfo = priceInfo.replace(/#PRICECD#/g, priceInfoObj.PriceCd);
                priceInfo = priceInfo.replace(/#LOOP#/g, priceInfoObj.Loop);
                priceInfo = priceInfo.replace(/#ADPRICE#/g, priceInfoObj.ADPrice.toNumberWithComma());
                priceInfo = priceInfo.replace(/#ADCNT#/g, priceInfoObj.ADCnt);
                priceInfo = priceInfo.replace(/#OV_ADULT#/g, priceInfoObj.ADCnt > 0 ? "ov_minus" : "");
                priceInfo = priceInfo.replace(/#CDPRICE#/g, priceInfoObj.CDPrice.toNumberWithComma());
                priceInfo = priceInfo.replace(/#CDCNT#/g, priceInfoObj.CDCnt);
                priceInfo = priceInfo.replace(/#OV_CHILD#/g, priceInfoObj.CDCnt > 0 ? "ov_minus" : "");

                var optionGubun = "";

                if (priceInfoObj.OpCcd1Nm != null) {
                    optionGubun += "<span>" + priceInfoObj.OpCcd1Nm + "</span>"
                }
                if (priceInfoObj.OpCcd2Nm != null) {
                    optionGubun += "<span>" + priceInfoObj.OpCcd2Nm + "</span>"
                }
                if (priceInfoObj.OpCcd3Nm != null) {
                    optionGubun += "<span>" + priceInfoObj.OpCcd3Nm + "</span>"
                }
                if (priceInfoObj.OpCcd4Nm != null) {
                    optionGubun += "<span>" + priceInfoObj.OpCcd4Nm + "</span>"
                }
                if (priceInfoObj.OpCcd5Nm != null) {
                    optionGubun += "<span>" + priceInfoObj.OpCcd5Nm + "</span>"
                }
                if (priceInfoObj.PriceNm != null) {
                    optionGubun += "<span>" + priceInfoObj.PriceNm + "</span>"
                }
                priceInfo = priceInfo.replace(/#OPTION_GUBUN#/g, optionGubun);

                $("#ulPackagePriceList").append(priceInfo);
            });
        } else {
            $("#ulPackagePriceList").append("<li class='noprod'>예약가능한 상품이 없습니다.<br />요금 필터 또는 여행 날짜를 변경해주세요.</li>");
        }
    });

    // 필터링 초기화 버튼
    $("#btnFilteringInit").on("click", function () {
        $(".clsPriceFilter").each(function (selectLoop, selectItem) {
            $(selectItem).val("all").trigger("change");
        });
    });
    // 프로모션 링크
    $(".swiper-slide").on("click", function () {
        if ($("#hidPromotionYn").val() == "Y") {
            var url = $(this).data("bannerUrl");
            if (url != undefined && url != "") {
                window.open(url);
            }
        }
    });
    // 프로모션 이미지 / 결제 / 안내 문구 동적 변경
    $(window).resize(function () {
        if (window.innerWidth < 869) {
            $(".clsPromotionBanner[data-gubun=PC]").hide();
            $(".clsPromotionBanner[data-gubun=MO]").show();
            $(".btn-pay").addClass("mobile");
            $(".btn-pay").removeClass("pc");
            $("#spanNoticeMO").show();
            $("#spanNoticePC").hide();
        } else {
            $(".clsPromotionBanner[data-gubun=PC]").show();
            $(".clsPromotionBanner[data-gubun=MO]").hide();
            $(".btn-pay").removeClass("mobile");
            $(".btn-pay").addClass("pc");
            $("#spanNoticeMO").hide();
            $("#spanNoticePC").show();
        }
    }).resize();
    $(".clsBenefitItem").on("click", function () {
        $(".clsBenefitItem").removeClass("on");
        $("#" + $(this).data("seq")).prop("checked", true);
        $(this).addClass("on");
        SelectPerkCoupon($(this).data("selectCouponCd"), $(this).data("selectSeq"));
    });
    $("[name='rdoBenefit']").on("click", function () {
        $(".clsBenefitItem").removeClass("on");
        $("#" + $(this).data("seq")).addClass("on");
        SelectPerkCoupon($(this).data("selectCouponCd"), $(this).data("selectSeq"));
    });
    $('._coupon_section .benefit_wrap .item input').on('change', function () {
        if ($(this).prop('checked')) {
            $('._coupon_section .benefit_wrap .item').removeClass('on');
            $(this).closest('.item').addClass('on');
        }
    });
    $('._coupon_section .list_wrap .headerBox').on('click', function () {
        $(this).closest('.list_wrap').toggleClass('open');
    });
    $(".clsPerkPopupHide").on("click", function () {
        $("#sectionPerkPopup").removeClass("visible");
    });
    $(".clsPerkPopup").on("click", function () {
        PerkPopupShow($(this).data("couponCd"), $(this).data("seq"));
    });
    $("#btnDiscountPopupShow").on("click", function () {
        $("#sectionDiscountPopup").addClass("visible");
    });
    $(".clsDiscountPopupHide").on("click", function () {
        $("#sectionDiscountPopup").removeClass("visible");
    });
    $(".clsCouponItem").on("click", function () {
        if ($(this).data("active") == "Y") {
            $("#" + $(this).data("seq")).prop("checked", true);
            SelectDiscountCoupon($(this).data("selectCouponCd"), $(this).data("selectSeq"));
        }
    });
    $("[name='rdoDiscountCoupon']").on("click", function () {
        SelectDiscountCoupon($(this).data("selectCouponCd"), $(this).data("selectSeq"));
    });

    $("#ulGradePopup li").click(function () {
        $(this).addClass("on");
        $("#ulGradePopup li").not(this).removeClass("on");

        if ($(this).text() == "베이직") {
            $('.contBox').eq(0).show();
            $('.contBox').eq(1).hide();
            $('.contBox').eq(2).hide();
        } else if ($(this).text() == "스마트") {
            $('.contBox').eq(1).show();
            $('.contBox').eq(0).hide();
            $('.contBox').eq(2).hide();
        } else if ($(this).text() == "골드") {
            $('.contBox').eq(2).show();
            $('.contBox').eq(0).hide();
            $('.contBox').eq(1).hide();
        }
    });

    $('#btnHideMemberInfoPopup').on('click', function () {
        $('#sectionMemberInfoPopup').removeClass('visible');
    });

    $('#btnShowMemberInfoPopup').on('click', function () {
        $('#sectionMemberInfoPopup').addClass('visible');
    });

    if ($('#hidMembershipYn').val() == "Y") {
        $('.naver_plus_membership').show();
    } else {
        $('.naver_plus_membership').hide();
    }
});

// 동적 이벤트 바인딩
// NPay 버튼 클릭
$(document).on("click", "#btnNPay", function () {
    var $this = $(this);

    $this.attr("disabled", true);
    funcShowReservationLoading();

    // 예약자, 일행 정보 validation
    if (funcReservationValidation() == false) {
        $this.attr("disabled", false);
        funcHideReservationLoading();
        return;
    }

    funcResPreProcess();
});

// 달력 날짜 선택
$(document).on("click", ".clsDetail", function () {
    $this = $(this);

    // 예약마감 상태이면 리턴
    var thisStatus = $this.data("orgCls");
    if (thisStatus == "sign_04") {
        return;
    }

    var queryString = window.location.search;
    var urlParams = new URLSearchParams(queryString);
    if (urlParams.has("tr") == true && urlParams.has("trx") == true) {
        var tr = urlParams.get("tr");
        var trx = urlParams.get("trx");;
        location.href = SERVICE_URL + $("#hidOrganUrl").val() + "reservation.aspx?detailCd=" + encodeURIComponent($(this).data("detailCd").toString().replace(/_/g, "|")) + "&tr=" + tr + "&trx=" + trx;
    } else {
        location.href = SERVICE_URL + $("#hidOrganUrl").val() + "reservation.aspx?detailCd=" + encodeURIComponent($(this).data("detailCd").toString().replace(/_/g, "|"));
    }
});

// 인원 +, - 버튼
$(document).on("click", ".clsCalcBtn", function () {
    var $this = $(this);
    var $container = $this.parents(".clsPriceContainer");
    var calc = $this.data("calc");
    var type = $this.data("type");
    var loop = $container.data("loop");

    var priceInfoArr = JSON.parse(funcDecodeUriHiddenInfo($("#hidPriceInfo").val()));
    var priceInfoObj = priceInfoArr[loop];

    // 인원수 계산
    var cnt = priceInfoObj[type + "Cnt"];
    if (calc == "minus") {
        cnt = Math.max(0, cnt - 1);
        if (cnt == 0) {
            $this.removeClass("ov_minus")
        }
    } else if (calc == "plus") {
        cnt++;
        if ($this.siblings(".clsCalcBtn[data-calc=minus]").hasClass("ov_minus") == false) {
            $this.siblings(".clsCalcBtn[data-calc=minus]").addClass("ov_minus");
        }
    }

    // 인원수 변경시 ( + - ) 요금 변경
    var x = $this.parents('.p_td').children('.tit_age').children('.price');
    if (type == "AD") {
        var price_type = priceInfoObj.ADPrice;
    } else if (type == "CD") {
        var price_type = priceInfoObj.CDPrice;
    }
    var xPrice = (parseInt(price_type) * parseInt(cnt));
    x.text(xPrice.toNumberWithComma()+ "원");


    priceInfoObj[type + "Cnt"] = cnt;

    // 인원수 업데이트
    $("#spn" + type + "Cnt_" + loop).empty().text(cnt + "명");

    // 요금정보 업데이트
    $("#hidPriceInfo").val(encodeURIComponent(JSON.stringify(priceInfoArr)));

    // 선택된 요금 안내, 일행정보
    funcSelectedPriceInfo();

    // 요금계산
    funcCalcPrice();

    // 쿠폰
    $("#hidDiscountCouponCd").val("");
    $("#hidDiscountCouponDetailSeq").val(0);
    $("#hidDiscountCouponPrice").val(0);
    $("#hidPerkCouponCd").val("");
    $("#hidPerkDetailSeq").val(0);
    $("#hidPerkUseCnt").val(0);
    let couponArray = JSON.parse($("#hidCouponData").val());
    if (couponArray.length == 0 || priceInfoObj["ADCnt"] + priceInfoObj["CDCnt"] + priceInfoObj["E1Cnt"] == 0) {
        $("#sectionCoupon").hide();
        SelectDiscountCoupon(0, 0);
    } else {
        $("#sectionCoupon").show();
        initDiscountCoupon();
        initBenefitCoupon();
    }
});

function initDiscountCoupon() {
    let discountCouponDetailArray = JSON.parse($("#hidCouponDetailData").val());
    if (discountCouponDetailArray.length > 0) {
        let totalPayment = $("#hidNetPrice").val();
        // 데이터 초기화
        $("#sectionDiscountPopupArea01").html("");
        $("#sectionDiscountPopupArea02").html("");
        $("#sectionDiscountPopupArea03").html("");
        $("#sectionDiscountPopupArea04").html("");
        let couponDetailArray = JSON.parse($("#hidCouponDetailData").val());
        let activeCnt = 0;
        Object.keys(couponDetailArray).forEach(function (couponItemIndex) {
            let couponArray = JSON.parse($("#hidCouponData").val());
            let couponData = couponArray.filter(function (e) {
                return e.CouponCd == couponDetailArray[couponItemIndex].CouponCd;
            })
            let discountCouponUseCountArray = JSON.parse($("#hidCouponUseData").val());
            let discountCouponUseCountData = discountCouponUseCountArray.filter(function (e) {
                return e.CouponCd == couponDetailArray[couponItemIndex].CouponCd;
            })
            let remainCnt = 0;
            if (couponData[0].UnlimitedYn == "Y") {
                remainCnt = 1;
            } else {
                if (discountCouponUseCountData.length == 0) {
                    remainCnt = couponData[0].CouponCnt;
                } else {
                    remainCnt = couponData[0].CouponCnt - discountCouponUseCountData[0].UseCnt;
                }
            }
            let discountPrice = 0;
            if ((remainCnt - 1) >= 0) {
                if (couponDetailArray[couponItemIndex].ApplyStartPrice <= totalPayment && couponDetailArray[couponItemIndex].ApplyEndPrice >= totalPayment) {
                    if (couponDetailArray[couponItemIndex].CouponCondCcd == "ACCPAYGB01") {
                        discountPrice = couponDetailArray[couponItemIndex].DiscountCouponPrice;
                    } else {
                        discountPrice = Math.ceil(totalPayment * couponDetailArray[couponItemIndex].DiscountCouponPercent * 0.01);
                    }
                    if (couponDetailArray[couponItemIndex].MaxDiscountPrice > 0 && discountPrice > couponDetailArray[couponItemIndex].MaxDiscountPrice) {
                        discountPrice = couponDetailArray[couponItemIndex].MaxDiscountPrice;
                    }
                    $("#trDiscountItem" + couponDetailArray[couponItemIndex].Seq).data("discountPrice", discountPrice);
                    $("#trDiscountItem" + couponDetailArray[couponItemIndex].Seq).data("active", "Y");
                    $("#rdoDiscountCoupon" + couponDetailArray[couponItemIndex].Seq).prop("disabled", false);
                    activeCnt++;
                } else {
                    $("#trDiscountItem" + couponDetailArray[couponItemIndex].Seq).data("discountPrice", 0);
                    $("#trDiscountItem" + couponDetailArray[couponItemIndex].Seq).data("active", "N");
                    $("#rdoDiscountCoupon" + couponDetailArray[couponItemIndex].Seq).prop("disabled", true);
                }
            } else {
                $("#trDiscountItem" + couponDetailArray[couponItemIndex].Seq).data("discountPrice", 0);
                $("#trDiscountItem" + couponDetailArray[couponItemIndex].Seq).data("active", "N");
                $("#rdoDiscountCoupon" + couponDetailArray[couponItemIndex].Seq).prop("disabled", true);
            }
        });
        if (activeCnt > 0) {
            let prevPrice = 0;
            $("#tblDiscountCoupon tbody tr").each(function (index, item) {
                if ($(item).data("active") == "Y" && $(item).data("noCoupon") == "N") {
                    if (prevPrice == 0) {
                        $("#" + $(item).data("seq")).prop("checked", true);
                        SelectDiscountCoupon($(item).data("selectCouponCd"), $(item).data("selectSeq"));
                    } else {
                        if (prevPrice < $(item).data("discountPrice")) {
                            $("#" + $(item).data("seq")).prop("checked", true);
                            SelectDiscountCoupon($(item).data("selectCouponCd"), $(item).data("selectSeq"));
                        }
                    }
                    prevPrice = $(item).data("discountPrice");
                }
            });
        } else {
            $("#rdoDiscountCoupon0").prop("checked", true);
            SelectDiscountCoupon("0", "0");
        }
    } else {
        $("#divListWrap").hide();
        $("#divCouponButton").hide();
    }
}

function SelectDiscountCoupon(coupon, seq) {
    let totalPayment = Number($("#hidNetPrice").val());
    if (coupon == "0") {
        DISCOUNT_PRICE = 0;
        funcCalcPrice();
        $("#sectionDiscountPopupArea01").html(totalPayment.toNumberWithComma() + "원");
        $("#sectionDiscountPopupArea02").html("");
        $("#sectionDiscountPopupArea03").html("0원");
        $("#sectionDiscountPopupArea04").html(totalPayment.toNumberWithComma() + "원");
        $("#divListWrap").hide();
        $("#hidDiscountCouponCd").val("");
        $("#hidDiscountCouponDetailSeq").val(0);
        $("#hidDiscountCouponPrice").val(0);
    } else {
        let couponArray = JSON.parse($("#hidCouponData").val());
        let couponData = couponArray.filter(function (e) {
            return e.CouponCd == coupon;
        })
        let discountCouponDetailArray = JSON.parse($("#hidCouponDetailData").val());
        let discountCouponDetailData = discountCouponDetailArray.filter(function (e) {
            return e.Seq == seq;
        });
        let discountPrice = 0;
        if (discountCouponDetailData[0].CouponCondCcd == "ACCPAYGB01") {
            discountPrice = discountCouponDetailData[0].DiscountCouponPrice;
        } else {
            discountPrice = Math.ceil(totalPayment * discountCouponDetailData[0].DiscountCouponPercent * 0.01);
        }
        if (discountCouponDetailData[0].MaxDiscountPrice > 0 && discountPrice > discountCouponDetailData[0].MaxDiscountPrice) {
            discountPrice = discountCouponDetailData[0].MaxDiscountPrice;
        }
        $("#sectionDiscountPopupArea01").html(totalPayment.toNumberWithComma() + "원");
        $("#sectionDiscountPopupArea02").html(couponData[0].Name);
        $("#sectionDiscountPopupArea03").html((discountPrice * -1).toNumberWithComma() + "원");
        $("#sectionDiscountPopupArea04").html((totalPayment - discountPrice).toNumberWithComma() + "원");
        $("#spanTotalDiscountTitle").html(couponData[0].Name);
        $("#spanTotalDiscountPrice").html((discountPrice * -1).toNumberWithComma() + "원");

        let prevNetPrice = Number($("#hidNetPrice").val());
        DISCOUNT_PRICE = discountPrice;
        funcCalcPrice();
        $("#sNowPayment").text(prevNetPrice.toNumberWithComma() + "원");
        $("#divListWrap").show();
        $("#hidDiscountCouponCd").val(coupon);
        $("#hidDiscountCouponDetailSeq").val(seq);
        $("#hidDiscountCouponPrice").val(discountPrice);
    }
}

function initBenefitCoupon() {
    let totalPeopleCnt = 0;
    var priceInfoArr = JSON.parse(funcDecodeUriHiddenInfo($("#hidPriceInfo").val()));
    $(priceInfoArr).each(function (index, item) {
        totalPeopleCnt += item.ADCnt;
        totalPeopleCnt += item.CDCnt;
        totalPeopleCnt += item.E1Cnt;
    });
    if ($("#ulBenefitList").children().length > 0) {
        let viewCnt = 0;
        $(".clsBenefitItem").removeClass("on");
        $("#ulBenefitList li").each(function (index, item) {
            let couponArray = JSON.parse($("#hidCouponData").val());
            let couponData = couponArray.filter(function (e) {
                return e.CouponCd == $(item).data("couponCd");
            })
            let perkUseCountArray = JSON.parse($("#hidPerkUseData").val());
            let perkUseCountData = perkUseCountArray.filter(function (e) {
                return e.CouponCd == $(item).data("couponCd");
            })
            if (couponData[0].UnlimitedYn == "Y") {
                $(item).data("view", "1");
                $(item).show();
            } else {
                let remainCnt = 0;
                if (perkUseCountData.length == 0) {
                    remainCnt = couponData[0].CouponCnt;
                } else {
                    remainCnt = couponData[0].CouponCnt - perkUseCountData[0].UseCnt;
                }
                if (couponData[0].PerksUseGubun == "R") {
                    if ((remainCnt - 1) >= 0) {
                        $(item).data("view", "1");
                        $(item).show();
                    } else {
                        $(item).data("view", "0");
                        $(item).hide();
                    }
                } else {
                    let checkCnt = parseInt(totalPeopleCnt / couponData[0].PerksApplyCnt);
                    if (checkCnt == 0 || (remainCnt - checkCnt) < 0) {
                        $(item).data("view", "0");
                        $(item).hide();
                    } else {
                        $(item).data("view", "1");
                        $(item).show();
                    }
                }
            }
        });
        $("#ulBenefitList li").each(function (index, item) {
            if ($(item).data("view") == "1") {
                viewCnt++;
                if (viewCnt == 1) {
                    $(item).children().first().click();
                    $(item).addClass("on");
                    SelectPerkCoupon($(item).data("selectCouponCd"), $(item).data("selectSeq"));
                    $("#divBenefitWrap").show();
                }
            }
        });
    } else {
        $("#divBenefitWrap").hide();
    }
}

function PerkPopupShow(coupon, seq) {
    let couponArray = JSON.parse($("#hidCouponData").val());
    let couponData = couponArray.filter(function (e) {
        return e.CouponCd == coupon;
    })
    let perkDetailArray = JSON.parse($("#hidPerkDetailData").val());
    let perkDetailData = perkDetailArray.filter(function (e) {
        return e.Seq == seq;
    });
    let perkUseCountArray = JSON.parse($("#hidPerkUseData").val());
    let perkUseCountData = perkUseCountArray.filter(function (e) {
        return e.CouponCd == coupon;
    })
    // 데이터 초기화
    $("#sectionPerkPopupArea01").html("");
    $("#sectionPerkPopupArea02").html("");
    $("#sectionPerkPopupArea03").html("");
    $("#sectionPerkPopupArea04").html("");
    $("#sectionPerkPopupArea05").html("");
    $("#sectionPerkPopupArea06_NORMAL").hide();
    $("#sectionPerkPopupArea06_BASIC").hide();
    $("#sectionPerkPopupArea06_SMART").hide();
    $("#sectionPerkPopupArea06_GOLD").hide();
    $("#sectionPerkPopupArea07").html("");
    $("#sectionPerkPopupArea08").html("");
    $("#sectionPerkPopupArea09").html("");

    // 데이터 설정
    $("#sectionPerkPopupArea01").html(couponData[0].Name);
    $("#sectionPerkPopupArea02").html(perkDetailData[0].UseTitle);
    if (couponData[0].UnlimitedYn == "Y") {
        $("#sectionPerkPopupArea03").html("잔여 : 무제한");
    } else {
        let remainCnt = 0;
        if (perkUseCountData.length == 0) {
            remainCnt = couponData[0].CouponCnt;
        } else {
            remainCnt = couponData[0].CouponCnt - perkUseCountData[0].UseCnt;
        }
        $("#sectionPerkPopupArea03").html("잔여 : " + remainCnt.toNumberWithComma() + "개");
    }
    $("#sectionPerkPopupArea04").html(couponData[0].StartBookingDate + " ~ " + couponData[0].EndBookingDate);
    $("#sectionPerkPopupArea05").html(couponData[0].StartDepartureDate + " ~ " + couponData[0].EndDepartureDate);
    switch (perkDetailData[0].ApplyGradeCcd) {
        case "NORMAL":
            $("#sectionPerkPopupArea06_NORMAL").show();
            break;
        case "BASIC":
            $("#sectionPerkPopupArea06_BASIC").show();
            break;
        case "SMART":
            $("#sectionPerkPopupArea06_SMART").show();
            break;
        case "GOLD":
            $("#sectionPerkPopupArea06_GOLD").show();
            break;
    }
    $("#sectionPerkPopupArea07").html(perkDetailData[0].UseTarget);
    $("#sectionPerkPopupArea08").html(perkDetailData[0].UseMethod);
    $("#sectionPerkPopupArea09").html(perkDetailData[0].UseCond);
    $("#sectionPerkPopup").addClass("visible");
}

function SelectPerkCoupon(coupon, seq) {
    let useCount = 0;
    let couponArray = JSON.parse($("#hidCouponData").val());
    let couponData = couponArray.filter(function (e) {
        return e.CouponCd == coupon;
    })
    if (couponData[0].PerksUseGubun == "R") {
        useCount = 1;
    } else {
        let totalPeopleCnt = 0;
        var priceInfoArr = JSON.parse(funcDecodeUriHiddenInfo($("#hidPriceInfo").val()));
        $(priceInfoArr).each(function (index, item) {
            totalPeopleCnt += item.ADCnt;
            totalPeopleCnt += item.CDCnt;
            totalPeopleCnt += item.E1Cnt;
        });
        useCount = parseInt(totalPeopleCnt / couponData[0].PerksApplyCnt);
    }
    $("#hidPerkCouponCd").val(coupon);
    $("#hidPerkDetailSeq").val(seq);
    $("#hidPerkUseCnt").val(useCount);
}

// 선택된 요금 제거 버튼
$(document).on("click", ".clsRmSltdPrice", function () {
    var priceCd = $(this).parent().data("priceCd");

    var priceInfoArr = JSON.parse(funcDecodeUriHiddenInfo($("#hidPriceInfo").val()));
    var priceInfoObjInArr = priceInfoArr.filter(function (priceInfoObj) {
        return priceInfoObj.PriceCd == priceCd;
    });

    var priceInfoObj = priceInfoObjInArr[0];

    priceInfoObj.ADCnt = 0;
    priceInfoObj.CDCnt = 0;
    priceInfoObj.E1Cnt = 0;
    priceInfoObj.E2Cnt = 0;
    priceInfoObj.E3Cnt = 0;

    $("#spnADCnt_" + priceInfoObj.Loop).empty().text("0명");
    $("#spnADCnt_" + priceInfoObj.Loop).siblings(".clsCalcBtn").removeClass("ov_minus");
    $("#spnCDCnt_" + priceInfoObj.Loop).empty().text("0명");
    $("#spnCDCnt_" + priceInfoObj.Loop).siblings(".clsCalcBtn").removeClass("ov_minus");
    $("#spnE1Cnt_" + priceInfoObj.Loop).empty().text("0명");
    $("#spnE1Cnt_" + priceInfoObj.Loop).siblings(".clsCalcBtn").removeClass("ov_minus");
    $("#hidPriceInfo").val(encodeURIComponent(JSON.stringify(priceInfoArr)));

    // 선택된 요금 안내, 일행정보
    funcSelectedPriceInfo();

    // 요금계산
    funcCalcPrice();
});

// 영문성, 영문이름 대문자 변환
$(document).on("keyup", ".clsEngName", function (e) {
    if (!(e.keyCode >= 37 && e.keyCode <= 40)) {
        var inputVal = $(this).val();
        var upperVal = inputVal.replace(/[^a-z\s]/gi, '').toUpperCase();
        $(this).val(upperVal);
    }
});

// PC 약관 클릭
$(document).on("click", ".clsBtnTerms_PC", function () {
    var idx = $(this).data("idx");
    $(".clsBtnTerms_PC").removeClass("active");
    $(this).addClass("active");
    $(".clsDivTerms").hide();
    $("#divTerms" + idx).show();
});
// PC 약관 체크박스
$(document).on("click", ".clsChkTerms_PC", function () {
    var idx = $(this).data("idx");

    if ($(".clsChkTerms_PC:checked").length == $(".clsChkTerms_PC").length) {
        $('html, body').animate({ scrollTop: document.body.scrollHeight }, 700);
    } else if (idx != $(".clsChkTerms_PC").length && $(this).prop("checked") == true) {
        $(".clsBtnTerms_PC[data-idx=" + (idx + 1) + "]").click();
    }
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
// MO 약관 전체동의 체크박스
$(document).on("click", "#chkAllTerms_MO", function () {
    $(".clsChkTerms_MO").prop("checked", $(this).prop("checked"));

    if ($(".clsChkTerms_MO:checked").length == $(".clsChkTerms_MO").length) {
        $('html, body').animate({ scrollTop: document.body.scrollHeight }, 700);

        $(".clsLblTemrs_MO").removeClass("cb_ov");
        $(".clsBtnTerms_MO").removeClass("active_ov");
        $(".clsDivTerms_MO").get().forEach(function (div) {
            div.style.maxHeight = null;
        });
    }
});
// MO 약관 체크박스
$(document).on("click", ".clsChkTerms_MO", function () {
    $("#chkAllTerms_MO").prop("checked", $(".clsChkTerms_MO:checked").length == $(".clsChkTerms_MO").length);

    var idx = $(this).data("idx");
    if ($(".clsChkTerms_MO:checked").length == $(".clsChkTerms_MO").length) {
        $('html, body').animate({ scrollTop: document.body.scrollHeight }, 700);

        $(".clsLblTemrs_MO").removeClass("cb_ov");
        $(".clsBtnTerms_MO").removeClass("active_ov");
        $(".clsDivTerms_MO").get().forEach(function (div) {
            div.style.maxHeight = null;
        });
    } else if (idx != "4" && $(this).prop("checked") == true) {
        $(".clsBtnTerms_MO[data-idx=" + (idx + 1) + "]").click();
    }
});

// 예약자 정보와 동일
$(document).on("click", "#chkAddPaxInfo", function () {
    var $adContainer = $("[id^=divCoInputContainer][id$=AD]").children(".clsCoContainer").eq(0);

    if ($(this).prop("checked") == true) {
        if ($adContainer.find("[name=coName]").length > 0 && $("#txtResName").length > 0) {
            $adContainer.find("[name=coName]").val($("#txtResName").val());
        }
        if ($adContainer.find("[name=coPhone]").length > 0 && $("#txtResPhone").length > 0) {
            $adContainer.find("[name=coPhone]").val($("#txtResPhone").val());
        }
        if ($adContainer.find("[name=coLastName]").length > 0 && $("#txtResLastName").length > 0) {
            $adContainer.find("[name=coLastName]").val($("#txtResLastName").val());
        }
        if ($adContainer.find("[name=coFirstName]").length > 0 && $("#txtResFirstName").length > 0) {
            $adContainer.find("[name=coFirstName]").val($("#txtResFirstName").val());
        }
        if ($adContainer.find("[name=coGender]").length > 0 && $("#selResGender").length > 0) {
            $adContainer.find("[name=coGender]").val($("#selResGender").val());
        }
        if ($adContainer.find("[name=coEmail]").length > 0 && $("#txtResEmail").length > 0) {
            $adContainer.find("[name=coEmail]").val($("#txtResEmail").val());
        }
        if ($adContainer.find("[name=coBirthday]").length > 0 && $("#txtResBirthday").length > 0) {
            $adContainer.find("[name=coBirthday]").val($("#txtResBirthday").val());
        }
    } else {
        $adContainer.find("input,select").each(function (_, paxInfo) {
            if ($(paxInfo).prop("tagName") == "SELECT") {
                $(paxInfo).val("none");
            } else {
                $(paxInfo).val("");
            }
        });
    }
});

$(document).on("click", "#info_icon", function (e) {
    e.preventDefault();
    $('#info_modal').modal("show");
});

// FUNCTION
function funcInit() {
    //popupCheck();

    // select tag library
    $(".clsSelect2").select2();

    // swiper
    var swiperMO = new Swiper(".swiperMO", {
        autoplay: {
            delay: 3000,
            disableOnInteraction: false
        },
        pagination: {
            el: ".swiper-pagination",
            clickable: true
        }
    });
    var swiperPC = new Swiper(".swiperPC", {
        autoplay: {
            delay: 3000,
            disableOnInteraction: false
        },
        pagination: {
            el: ".swiper-pagination",
            clickable: true
        }
    });

    // check stateTokenKey
    if ($("#hidStateTokenKey").length > 0) {
        $.ajax({
            url: PATH_STATIC_AJAX + "AjaxSessionCheck.aspx",
            data: { stk: $("#hidStateTokenKey").val() },
            type: "POST",
            success: function (res) {
                if (res.Result < 0) {
                    var paramObj = funcGetParameter();

                    if (paramObj.t != undefined) {
                        delete paramObj.t;
                    }

                    location.replace(SERVICE_URL + location.pathname + funcSerializeQueryString(paramObj));
                }
            }
        });
    }

    // 네아로 인증여부 분기
    if ($("#btnNPay").data("type") != undefined && $("#btnNPay").data("type") == "redirect") {
        funcShowReservationLoading();

        var resData = JSON.parse(funcDecodeUriHiddenInfo($("#hidResData").val()));

        // 예약자 정보
        $("#txtResName").val(resData.ResUser.Name);
        $("#txtResPhone").val(resData.ResUser.Phone);
        $("#txtResLastName").val(resData.ResUser.LastName);
        $("#txtResFirstName").val(resData.ResUser.FirstName);
        $("#selResGender").val(resData.ResUser.Gender);
        $("#txtResEmail").val(resData.ResUser.Email);
        $("#txtResBirthday").val(resData.ResUser.Birthday);

        // 요청사항
        $("#taAsk").val(resData.Ask);

        // 인원 정보
        var priceInfoArr = JSON.parse(funcDecodeUriHiddenInfo($("#hidPriceInfo").val()));

        priceInfoArr.forEach(function (priceInfo) {
            var countInfo = resData.CountInfos.find(function (countInfo) { return priceInfo.PriceCd == countInfo.PriceCd });
            if (countInfo != undefined) {
                priceInfo.ADCnt = countInfo.ADCnt;
                priceInfo.CDCnt = countInfo.CDCnt;
                priceInfo.E1Cnt = countInfo.E1Cnt;

                var $priceSelectContainer = $(".clsPriceContainer[data-price-cd=" + priceInfo.PriceCd.toString().replaceAll("|", "_") + "]");
                var loop = $priceSelectContainer.data("loop");
                if (priceInfo.ADCnt > 0) {
                    $("#spnADCnt_" + loop).text(priceInfo.ADCnt + "명");
                    $("#spnADCnt_" + loop).prev().addClass("ov_minus");
                }
                if (priceInfo.CDCnt > 0) {
                    $("#spnCDCnt_" + loop).text(priceInfo.CDCnt + "명");
                    $("#spnCDCnt_" + loop).prev().addClass("ov_minus");
                }
                if (priceInfo.E1Cnt > 0) {
                    $("#spnE1Cnt_" + loop).text(priceInfo.E1Cnt + "명");
                    $("#spnE1Cnt_" + loop).prev().addClass("ov_minus");
                }
            }
        });

        // 요금정보 업데이트
        $("#hidPriceInfo").val(encodeURIComponent(JSON.stringify(priceInfoArr)));

        // 선택된 요금 안내, 일행정보
        funcSelectedPriceInfo();

        // 요금계산
        funcCalcPrice();

        // 일행정보
        resData.Travelers.forEach(function (traveler) {
            $("#txtCoName" + traveler.PriceCd.toString().replaceAll("|", "_") + traveler.Gubun + traveler.Seq).val(traveler.Name);
            $("#txtCoPhone" + traveler.PriceCd.toString().replaceAll("|", "_") + traveler.Gubun + traveler.Seq).val(traveler.Phone);
            $("#txtCoLastName" + traveler.PriceCd.toString().replaceAll("|", "_") + traveler.Gubun + traveler.Seq).val(traveler.LastName);
            $("#txtCoFirstName" + traveler.PriceCd.toString().replaceAll("|", "_") + traveler.Gubun + traveler.Seq).val(traveler.FirstName);
            $("#selCoGender" + traveler.PriceCd.toString().replaceAll("|", "_") + traveler.Gubun + traveler.Seq).val(traveler.Gender);
            $("#txtCoEmail" + traveler.PriceCd.toString().replaceAll("|", "_") + traveler.Gubun + traveler.Seq).val(traveler.Email);
            $("#txtCoBirthday" + traveler.PriceCd.toString().replaceAll("|", "_") + traveler.Gubun + traveler.Seq).val(traveler.Birthday);
        });

        // 약관
        $(".clsChkTerms_PC").prop("checked", true);
        $(".clsChkTerms_MO").prop("checked", true);
        $("#chkAllTerms_MO").prop("checked", true);

        // 구매버튼
        var paramR = funcGetParameterByName("r");
        if (paramR != "1") {
            setTimeout(funcResPreProcess, 1000);
        } else {
            $("#divContainer").show();
            funcHideReservationLoading();
        }
    } else {
        if ($("#hidDeviceGubun").val() == "MO") {
            $(".clsBtnTerms_MO").first().click();
        }
    }

    // promotionData init
    if ($("#taPromotionData").length > 0) {
        PROMOTION_DATA = JSON.parse(funcDecodeUriHiddenInfo($("#taPromotionData").text()));
    }

    // 쿠폰
    let couponArray = JSON.parse($("#hidCouponData").val());
    if (couponArray.length == 0) {
        $("#sectionCoupon").hide();
    } else {
        $("#sectionCoupon").show();
    }
    $("#spanTotalDiscountTitle").html("");
    $("#spanTotalDiscountPrice").html("");
    DISCOUNT_PRICE = 0;
}

// 요금 계산
function funcCalcPrice() {
    var totalNetPrice = 0;
    var totalDiscountPrice = DISCOUNT_PRICE;

    var priceInfoArr = JSON.parse(funcDecodeUriHiddenInfo($("#hidPriceInfo").val()));
    var adCnt = 0;
    var cdCnt = 0;
    var e1Cnt = 0;
    var e2Cnt = 0;
    var e3Cnt = 0;
    priceInfoArr.forEach(function (priceInfoObj, priceInfoLoop) {
        totalNetPrice += priceInfoObj.ADCnt * priceInfoObj.ADPrice;
        totalNetPrice += priceInfoObj.CDCnt * priceInfoObj.CDPrice;
        totalNetPrice += priceInfoObj.E1Cnt * priceInfoObj.E1Price;
        totalNetPrice += priceInfoObj.E2Cnt * priceInfoObj.E2Price;
        totalNetPrice += priceInfoObj.E3Cnt * priceInfoObj.E3Price;

        adCnt += priceInfoObj.ADCnt;
        cdCnt += priceInfoObj.CDCnt;
        e1Cnt += priceInfoObj.E1Cnt;
        e2Cnt += priceInfoObj.E2Cnt;
        e3Cnt += priceInfoObj.E3Cnt;
    });

    var totalActPrice = totalNetPrice - totalDiscountPrice;

    // display
    $("#spnNetPrice").text(totalNetPrice.toNumberWithComma());
    $("#spnActPrice").text(totalActPrice.toNumberWithComma());
    $("#spnActPrice2").text(totalActPrice.toNumberWithComma());
    $("#sNowPayment").text(totalActPrice.toNumberWithComma() + "원");
    $("#pResCnt").text("( 성인" + adCnt + " / " + "소아 " + cdCnt + " / " + "유아 " + e1Cnt + " )");

    var nowHtml = '';
    if (adCnt > 0 || cdCnt > 0 || e1Cnt > 0) {
        nowHtml += '<li><p>상품</p><span>총 ' + (adCnt + cdCnt + e1Cnt) + ' 명 (성인 ' + adCnt + ' / 소아 ' + cdCnt + ' / 유아 ' + e1Cnt + ')</span><span class="sm_txt color-grey">' + totalActPrice.toNumberWithComma() + '원</span></li>';
        $("#ulSelectedPrice3").show();
    } else {
        $("#ulSelectedPrice3").hide();
    }
    $("#ulSelectedPrice3").html(nowHtml);

    // promotionData init
    if ($("#taPromotionData").length > 0) {
        PROMOTION_DATA = JSON.parse(funcDecodeUriHiddenInfo($("#taPromotionData").text()));
    }

    var accPromotionAmount = 0;
    if (totalActPrice > 0) {
        var basicPromotionAmount = Math.ceil(Math.min(100000, (totalActPrice * 0.01)));
        var sumAccPercent = 0;

        var npayAccPercentArr = [0];
        for (var i = 0; i < PROMOTION_DATA.length; i++) {
            if (PROMOTION_DATA[i].PromotionTypeCcd == "PROMOTYPE02") {
                npayAccPercentArr.push(PROMOTION_DATA[i].NPayAccPercent);
            }
        }

        if ($("#hidPromotionYn").val() == "Y") {
            PROMOTION_DATA.forEach(function (promotion) {
                var promotionAmount = 0;

                if (promotion.NPayAccTypeCcd == "ACCPAYGB01") {
                    promotionAmount = promotion.NPayAccAmountAdult * adCnt + promotion.NPayAccAmountChild * cdCnt + promotion.NPayAccAmountEtc1 * e1Cnt + promotion.NPayAccAmountEtc2 * e2Cnt + promotion.NPayAccAmountEtc3 * e3Cnt;
                } else if (promotion.NPayAccTypeCcd == "ACCPAYGB02") {
                    promotionAmount = Math.ceil(totalActPrice * promotion.NPayAccPercent * 0.01);
                }

                if (promotion.NPayAccLimit > 0) {
                    promotionAmount = Math.min(promotion.NPayAccLimit, promotionAmount);
                }

                $("#str" + promotion.PromotionCd).text(promotionAmount.toNumberWithComma() + " 원");
                $("#strAccPoint" + promotion.PromotionCd).text(promotionAmount.toNumberWithComma() + " 원");
                accPromotionAmount += promotionAmount;

                if (promotion.PromotionTypeCcd == "PROMOTYPE01") {
                    sumAccPercent += promotion.NPayAccPercent;
                }

                if (promotion.NPayAccLimit > 0) {
                    if (promotion.PromotionTypeCcd == "PROMOTYPE01") {
                        $("#normalAccLimit").text(promotion.NPayAccLimit.toNumberWithComma());
                    } else if (promotion.PromotionTypeCcd == "PROMOTYPE02") {
                        $("#nPayAccLimit").text(promotion.NPayAccLimit.toNumberWithComma());
                    }
                }
            });
            $(".clsPromotion").show();
        } 

        $("#sTotalPayment").text(totalActPrice.toNumberWithComma() + "원");
        $("#strPaymentPc").text(totalActPrice.toNumberWithComma() + "원");

        // 일발적립 금액 계산
        var normalPromotionPrice = Math.ceil(totalActPrice * sumAccPercent * 0.01);

        // 카드사적립 금액 계산
        var cardPromotionPrice = Math.ceil(totalActPrice * Math.max(...npayAccPercentArr) * 0.01);

        let cardPromotionAccFilterData = PROMOTION_DATA.filter(x => x.PromotionTypeCcd === "PROMOTYPE02");
        if (cardPromotionAccFilterData.length > 0 && cardPromotionAccFilterData !== null) {
            if (cardPromotionAccFilterData[0].NPayAccLimit > 0) {
                if (cardPromotionPrice > cardPromotionAccFilterData[0].NPayAccLimit) {
                    cardPromotionPrice = cardPromotionAccFilterData[0].NPayAccLimit;
                }
            }
        }

        let normalPromotionAccFilterData = PROMOTION_DATA.filter(x => x.PromotionTypeCcd === "PROMOTYPE01");
        if (normalPromotionAccFilterData.length > 0 && normalPromotionAccFilterData !== null) {
            if (normalPromotionAccFilterData[0].NPayAccLimit > 0) {
                if (normalPromotionPrice > normalPromotionAccFilterData[0].NPayAccLimit) {
                    normalPromotionPrice = normalPromotionAccFilterData[0].NPayAccLimit;
                }
            }
        }


        var dropdownTopTemplateTemp = dropdownTopTemplate;
        dropdownTopTemplateTemp = dropdownTopTemplateTemp.replace(/#MAX_ACCPERCENT#/g, (Math.max(...npayAccPercentArr) + (sumAccPercent + 1)));
        dropdownTopTemplateTemp = dropdownTopTemplateTemp.replace(/#MAX_NPAY_POINT#/g, (basicPromotionAmount + normalPromotionPrice + cardPromotionPrice).toNumberWithComma() + " 원");

        $("#spanMaxAccPoint").text(sumAccPercent);
        $("#aDropdownTop").html(dropdownTopTemplateTemp);

        //결제 버튼 영역
        $("#sTotalPaymentBtn").text($("#sTotalPayment").text());
        $("#pResCntBtn").text("( 성인" + adCnt + " / " + "소아 " + cdCnt + " / " + "유아 " + e1Cnt + " )");
        $("#payBtn").text($("#sTotalPayment").text());
        $("#fullPayYn").text("결제금액");

        $("#strBasicPromotionAccPoint").text(basicPromotionAmount.toNumberWithComma() + " 원");
        $("#strNPayMaxPoint").text((totalActPrice - (basicPromotionAmount + normalPromotionPrice + cardPromotionPrice)).toNumberWithComma() + " 원");
        $("#strDropdownTopNPayMaxPoint").text((basicPromotionAmount + normalPromotionPrice + cardPromotionPrice).toNumberWithComma() + " 원");

        $("#strBasicPromotion").text(basicPromotionAmount.toNumberWithComma() + " 원");
        $("#spnBasicPromotion").text("※ 출발일(" + $("#hidDepartureDay").data("month") + "/" + $("#hidDepartureDay").data("day") + ") 이후 1영업일에 적립");

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

function nondummyPopupFlag() {
    if (navigator.platform) {
        if ('win16|win32|win64'.indexOf(navigator.platform.toLowerCase()) < 0) {
            return true;
        } else {
            return false;
        }
    }
    return true;
}

function popupCheck() {
    try {
        if (!nondummyPopupFlag()) {
            var dummypopup = window.open("", "NPay");
            if (!dummypopup) {
                if (navigator.userAgent.indexOf("Edge") > -1) {
                    alert("팝업차단 또는 신뢰사이트 설정을 확인 해주세요." + "\n" +
                        "팝업차단 해지 - 도구>인터넷 옵션>개인 정보(탭)>팝업 차단 사용 해지 또는 " + "\n" +
                        "신뢰사이트 설정 - 도구>인터넷 옵션>보안(탭)>신뢰할 수 있는 사이트>사이트(버튼) 에서 " +
                        "아래와 같은 주소 2개를 삭제 하거나 둘다 추가 하셔야 결제가 가능 합니다." + "\n" +
                        "" + "\n" +
                        "설정 이후 [페이지 새로고침] 이 필요 합니다.");
                } else if (navigator.userAgent.indexOf("Firefox") > -1
                    || navigator.userAgent.indexOf("Chrome") > -1
                    || navigator.userAgent.indexOf("Safari") > -1) {
                    alert("팝업차단 설정을 확인 해주세요.\n설정 이후 [페이지 새로고침] 이 필요 합니다.");
                } else {
                    alert("팝업차단 또는 신뢰사이트 설정을 확인 해주세요." + "\n" +
                        "팝업차단 해지 - 도구>인터넷 옵션>개인 정보(탭)>팝업 차단 사용 해지 또는 " + "\n" +
                        "신뢰사이트 설정 - 도구>인터넷 옵션>보안(탭)>신뢰할 수 있는 사이트>사이트(버튼) 에서 " +
                        "아래와 같은 주소 2개를 삭제 하거나 둘다 추가 하셔야 결제가 가능 합니다." + "\n" +
                        "설정 이후 [페이지 새로고침] 이 필요 합니다.");
                }
                dummypopup.close();
                return;
            }
        }
    } catch (err) {
        return;
    }

    var UserAgent = navigator.userAgent;
    if (UserAgent.match(/iPhone|iPod|iPad|Android|Windows CE|BlackBerry|Symbian|Windows Phone|webOS|Opera Mini|Opera Mobi|POLARIS|IEMobile|lgtelecom|nokia|SonyEricsson/i) != null || UserAgent.match(/LG|SAMSUNG|Samsung/) != null) {
    } else {
        NPay = window.open("", "NPay");
        if (!NPay) {
            alert("팝업차단 설정을 확인 해주세요.\n설정 이후 [페이지 새로고침] 이 필요 합니다.");
            return;
        } else {
            NPay.close();
        }
    }
}

// 예약 데이터 생성
function funcCreateReservationData() {
    // 요금 정보
    var priceInfo = $("#hidPriceInfo").val();

    // 예약자 정보
    var resUserInfoObj = {};
    resUserInfoObj["CustomerNm"] = $("#txtResName") != undefined ? $("#txtResName").val().trim().escapeXSS() : "";
    resUserInfoObj["CustomerLastNm"] = $("#txtResLastName").val() != undefined ? $("#txtResLastName").val().trim().escapeXSS() : "";
    resUserInfoObj["CustomerFirstNm"] = $("#txtResFirstName").val() != undefined ? $("#txtResFirstName").val().trim().escapeXSS() : "";
    resUserInfoObj["Gender"] = $("#selResGender").val() != undefined ? $("#selResGender").val().trim().escapeXSS() : "";
    resUserInfoObj["Phone"] = $("#txtResPhone").val() != undefined ? $("#txtResPhone").val().trim().escapeXSS() : "";
    resUserInfoObj["Email"] = $("#txtResEmail").val() != undefined ? $("#txtResEmail").val().trim().escapeXSS() : "";
    resUserInfoObj["BirthDay"] = $("#txtResBirthday").val() != undefined ? $("#txtResBirthday").val().trim().escapeXSS() : "";
    var resUserInfo = JSON.stringify(resUserInfoObj);
    // 일행 정보
    var coUserArr = [];
    $(".clsCoContainer").each(function (coLoop, co) {
        $this = $(co);
        var coUserObj = {};
        coUserObj["PriceCd"] = $this.data("priceCd").toString();
        coUserObj["TravelerGb"] = $this.data("priceGubun").escapeXSS();
        coUserObj["TravelerNm"] = $this.find("[name=coName]").val() != undefined ? $this.find("[name=coName]").val().trim().escapeXSS() : "";
        coUserObj["TravelerLastNm"] = $this.find("[name=coLastName]").val() != undefined ? $this.find("[name=coLastName]").val().trim().escapeXSS() : "";
        coUserObj["TravelerFirstNm"] = $this.find("[name=coFirstName]").val() != undefined ? $this.find("[name=coFirstName]").val().trim().escapeXSS() : "";
        coUserObj["Gender"] = $this.find("[name=coGender]").val() != undefined ? $this.find("[name=coGender]").val().trim().escapeXSS() : "";
        coUserObj["Phone"] = $this.find("[name=coPhone]").val() != undefined ? $this.find("[name=coPhone]").val().trim().escapeXSS() : "";
        coUserObj["Email"] = $this.find("[name=coEmail]").val() != undefined ? $this.find("[name=coEmail]").val().trim().escapeXSS() : "";
        coUserObj["BirthDay"] = $this.find("[name=coBirthday]").val() != undefined ? $this.find("[name=coBirthday]").val().trim().escapeXSS() : "";

        coUserArr.push(coUserObj);
    });
    var coUserInfo = JSON.stringify(coUserArr);
    // 금액 정보
    var totalPriceInfoObj = {};
    totalPriceInfoObj["NetPrice"] = $("#hidNetPrice").val();
    totalPriceInfoObj["DiscountPrice"] = $("#hidDiscountPrice").val();
    totalPriceInfoObj["ActPrice"] = $("#hidActPrice").val();
    totalPriceInfoObj["PromotionAmount"] = $("#hidPromotionAmount").val();
    var totalPriceInfo = JSON.stringify(totalPriceInfoObj);
    // 요청사항
    var ask = $("#taAsk").val().escapeXSS();
    // 임시예약번호
    var tempReservationId = $("#hidTempReservationId").val();
    // 결제 타입
    var paymentType = $("#hidPaymentType").val();
    // 등급
    var grade = $("#hidGrade").val();
    // 상품명
    var productNm = $("#hidProductNm").val();
    var couponInfoObj = {};
    couponInfoObj["DiscountCouponCouponCd"] = $("#hidDiscountCouponCd").val();
    couponInfoObj["DiscountCouponDetailSeq"] = $("#hidDiscountCouponDetailSeq").val();
    couponInfoObj["DiscountCouponDiscountPrice"] = $("#hidDiscountCouponPrice").val();
    couponInfoObj["PerkCouponCouponCd"] = $("#hidPerkCouponCd").val();
    couponInfoObj["PerkCouponDetailSeq"] = $("#hidPerkDetailSeq").val();
    couponInfoObj["PerkCouponUseCount"] = $("#hidPerkUseCnt").val();
    var couponInfo = JSON.stringify(couponInfoObj);
    var reservationData = {
        priceInfo: priceInfo,
        resUserInfo: resUserInfo,
        coUserInfo: coUserInfo,
        totalPriceInfo: totalPriceInfo,
        couponInfo: couponInfo,
        ask: ask,
        tempReservationId: tempReservationId,
        paymentType: paymentType,
        grade: grade,
        productNm: productNm
    };

    reservationData["resName"] = resUserInfoObj.CustomerNm;
    reservationData["resPhone"] = resUserInfoObj.Phone;
    reservationData["resEmail"] = resUserInfoObj.Email;
    reservationData["resBirtday"] = resUserInfoObj.BirthDay;
    reservationData["resGender"] = resUserInfoObj.Gender;
    reservationData["resLastName"] = resUserInfoObj.CustomerLastNm;
    reservationData["resFirstName"] = resUserInfoObj.CustomerFirstNm;

    return reservationData;
}

// 예약 전처리
function funcResPreProcess() {
    funcShowReservationLoading();

    var reservationData = funcCreateReservationData();

    $.ajax({
        url: PATH_STATIC_AJAX + "AjaxReservationPreProcess.aspx",
        data: reservationData,
        type: "POST",
        success: function (res) {
            if (res.Result != 0) {
                if (res.Result === 75) {
                    funcHideReservationLoading();
                    location.href = funcDecodeUriHiddenInfo(res.RedirectUrl);
                } else {
                    funcHideReservationLoading();
                    funcGenerateCommonPopup("예약 오류", res.Message, "ReservationError");
                    return;
                }
            }

            // 세션스토리지에 url 저장
            var paramObj = funcGetParameter();
            paramObj.r = "1";
            sessionStorage.setItem("TRIPPLAT_NPAY_ERROR_RETURN_URL", location.pathname + funcSerializeQueryString(paramObj));
            
            var paymentType = $("#hidPaymentType").val();
            var returnUrl = SERVICE_URL + $("#hidOrganUrl").val() + "ReservationComplete.aspx?tempReservationId=" + res.TempReservationId + "&type=" + paymentType;
            if (paymentType == "NPAYPT01") { // 일반 결제
                var tr = $("#hidShoppingLiveTr").val();
                var trx = $("#hidShoppingLiveTrx").val();
                var merchantExtraParameter = tr + "|" + trx + "|" + res.ReservationId + "|" + res.TotalPayment;
                var npayDataObj = {
                    "merchantPayKey": "" + res.ReservationId + "",
                    "merchantUserKey": "" + res.BookerId + "",
                    "productName": "" + res.ProductName + "",
                    "productCount": res.TotalTraveler,
                    "totalPayAmount": res.TotalPayment,
                    "taxScopeAmount": res.TotalPayment,
                    "taxExScopeAmount": 0,
                    "returnUrl": returnUrl,
                    "useCfmYmdt": "" + res.ConfrimDate + "",
                    "productItems": [{
                        "categoryType": "TRAVEL",
                        "categoryId": "DOMESTIC",
                        "uid": "" + res.ProductCode.replaceAll("|", "") + "",
                        "name": "" + res.ProductName + "",
                        "startDate": "" + res.StartDate + "",
                        "endDate": "" + res.EndDate + "",
                        "count": res.TotalTraveler
                    }],
                    "merchantExtraParameter": merchantExtraParameter
                }
                if ($.trim(tr) === "") {
                    delete npayDataObj.merchantExtraParameter;
                }
                oPay.open(npayDataObj);
            } else { // 반복 결제
                oPay.open({
                    "actionType": "NEW",
                    "productCode": "" + res.ProductCode + "",
                    "productName": "" + res.ProductName + "",
                    "totalPayAmount": res.TotalPayment,
                    "returnUrl": "" + returnUrl + ""
                });
            }
        },
        error: function () {
            funcGenerateCommonPopup("예약 오류", "예약을 진행하는 중 오류가 발생하였습니다.<br />관리자에게 문의해주시기 바랍니다.", "ReservationError");
            funcHideReservationLoading();
        }
    });
}

// 전, 후 달력 및 요금 데이터 추가
function funcSetCalendarData(direction) {
    funcShowAjaxLoadingLayer();

    var masterCd = $("#hidMasterCd").val();
    var organSeq = $("#hidOrganSeq").val();

    var standardDateTime = "";

    if (direction == "pre") {
        standardDateTime = $("#hidPreLongDay").val();
    } else if (direction == "next") {
        standardDateTime = $("#hidNextLongDay").val();
    }
    $("#divHidCalendarDataContainer").empty();

    var selectedDetailCd = $("#hidSlctdDetailCd").val();

    $.ajax({
        url: PATH_STATIC_AJAX + "AjaxCalendarPrice.aspx",
        data: { masterCd: masterCd, organSeq: organSeq, standardDateTime: standardDateTime, selectedDetailCd: selectedDetailCd },
        type: "POST",
        success: function (res) {
            $("#divHidCalendarDataContainer").append(res.PreCalendarDetail);
            $("#divHidCalendarDataContainer").append(res.NextCalendarDetail);

            var selectedDetailCd = res.SelectedDetailCd;
            $("#hidSlctdDetailCd").val(selectedDetailCd);
            var $selectedBtn = $("#hidDetailCd" + selectedDetailCd).parent("button");
            $selectedBtn.removeClass().addClass("clsDetail").addClass("pick");
        },
        complete: funcHideAjaxLoadingLayer
    });
}

// 선택된 요금 안내, 일행정보
function funcSelectedPriceInfo() {
    $("#ulSelectedPrice").empty();
    $("#ulSelectedPrice2").empty();
    $("#ulSelectedPrice2").hide();
    $("#ulSelectedPrice3").empty();
    $("#divCoInfoMarkContainer").empty();
    $("#divCoInfoContainer").empty();
    $("#divNpayPoint").hide();

    var containerLoop = 1;

    var priceInfoArr = JSON.parse(funcDecodeUriHiddenInfo($("#hidPriceInfo").val()));
    priceInfoArr.forEach(function (priceInfoObj, priceInfoLoop) {
        if (priceInfoObj.ADCnt > 0 || priceInfoObj.CDCnt > 0 || priceInfoObj.E1Cnt > 0) {
            // selectedPriceInfoTemplate
            // 선택된 요금 안내
            var selectedPriceInfo = selectedPriceInfoTemplate;
            selectedPriceInfo = selectedPriceInfo.replace(/#ADCnt#/g, priceInfoObj.ADCnt);
            selectedPriceInfo = selectedPriceInfo.replace(/#CDCnt#/g, priceInfoObj.CDCnt);
            selectedPriceInfo = selectedPriceInfo.replace(/#E1Cnt#/g, priceInfoObj.E1Cnt);
            selectedPriceInfo = selectedPriceInfo.replace(/#PRICE#/g, (priceInfoObj.ADCnt * priceInfoObj.ADPrice + priceInfoObj.CDCnt * priceInfoObj.CDPrice + priceInfoObj.E1Cnt * priceInfoObj.E1Price).toNumberWithComma());
            selectedPriceInfo = selectedPriceInfo.replace(/#PRICECD#/g, priceInfoObj.PriceCd);

            var optionNm = "";
            if (priceInfoObj.OpCcd1Nm != null) {
                optionNm += priceInfoObj.OpCcd1Nm;
            }
            if (priceInfoObj.OpCcd2Nm != null) {
                optionNm += " / " + priceInfoObj.OpCcd2Nm;
            }
            if (priceInfoObj.OpCcd3Nm != null) {
                optionNm += " / " + priceInfoObj.OpCcd3Nm;
            }
            if (priceInfoObj.OpCcd4Nm != null) {
                optionNm += " / " + priceInfoObj.OpCcd4Nm;
            }
            if (priceInfoObj.OpCcd5Nm != null) {
                optionNm += " / " + priceInfoObj.OpCcd5Nm;
            }
            if (priceInfoObj.PriceNm != null) {
                if (priceInfoObj.OpCcd1Nm != null
                    || priceInfoObj.OpCcd2Nm != null
                    || priceInfoObj.OpCcd3Nm != null
                    || priceInfoObj.OpCcd4Nm != null
                    || priceInfoObj.OpCcd5Nm != null) {
                    optionNm += " / ";
                }
                optionNm += priceInfoObj.PriceNm;
            }

            selectedPriceInfo = selectedPriceInfo.replace(/#OPTIONCCDNM#/g, optionNm);

            $("#ulSelectedPrice").append(selectedPriceInfo);

            //selectedPriceInfoTemplate2
            var selectedPriceInfo2 = selectedPriceInfoTemplate2;
            selectedPriceInfo2 = selectedPriceInfo2.replace(/#TOTAL_CNT#/g, priceInfoObj.ADCnt + priceInfoObj.CDCnt + priceInfoObj.E1Cnt);
            var cntDesc = "#ADULT##GUBUN_1##CHILD##GUBUN_2##INFANT#";
            if (priceInfoObj.ADCnt > 0) {
                cntDesc = cntDesc.replace(/#ADULT#/g, "성인" + priceInfoObj.ADCnt);
                cntDesc = cntDesc.replace(/#GUBUN_1#/g, priceInfoObj.CDCnt > 0 || priceInfoObj.E1Cnt > 0 ? " / " : "");
            } else {
                cntDesc = cntDesc.replace(/#ADULT#/g, "");
                cntDesc = cntDesc.replace(/#GUBUN_1#/g, "");
            }
            if (priceInfoObj.CDCnt > 0) {
                cntDesc = cntDesc.replace(/#CHILD#/g, "소아" + priceInfoObj.CDCnt);
                cntDesc = cntDesc.replace(/#GUBUN_2#/g, priceInfoObj.E1Cnt > 0 ? " / " : "");
            } else {
                cntDesc = cntDesc.replace(/#CHILD#/g, "");
                cntDesc = cntDesc.replace(/#GUBUN_2#/g, "");
            }
            if (priceInfoObj.E1Cnt > 0) {
                cntDesc = cntDesc.replace(/#INFANT#/g, "유아" + priceInfoObj.E1Cnt);
            } else {
                cntDesc = cntDesc.replace(/#INFANT#/g, "");
            }

            selectedPriceInfo2 = selectedPriceInfo2.replace(/#CNT_DESC#/g, cntDesc);
            selectedPriceInfo2 = selectedPriceInfo2.replace(/#PRICE#/g, (priceInfoObj.ADCnt * priceInfoObj.ADPrice + priceInfoObj.CDCnt * priceInfoObj.CDPrice + priceInfoObj.E1Cnt * priceInfoObj.E1Price).toNumberWithComma());
            selectedPriceInfo2 = selectedPriceInfo2.replace(/#PRICECD#/g, priceInfoObj.PriceCd);

            var optionNm2 = "";
            if (priceInfoObj.OpCcd1Nm != null) {
                optionNm2 += priceInfoObj.OpCcd1Nm;
            }
            if (priceInfoObj.OpCcd2Nm != null) {
                optionNm2 += " / " + priceInfoObj.OpCcd2Nm;
            }
            if (priceInfoObj.OpCcd3Nm != null) {
                optionNm2 += " / " + priceInfoObj.OpCcd3Nm;
            }
            if (priceInfoObj.OpCcd4Nm != null) {
                optionNm2 += " / " + priceInfoObj.OpCcd4Nm;
            }
            if (priceInfoObj.OpCcd5Nm != null) {
                optionNm2 += " / " + priceInfoObj.OpCcd5Nm;
            }
            if (priceInfoObj.PriceNm != null) {
                if (priceInfoObj.OpCcd1Nm != null
                    || priceInfoObj.OpCcd2Nm != null
                    || priceInfoObj.OpCcd3Nm != null
                    || priceInfoObj.OpCcd4Nm != null
                    || priceInfoObj.OpCcd5Nm != null) {
                    optionNm2 += " / ";
                }
                optionNm2 += priceInfoObj.PriceNm;
            }

            selectedPriceInfo2 = selectedPriceInfo2.replace(/#OPTIONCCDNM#/g, optionNm2);

            $("#ulSelectedPrice2").append(selectedPriceInfo2);
            $("#ulSelectedPrice2").show();


            // 일행 정보
            var coInputTemplate = funcDecodeUriHiddenInfo($("#hidCoInputTemplate").val());

            var selectedPriceInput = "";
            if (containerLoop > 1) {
                selectedPriceInput = "<hr class='hr_2'>";
            }
            selectedPriceInput += selectedPriceInputTemplate;

            if (priceInfoObj.ADCnt > 0 || priceInfoObj.CDCnt > 0 || priceInfoObj.E1Cnt > 0) {
                $("#divCoInfoMarkContainer").empty().append(coInputMarkTemplate);
            }

            if (priceInfoObj.ADCnt > 0) {
                selectedPriceInput = selectedPriceInput.replace(/#AD_INFO#/g, adInfoTemplate);

                var adCoInputTotal = "";
                for (var adLoop = 1; adLoop <= priceInfoObj.ADCnt; adLoop++) {
                    var adCoInput = coInputTemplate;
                    adCoInput = adCoInput.replace(/#COLOOP#/g, adLoop);
                    adCoInput = adCoInput.replace(/#PRICECD#/g, priceInfoObj.PriceCd);
                    adCoInput = adCoInput.replace(/#PRICECD_REPLACE#/g, priceInfoObj.PriceCd.replaceAll("|", "_"));
                    adCoInput = adCoInput.replace(/#TYPE#/g, "AD");
                    adCoInputTotal += adCoInput;
                }
                selectedPriceInput = selectedPriceInput.replace(/#COINPUTAD#/g, adCoInputTotal);
            } else {
                selectedPriceInput = selectedPriceInput.replace(/#AD_INFO#/g, "");
            }

            if (priceInfoObj.CDCnt > 0) {
                selectedPriceInput = selectedPriceInput.replace(/#CD_INFO#/g, cdInfoTemplate);

                var cdCoInputTotal = "";
                for (var cdLoop = 1; cdLoop <= priceInfoObj.CDCnt; cdLoop++) {
                    var cdCoInput = coInputTemplate;
                    cdCoInput = cdCoInput.replace(/#COLOOP#/g, cdLoop);
                    cdCoInput = cdCoInput.replace(/#PRICECD#/g, priceInfoObj.PriceCd);
                    cdCoInput = cdCoInput.replace(/#PRICECD_REPLACE#/g, priceInfoObj.PriceCd.replaceAll("|", "_"));
                    cdCoInput = cdCoInput.replace(/#TYPE#/g, "CD");
                    cdCoInputTotal += cdCoInput;
                }
                selectedPriceInput = selectedPriceInput.replace(/#COINPUTCD#/g, cdCoInputTotal);
            } else {
                selectedPriceInput = selectedPriceInput.replace(/#CD_INFO#/g, "");
            }
            
            if (priceInfoObj.E1Cnt > 0) {
                selectedPriceInput = selectedPriceInput.replace(/#E1_INFO#/g, e1InfoTemplate);

                var e1CoInputTotal = "";
                for (var e1Loop = 1; e1Loop <= priceInfoObj.E1Cnt; e1Loop++) {
                    var cdCoInput = coInputTemplate;
                    cdCoInput = cdCoInput.replace(/#COLOOP#/g, e1Loop);
                    cdCoInput = cdCoInput.replace(/#PRICECD#/g, priceInfoObj.PriceCd);
                    cdCoInput = cdCoInput.replace(/#PRICECD_REPLACE#/g, priceInfoObj.PriceCd.replaceAll("|", "_"));
                    cdCoInput = cdCoInput.replace(/#TYPE#/g, "E1");
                    e1CoInputTotal += cdCoInput;
                }
                selectedPriceInput = selectedPriceInput.replace(/#COINPUTE1#/g, e1CoInputTotal);
            } else {
                selectedPriceInput = selectedPriceInput.replace(/#E1_INFO#/g, "");
            }

            selectedPriceInput = selectedPriceInput.replace(/#PRODUCTLOOP#/g, priceInfoLoop);
            selectedPriceInput = selectedPriceInput.replace(/#PRICECD#/g, priceInfoObj.PriceCd);
            selectedPriceInput = selectedPriceInput.replace(/#LOOP#/g, containerLoop++);
            selectedPriceInput = selectedPriceInput.replace(/#OPTIONCCDNM#/g, optionNm);
            selectedPriceInput = selectedPriceInput.replace(/#ADCNT#/g, priceInfoObj.ADCnt);
            selectedPriceInput = selectedPriceInput.replace(/#CDCNT#/g, priceInfoObj.CDCnt);
            selectedPriceInput = selectedPriceInput.replace(/#E1CNT#/g, priceInfoObj.E1Cnt);

            $("#divCoInfoContainer").append(selectedPriceInput);
        }
    });

    if ($("#divCoInfoContainer").children().length == 0) {
        $("#hrCoInfo").hide();
    } else {
        $("#hrCoInfo").show();
    }
}

// 예약 정보 validation
function funcReservationValidation() {
    // 상품 개수
    if ($("#hidNetPrice").val() <= 0 || $("#hidDiscountPrice").val() < 0 || $("#hidActPrice").val() <= 0) {
        funcGenerateCommonPopup("예약", "예약할 상품을 선택해주시기 바랍니다.", "NotSelectPrice");
        return false;
    }

    var isVal = true;

    // 소아만 추가한 경우
    var priceInfoArr = JSON.parse(funcDecodeUriHiddenInfo($("#hidPriceInfo").val()));
    $(priceInfoArr).each(function (priceInfoLoop, priceInfoItem) {
        if (priceInfoItem.ADCnt <= 0 && (priceInfoItem.CDCnt > 0 || priceInfoItem.E1Cnt)) {
            funcGenerateCommonPopup("예약", "소아 또는 유아 인원만 예약은 불가합니다.<br />다시 확인해주십시오.", "PriceInfoError");
            isVal = false;
            return false;
        }
    });
    if (isVal == false) {
        return false;
    }

    // input
    $(".clsInputVal").each(function (_, input) {
        $this = $(input);
        // 이름
        if ($this.data("type") == "name" && $this.data("required") == "True" && $.trim($this.val()) == "") {
            if ($this.data("gubun") == "res") {
                funcGenerateFocusCommonPopup("예약", "예약자 이름을 입력해주시기 바랍니다.", $this.attr("id"));
            } else {
                funcGenerateFocusCommonPopup("예약", "일행 이름을 입력해주시기 바랍니다.", $this.attr("id"));
            }
            isVal = false;
            return false;
        }
        // 핸드폰
        if ($this.data("type") == "phone") {
            var regexp = /^01(0|1|6|7|8|9)[-](\d{4}|\d{3})[-]\d{4}$/g;
            if ($this.data("required") == "True" && $.trim($this.val()) == "") {
                if ($this.data("gubun") == "res") {
                    funcGenerateFocusCommonPopup("예약", "예약자 핸드폰 번호를 입력해주시기 바랍니다.", $this.attr("id"));
                } else {
                    funcGenerateFocusCommonPopup("예약", "일행 핸드폰 번호를 입력해주시기 바랍니다.", $this.attr("id"));
                }
                isVal = false;
                return false;
            }
            if ($this.data("required") == "True" && $.trim($this.val()).length != 13) {
                if ($this.data("gubun") == "res") {
                    funcGenerateFocusCommonPopup("예약", "예약자 핸드폰 번호를 확인해 주십시요.", $this.attr("id"));
                } else {
                    funcGenerateFocusCommonPopup("예약", "일행 핸드폰 번호를 확인해 주십시요.", $this.attr("id"));
                }
                isVal = false;
                return false;
            }
            if ($.trim($this.val()) != "" && regexp.test($this.val()) == false) {
                if ($this.data("gubun") == "res") {
                    funcGenerateFocusCommonPopup("예약", "예약자 핸드폰 번호가 올바르지 않습니다.", $this.attr("id"));
                } else {
                    funcGenerateFocusCommonPopup("예약", "일행 핸드폰 번호가 올바르지 않습니다.", $this.attr("id"));
                }
                isVal = false;
                return false;
            }
        }
        // 영문성
        if ($this.data("type") == "lastName" && $this.data("required") == "True" && $.trim($this.val()) == "") {
            if ($this.data("gubun") == "res") {
                funcGenerateFocusCommonPopup("예약", "예약자 영문성을 입력해주시기 바랍니다.", $this.attr("id"));
            } else {
                funcGenerateFocusCommonPopup("예약", "일행 영문성을 입력해주시기 바랍니다.", $this.attr("id"));
            }
            isVal = false;
            return false;
        }
        // 영문이름
        if ($this.data("type") == "firstName" && $this.data("required") == "True" && $.trim($this.val()) == "") {
            if ($this.data("gubun") == "res") {
                funcGenerateFocusCommonPopup("예약", "예약자 영문이름을 입력해주시기 바랍니다.", $this.attr("id"));
            } else {
                funcGenerateFocusCommonPopup("예약", "일행 영문이름을 입력해주시기 바랍니다.", $this.attr("id"));
            }
            isVal = false;
            return false;
        }
        // 성별
        if ($this.data("type") == "gender" && $this.data("required") == "True" && $.trim($this.val()) == "none") {
            if ($this.data("gubun") == "res") {
                funcGenerateFocusCommonPopup("예약", "예약자 성별을 선택해주시기 바랍니다.", $this.attr("id"));
            } else {
                funcGenerateFocusCommonPopup("예약", "일행 성별을 선택해주시기 바랍니다.", $this.attr("id"));
            }
            isVal = false;
            return false;
        }
        // 이메일
        if ($this.data("type") == "email") {
            var regexp = /[a-z0-9.]{2,}@[a-z0-9-]{2,}.[a-z0-9]{2,}/i;
            if ($this.data("required") == "True" && $.trim($this.val()) == "") {
                if ($this.data("gubun") == "res") {
                    funcGenerateFocusCommonPopup("예약", "예약자 이메일을 입력해주시기 바랍니다.", $this.attr("id"));
                } else {
                    funcGenerateFocusCommonPopup("예약", "일행 이메일을 입력해주시기 바랍니다.", $this.attr("id"));
                }
                isVal = false;
                return false;
            }
            if ($.trim($this.val()) != "" && regexp.test($this.val()) == false) {
                if ($this.data("gubun") == "res") {
                    funcGenerateFocusCommonPopup("예약", "예약자 이메일이 올바르지 않습니다.", $this.attr("id"));
                } else {
                    funcGenerateFocusCommonPopup("예약", "일행 이메일이 올바르지 않습니다.", $this.attr("id"));
                }
                isVal = false;
                return false;
            }
        }
        // 생년월일
        if ($this.data("type") == "birthday") {
            var regexp = /([12]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01]))/g;
            if ($this.data("required") == "True" && $.trim($this.val()) == "") {
                if ($this.data("gubun") == "res") {
                    funcGenerateFocusCommonPopup("예약", "예약자 생년월일을 입력해주시기 바랍니다.", $this.attr("id"));
                } else {
                    funcGenerateFocusCommonPopup("예약", "일행 생년월일을 입력해주시기 바랍니다.", $this.attr("id"));
                }
                isVal = false;
                return false;
            }
            if ($.trim($this.val()) != "" && regexp.test($this.val()) == false) {
                if ($this.data("gubun") == "res") {
                    funcGenerateFocusCommonPopup("예약", "예약자 생년월일이 올바르지 않습니다.", $this.attr("id"));
                } else {
                    funcGenerateFocusCommonPopup("예약", "일행 생년월일이 올바르지 않습니다.", $this.attr("id"));
                }
                isVal = false;
                return false;
            }
        }
    });

    if (isVal == false) {
        return false;
    }

    // 약관 동의
    if ($("#hidDeviceGubun").val() == "PC") {
        if ($(".clsChkTerms_PC:checked").length != $(".clsChkTerms_PC").length) {
            var $uncheckedEl = $(".clsChkTerms_PC").not(":checked").eq(0);

            $(".clsBtnTerms_PC[data-idx=" + $uncheckedEl.data("idx") + "]").click();
            funcGenerateFocusCommonPopup("예약", $(".hidTermsTitle").eq($uncheckedEl.data("idx") - 1).val(), $uncheckedEl.attr("id"));

            return false;
        }
    } else {
        if ($(".clsChkTerms_MO:checked").length != $(".clsChkTerms_MO").length) {
            funcGenerateFocusCommonPopup("예약", $(".hidTermsTitle").eq($(".clsChkTerms_MO").not(":checked").eq(0).data("idx") - 1).val(), "chkAllTerms_MO");
            return false;
        }
    }

    return true;
}

// ajax 로딩 레이어
function funcShowAjaxLoadingLayer() {
    $("#divAjaxLoadingLayer").show();
}
function funcHideAjaxLoadingLayer() {
    $("#divAjaxLoadingLayer").hide();
}

// Template
// 상세요금
var priceInfoTemplate = "";
priceInfoTemplate += "<li class='clsPriceContainer' data-price-cd='#PRICECD#' data-detail-cd='#DETAILCD#' data-master-cd='#MASTERCD#' data-organ-seq='#ORGANSEQ#' data-loop='#LOOP#'>";
priceInfoTemplate += "    <div class='p_td type'>";
priceInfoTemplate += "        #OPTION_GUBUN#";
priceInfoTemplate += "    </div>";
priceInfoTemplate += "    <div class='p_td domestic mobile'>";
priceInfoTemplate += "        <div class='tit_age'><span class='type_age'>성인</span><span class='age'>#ADULT_RANGE_INFO#</span><span class='price'>#ADPRICE# 원</span></div>";
priceInfoTemplate += "        <div class='count'>";
priceInfoTemplate += "            <button type='button' class='clsCalcBtn #OV_ADULT#' data-calc='minus' data-type='AD'></button>";
priceInfoTemplate += "            <span id='spnADCnt_#LOOP#'>#ADCNT#명</span>";
priceInfoTemplate += "            <button type='button' class='clsCalcBtn' data-calc='plus' data-type='AD'></button>";
priceInfoTemplate += "        </div>";
priceInfoTemplate += "    </div>";
priceInfoTemplate += "    #CHILD_PRICE_DIV#";
priceInfoTemplate += "    <div class='p_td p_td2 domestic mobile'>";
priceInfoTemplate += "        <div class='tit_age'><span class='type_age'>유아</span><span class='age'>#INFANT_RANGE_INFO#</span><span class='price'></span></div>";
priceInfoTemplate += "            <div class='count count2'>";
priceInfoTemplate += "                <button type='button' class='minus_none'></button>";
priceInfoTemplate += "                <span>불가</span>";
priceInfoTemplate += "                <button type='button' class='plus_none'></button>";
priceInfoTemplate += "            </div>";
priceInfoTemplate += "    </div>";
priceInfoTemplate += "</li>";

var childPriceInfoTemplate = "";
childPriceInfoTemplate += "    <div class='p_td domestic mobile'>";
childPriceInfoTemplate += "        <div class='tit_age'><span class='type_age'>소아</span><span class='age'>#CHILD_RANGE_INFO#</span><span class='price'>#CDPRICE# 원</span></div>";
childPriceInfoTemplate += "        <div class='count'>";
childPriceInfoTemplate += "            <button type='button' class='clsCalcBtn #OV_CHILD#' data-calc='minus' data-type='CD'></button>";
childPriceInfoTemplate += "            <span id='spnCDCnt_#LOOP#'>#CDCNT#명</span>";
childPriceInfoTemplate += "            <button type='button' class='clsCalcBtn' data-calc='plus' data-type='CD'></button>";
childPriceInfoTemplate += "        </div>";
childPriceInfoTemplate += "    </div>";

var childZeroPriceInfoTemplate = "";
childZeroPriceInfoTemplate += "<div class='p_td p_td2 domestic mobile'>";
childZeroPriceInfoTemplate += "    <div class='tit_age'><span class='type_age'>소아</span><span class='age'>#CHILD_RANGE_INFO#</span><span class='price'></span></div>";
childZeroPriceInfoTemplate += "        <div class='count count2'>";
childZeroPriceInfoTemplate += "            <button type='button' class='minus_none'></button>";
childZeroPriceInfoTemplate += "            <span>불가</span>";
childZeroPriceInfoTemplate += "            <button type='button' class='plus_none'></button>";
childZeroPriceInfoTemplate += "        </div>";
childZeroPriceInfoTemplate += "</div>";

// 선택된 요금 안내
var selectedPriceInfoTemplate = "";
selectedPriceInfoTemplate += "<li data-price-cd='#PRICECD#'>";
selectedPriceInfoTemplate += "    <span>";
selectedPriceInfoTemplate += "        #OPTIONCCDNM#";
selectedPriceInfoTemplate += "    </span>";
selectedPriceInfoTemplate += "    <span class='num'>( 성인 : #ADCnt# / 소아 : #CDCnt# / 유아 : #E1Cnt# )</span>";
selectedPriceInfoTemplate += "    <span class='price'>#PRICE# 원</span>";
selectedPriceInfoTemplate += "    <span class='close clsRmSltdPrice'><img src='" + PATH_STATIC_IMG + "icon_x.svg'></span>";
selectedPriceInfoTemplate += "</li>";

// 선택된 요금 안내2
var selectedPriceInfoTemplate2 = "";
selectedPriceInfoTemplate2 += "<li>";
selectedPriceInfoTemplate2 += "    <span>";
selectedPriceInfoTemplate2 += "        #OPTIONCCDNM#";
selectedPriceInfoTemplate2 += "    </span>";
selectedPriceInfoTemplate2 += "    <span class='num'>#TOTAL_CNT#명 (#CNT_DESC#)</span>";
selectedPriceInfoTemplate2 += "    <span class='price'>#PRICE# 원</span>";
selectedPriceInfoTemplate2 += "</li>";

// 일행 정보 입력폼
var selectedPriceInputTemplate = "";
selectedPriceInputTemplate += "<div class='clsCoInputContainer' data-price-cd='#PRICECD#'>";
selectedPriceInputTemplate += "    <h3>";
selectedPriceInputTemplate += "        <span>상품 #LOOP#</span>";
selectedPriceInputTemplate += "        <span>#OPTIONCCDNM#</span>";
selectedPriceInputTemplate += "    </h3>";
selectedPriceInputTemplate += "    <br>";
selectedPriceInputTemplate += "    #AD_INFO#";
selectedPriceInputTemplate += "    #CD_INFO#";
selectedPriceInputTemplate += "    #E1_INFO#";
selectedPriceInputTemplate += "</div>";

var adInfoTemplate = "";
adInfoTemplate += "    <h4>성인 ( <span>#ADCNT#</span>명 )</h4>";
adInfoTemplate += "    <div id='divCoInputContainer_#PRODUCTLOOP#_AD' class='list_wrap' data-price-cd='#PRICECD#'>";
adInfoTemplate += "        #COINPUTAD#";
adInfoTemplate += "    </div>";
adInfoTemplate += "    <br>";

var cdInfoTemplate = "";
cdInfoTemplate += "    <h4>소아 (<span>#CDCNT#</span>명)</h4>";
cdInfoTemplate += "    <div id='divCoInputContainer_#PRODUCTLOOP#_CD' class='list_wrap' data-price-cd='#PRICECD#'>";
cdInfoTemplate += "        #COINPUTCD#";
cdInfoTemplate += "    </div>";

var e1InfoTemplate = "";
e1InfoTemplate += "    <h4>유아 (<span>#E1CNT#</span>명)</h4>";
e1InfoTemplate += "    <div id='divCoInputContainer_#PRODUCTLOOP#_E1' class='list_wrap' data-price-cd='#PRICECD#'>";
e1InfoTemplate += "        #COINPUTE1#";
e1InfoTemplate += "    </div>";

// 일행 정보 안내
var coInputMarkTemplate = "";
coInputMarkTemplate += "<div class='t_h2'>";
coInputMarkTemplate += "    <h2>일행 정보</h2>";
coInputMarkTemplate += "    <div class=\"inp_chk\">";
coInputMarkTemplate += "        <input type=\"checkbox\" id=\"chkAddPaxInfo\"> &nbsp;<label for=\"chkAddPaxInfo\">예약자 정보와 동일</label>";
coInputMarkTemplate += "    </div>";
coInputMarkTemplate += "</div>";
coInputMarkTemplate += "<div class='red_star'>";
coInputMarkTemplate += "    ‘ <span>*</span> ’ 표시는 필수 입력사항입니다.";
coInputMarkTemplate += "</div>";
coInputMarkTemplate += "<br>";

// 드롭다운 Top
var dropdownTopTemplate = "";
dropdownTopTemplate += "<span id = \"spanMaxAccPoint\">최대 적립 포인트 (#MAX_ACCPERCENT#%)</span>";
dropdownTopTemplate += "<strong class=\"color-green\" id='strDropDownNPayMaxPoint'>#MAX_NPAY_POINT#";
dropdownTopTemplate += "    <svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" fill=\"currentColor\" class=\"bi bi-chevron-down\" viewBox=\"0 0 16 16\">";
dropdownTopTemplate += "    <path fill-rule=\"evenodd\" d=\"M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z\" /></svg>";
dropdownTopTemplate += "</strong>";

function logout() {
    $.ajax({
        url: PATH_STATIC_AJAX + "AjaxLogout.aspx",
        data: {},
        type: "POST",
        success: function (res) {
            location.replace("/login.aspx");
        }
    });
}