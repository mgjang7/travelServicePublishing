var oPay;
var PROMOTION_DATA;
var RESERVATION_DATA = new ReservationData();
var TICKETPASS_RESERVATION_DATA = new TicketPassReservationData();
var CHECK_OPTION = false;
var BENEFIT_SELECT_PERSON_COUNT = 0;

let initTicketPassPriceData;
let ticketPassNormalPromotionPrice = 0;
let ticketPassCardPromotionPrice = 0;

let normalNPayAccPercent = 0;
let normalNPayAccLimit = 0;
let normalNPayAccPointTargetElementId = "";

let cardNPayAccPercent = 0;
let cardNPayAccLimit = 0;
let cardNPayAccPointTargetElementId = "";

let adultPriceCds = []; // 성인
let e2PriceCds = []; // 시니어
let e3PriceCds = []; // 청소년
let childPriceCds = []; // 아동

let maxAccPoint = 0;
let sTotalPayment = 0;
let basicPromotionAccPoint = 0;

let alppyDuplicationBenefitCoupons = [];

let perksCouponCnt = 0;
let duplicationPerksCouponCnt = 0;

let isTicketTimeSelect = false;

// NPay 메시지 표시
function funcNPayMessage(message) {
    funcGenerateCommonPopup("네이버페이", message, "NPayProcessMessage");
}

$(document).ready(function () {
    //if ($("#isMobile").val() === "true") {
    //    $("#ulDropdownMenu").attr("style", "max-height:297px; overflow-y:scroll;");
    //    let payBtnHeight = ($("#btnNPay").height() + $("#btnNPay").innerHeight() + $("#btnNPay").outerHeight());
    //    $(".footer").css("height", (payBtnHeight + 134));
    //    $("#sTotalPaymentBtn").css("font-size", "17px");
    //    $("#payBtn").css("font-size", "17px");
    //    $("#payTxt").css("font-size", "17px");
    //}

    // 티켓/패스
    if ($("#isTicket").val() === "true") {
        $("#pkgStatusInfo").hide();
        $("#pkgStatusInfoMobile").hide();

        if ($("#hidIsTicketTimeSelect").val() == "True") {
            isTicketTimeSelect = true;
        } else {
            isTicketTimeSelect = false;
        }

        if ($("#initTicketPassPriceData").val() !== null && $("#initTicketPassPriceData").val() !== undefined && $("#initTicketPassPriceData").val() !== "") {
            initTicketPassPriceData = JSON.parse($("#initTicketPassPriceData").val());
        }

        $("#pkgBasicInfo").hide();
        $("#ticketPassBasicInfo").show();
        $("#pkgPriceInfo").hide();
        $("#ticketPassPriceInfo").show();
        $("#ticketPassQuestionsInputArea").show();

        TICKETPASS_RESERVATION_DATA = new TicketPassReservationData();

        if ($("#hidDeviceGubun").val() == "MO") {
            $(".clsBtnTerms_MO").first().click();
        }

        $(".ticketClsCalcBtn[data-calc=plus][data-type=AD]")[0].click();

        // 필터 초기화 버튼
        $("#btnFilteringInit").on("click", function () {
            $(".clsPriceFilter").each(function (selectLoop, selectItem) {
                $(selectItem).val("all").trigger("change");
            });
        });

        // 요금 필터링
        $(".clsPriceFilter").on("change", function () {

            let selectedFilter = $(this).val();

            let isSelect = false;

            let hasItemCnt = 0;

            if (selectedFilter === "all") {
                $("#ulPackagePriceList li").each(function (index, item) {
                    let targetItem = $(item).data("filter-name");

                    if (targetItem !== "noItem") {
                        hasItemCnt++;
                    }
                    
                    $(item).show();
                });

                if (hasItemCnt > 0) {
                    isSelect = true;
                }

            } else {
                $("#ulPackagePriceList li").each(function (index, item) {
                    $(item).hide();
                });

                $("#ulPackagePriceList li").each(function (index, item) {
                    let targetItem = $(item).data("filter-name");

                    if (targetItem === selectedFilter) {
                        isSelect = true;
                        $(item).show();
                    }
                });
            }

            if (isSelect === false) {
                $(".noprod").show();
            } else {
                $(".noprod").hide();
            }
        });

       
        let couponArray = JSON.parse($("#hidCouponData").val());
        if (couponArray.length == 0) {
            $("#sectionCoupon").hide();
        } else {
            $("#sectionCoupon").show();
        }
    } else { // 패키지
        $("#pkgStatusInfo").show();
        $("#pkgStatusInfoMobile").show();

        $("#pkgBasicInfo").show();
        $("#ticketPassBasicInfo").hide();
        $("#pkgPriceInfo").show();
        $("#ticketPassPriceInfo").hide();
        $("#ticketPassQuestionsInputArea").hide();
        funcInit();
        $(".clsCalcBtn[data-calc=plus][data-type=AD]").click();
    }

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

            open("https://pkgtour.naver.com/products/" + organLandingUrl + "/" + encodeURIComponent(detailCd));
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

            if ($("#isTicket").val() !== "true") {
                if (!(RESERVATION_DATA.payment.nowPayment > RESERVATION_DATA.payment.totalPayment)) {
                    $("#spanFullPayMO").show();
                }
            } else {
                $("#spanFullPayMO").show();
            }

            $("#spanFullPayPC").hide();
        } else { // PC
            $(".clsPromotionBanner[data-gubun=PC]").show();
            $(".clsPromotionBanner[data-gubun=MO]").hide();
            $(".btn-pay").removeClass("mobile");
            $(".btn-pay").addClass("pc");
            $("#spanNoticeMO").hide();
            $("#spanNoticePC").show();
            $("#spanFullPayMO").hide();

            if ($("#isTicket").val() !== "true") {
                if (!(RESERVATION_DATA.payment.nowPayment > RESERVATION_DATA.payment.totalPayment)) {
                    $("#spanFullPayPC").show();
                }
            } else {
                $("#spanFullPayPC").show();
            }
        }
    }).resize();
    $(".clsOptionalOption").on("click", function () {
        funcDisplaySelectedOption(this);
        setDiscountCouponSort();
    });
    $("#btnRemoveAllSelectedOptionanlOption").on("click", function () {
        $("#divSelectedOption").html('<div class="no_list">선택하신 추가경비가 없습니다.</div>');
        $(".clsOptionalOption.act").removeClass("act");
        RESERVATION_DATA.removeAllOptions();
    });
    $(".clsBtnOptionDesc").on("click", function (e) {
        e.stopPropagation();

        var optionSeq = $(this).parents(".clsOptionalOption").data("optionSeq");

        $.ajax({
            url: PATH_STATIC_AJAX + "AjaxGetOptionEditor.aspx",
            data: { optionSeq: optionSeq, organSeq: $("#hidOrganSeq").val() },
            type: "GET",
            success: function (res) {
                if (res.Result == 0) {
                    var html = '';

                    res.OptionEditors.forEach(function (editor) {
                        switch (editor.InputTypeCcd) {
                            case "PKGOSEDTTY01":
                                html += '<div class="e_maintit">' + editor.Content + '</div>';
                                break;
                            case "PKGOSEDTTY02":
                                html += '<div class="e_subtit_black">' + editor.Content + '</div>';
                                break;
                            case "PKGOSEDTTY03":
                                html += '<div class="e_subtit_purple">' + editor.Content + '</div>';
                                break;
                            case "PKGOSEDTTY04":
                                html += '<div class="e_image"><img src="' + editor.ObjectKey + '"></div>';
                                break;
                            case "PKGOSEDTTY05":
                                html += '<div class="e_nobullet">' + (editor.Content ? editor.Content.replace(/\n/g, '<br />') : '') + '</div>';
                                break;
                            case "PKGOSEDTTY06":
                                html += '<div class="e_bullet">' + editor.Content + '</div>';
                                break;
                            default:
                        }
                    });

                    $("#divOptionEditors").html(html);
                    $("#divOptionEditorContainer").show();
                } else {
                    funcGenerateCommonPopup("추가경비", "데이터를 가져오는 중에 오류가 발생하였습니다.");
                }
            }
        });
    });
    $("#divBtnCloseOptionEditor").on("click", function () {
        $("#divOptionEditors").empty();
        $("#divOptionEditorContainer").hide();
    });

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

    $(".clsDuplicationBenefitItem").on("click", function (e) {
        const seq = $(this).data("select-seq");
        const couponCd = $(this).data("select-coupon-cd");
        
        const isCheck = $("#chkBenefit" + seq).is(":checked");

        let obj = { couponCd: "", detailSeq: 0, useCount: 0 };

        if (e.target.tagName == "LI") {
            if (isCheck) {
                $("#chkBenefit" + seq).prop("checked", false);
                $(this).removeClass("on");
                // 특전 제거
                if (alppyDuplicationBenefitCoupons.length > 0) {
                    let targetCoupons = alppyDuplicationBenefitCoupons.filter(x => x.detailSeq == seq && x.couponCd == couponCd);

                    if (targetCoupons != null && targetCoupons.length > 0) {
                        let tempList = [];

                        for (let i = 0; i < alppyDuplicationBenefitCoupons.length; i++) {
                            if (alppyDuplicationBenefitCoupons[i].detailSeq != targetCoupons[0].detailSeq) {
                                tempList.push(alppyDuplicationBenefitCoupons[i]);
                            }
                        }

                        alppyDuplicationBenefitCoupons = tempList;
                    }
                }
            } else {
                $("#chkBenefit" + seq).prop("checked", true);
                $(this).addClass("on");
                // 특전 추가
                obj.couponCd = couponCd;
                obj.detailSeq = seq;
                obj.useCount = 0;
                alppyDuplicationBenefitCoupons.push(obj);
            }
        } else {
            if (isCheck) {
                $(this).addClass("on");
                // 특전 추가
                obj.couponCd = couponCd;
                obj.detailSeq = seq;
                obj.useCount = 0;
                alppyDuplicationBenefitCoupons.push(obj);
            } else {
                // 특전 제거
                $(this).removeClass("on");
                if (alppyDuplicationBenefitCoupons.length > 0) {
                    let targetCoupons = alppyDuplicationBenefitCoupons.filter(x => x.detailSeq == seq && x.couponCd == couponCd);

                    if (targetCoupons != null && targetCoupons.length > 0) {
                        let tempList = [];

                        for (let i = 0; i < alppyDuplicationBenefitCoupons.length; i++) {
                            if (alppyDuplicationBenefitCoupons[i].detailSeq != targetCoupons[0].detailSeq) {
                                tempList.push(alppyDuplicationBenefitCoupons[i]);
                            }
                        }

                        alppyDuplicationBenefitCoupons = tempList;
                    }
                }
            }
        }
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
    $(".clsDuplicationPerkPopup").on("click", function () {
        DuplicationPerkPopupShow($(this).data("couponCd"), $(this).data("seq"));
    });
    $("#btnDiscountPopupShow").on("click", function () {
        $("#sectionDiscountPopup").addClass("visible");
    });
    $(".clsDiscountPopupHide").on("click", function () {
        $("#sectionDiscountPopup").removeClass("visible");
    });
    $(document).on("click", ".clsCouponItem", function () {
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
    const perkCouponSelectResult = SelectDuplicationPerkCoupon();

    if (perkCouponSelectResult) {
        var $this = $(this);

        $this.attr("disabled", true);
        funcShowReservationLoading();

        // 예약자, 일행 정보 validation
        if ($("#isTicket").val() === "true") {
            if (funcTicketPassReservationValidation() == false) {
                $this.attr("disabled", false);
                funcHideReservationLoading();
                return;
            }

        } else {
            if (funcReservationValidation() == false) {
                $this.attr("disabled", false);
                funcHideReservationLoading();
                return;
            }
        }

        funcResPreProcess();
    }
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
        location.href = SERVICE_URL + $("#hidOrganUrl").val() + "ReservationOversea.aspx?detailCd=" + encodeURIComponent($(this).data("detailCd").toString().replace(/_/g, "|")) + "&tr=" + tr + "&trx=" + trx;
    } else {
        location.href = SERVICE_URL + $("#hidOrganUrl").val() + "ReservationOversea.aspx?detailCd=" + encodeURIComponent($(this).data("detailCd").toString().replace(/_/g, "|"));
    }
});

// 인원 +, - 버튼 (티켓/패스)
$(document).on("click", ".ticketClsCalcBtn", function () {
    var $this = $(this);
    var $container = $this.parents(".clsPriceContainer");
    var calc = $this.data("calc");
    var type = $this.data("type");
    var loop = $container.data("loop");
    var priceCd = $container.data("price-cd");

    if ((calc === "minus" && type === "AD") || (calc === "minus" && type === "CD") || (calc === "minus" && type === "E2") || (calc === "minus" && type === "E3")) {
        let selectedPersonCnt = 0;

        // 성인 선택한 수
        for (let i = 0; i < adultPriceCds.length; i++) {
            selectedPersonCnt += adultPriceCds[i].adCnt;
        }

        // 시니어 선택한 수
        for (let i = 0; i < e2PriceCds.length; i++) {
            selectedPersonCnt += e2PriceCds[i].adCnt;
        }

        // 청소년 선택한 수
        for (let i = 0; i < e3PriceCds.length; i++) {
            selectedPersonCnt += e3PriceCds[i].adCnt;
        }

        // 아동 선택한 수
        for (let i = 0; i < childPriceCds.length; i++) {
            selectedPersonCnt += childPriceCds[i].adCnt;
        }

        if (selectedPersonCnt === 1) {
            // funcGenerateFocusCommonPopup("예약", "성인 혹은 아동을 1명 이상 선택해 주세요.", $this.attr("id"));
            funcGenerateFocusCommonPopup("예약", "유아(24개월 미만)를 제외한 예약 인원을 1명 이상 선택해 주세요.", $this.attr("id"));
            return;
        }
    }
    //if ((calc === "minus" && type === "AD") || (calc === "minus" && type === "CD")) {
    //    let selectedPersonCnt = 0;

    //    for (let i = 0; i < adultPriceCds.length; i++) {
    //        selectedPersonCnt += adultPriceCds[i].adCnt;
    //    }

    //    for (let i = 0; i < childPriceCds.length; i++) {
    //        selectedPersonCnt += childPriceCds[i].adCnt;
    //    }

    //    if (selectedPersonCnt === 1) {
    //        funcGenerateFocusCommonPopup("예약", "성인 혹은 아동을 1명 이상 선택해 주세요.", $this.attr("id"));
    //        return;
    //    }
    //}

    var priceInfoArr = JSON.parse(funcDecodeUriHiddenInfo($("#hidPriceInfo").val()));
    var priceInfoObj = priceInfoArr[loop];

    var isPlus = false;
    var selectPersonType = "";
    var selectPrice = 0;

    var cnt = priceInfoObj[type + "Cnt"];
    if (calc == "minus") {
        cnt = Math.max(0, cnt - 1);
        if (cnt == 0) {
            $this.removeClass("ov_minus")
        }
        isPlus = false;
    } else if (calc == "plus") {
        cnt++;
        if ($this.siblings(".ticketClsCalcBtn[data-calc=minus]").hasClass("ov_minus") == false) {
            $this.siblings(".ticketClsCalcBtn[data-calc=minus]").addClass("ov_minus");
        }
        isPlus = true;
    }

    // 인원수 변경시 ( + - ) 요금 변경
    var x = $this.parents('.p_td').children('.tit_age').children('.price');
    if (type == "AD") {
        var price_type = priceInfoObj.ADPrice;
        selectPersonType = "AD";
        selectPrice = price_type;
    } else if (type == "CD") {
        var price_type = priceInfoObj.CDPrice;
        selectPersonType = "CD";
        selectPrice = price_type;
    } else if (type == "E1") {
        var price_type = priceInfoObj.E1Price;
        selectPersonType = "E1";
        selectPrice = price_type;
    } else if (type == "E2") {
        var price_type = priceInfoObj.E2Price;
        selectPersonType = "E2";
        selectPrice = price_type;
    } else if (type == "E3") {
        var price_type = priceInfoObj.E3Price;
        selectPersonType = "E3";
        selectPrice = price_type;
    }

    var xPrice = (parseInt(price_type) * parseInt(cnt));
    if (xPrice === 0) {
        xPrice = (parseInt(price_type) * parseInt(cnt + 1));
    }

    x.text(xPrice.toNumberWithComma() + " 원");

    let obj = { priceCd: "", adCnt: 0, adPrice: 0 };
    
    // 요금 추가
    if (isPlus) {
        if (selectPersonType === "AD") {
            let adultPriceCdsFilter = adultPriceCds.filter(x => x.priceCd === priceCd);

            if (adultPriceCdsFilter.length > 0) {
                adultPriceCdsFilter[0].adCnt++;
                adultPriceCdsFilter[0].adPrice += parseInt(selectPrice);
            } else {
                obj.priceCd = priceCd;
                obj.adCnt = 1;
                obj.adPrice = parseInt(selectPrice);
                adultPriceCds.push(obj);
            }

        } else if (selectPersonType === "CD") {
            let childPriceCdsFilter = childPriceCds.filter(x => x.priceCd === priceCd);

            if (childPriceCdsFilter.length > 0) {
                childPriceCdsFilter[0].adCnt++;
                childPriceCdsFilter[0].adPrice += parseInt(selectPrice);
            } else {
                obj.priceCd = priceCd;
                obj.adCnt = 1;
                obj.adPrice = parseInt(selectPrice);
                childPriceCds.push(obj);
            }

        } else if (selectPersonType === "E1") {
            TICKETPASS_RESERVATION_DATA.master.infantCnt++;
            TICKETPASS_RESERVATION_DATA.master.infantTotalPrice = TICKETPASS_RESERVATION_DATA.master.infantTotalPrice + selectPrice;
        } else if (selectPersonType === "E2") {
            let e2PriceCdsFilter = e2PriceCds.filter(x => x.priceCd === priceCd);

            if (e2PriceCdsFilter.length > 0) {
                e2PriceCdsFilter[0].adCnt++;
                e2PriceCdsFilter[0].adPrice += parseInt(selectPrice);
            } else {
                obj.priceCd = priceCd;
                obj.adCnt = 1;
                obj.adPrice = parseInt(selectPrice);
                e2PriceCds.push(obj);
            }
        } else if (selectPersonType === "E3") {
            let e3PriceCdsFilter = e3PriceCds.filter(x => x.priceCd === priceCd);

            if (e3PriceCdsFilter.length > 0) {
                e3PriceCdsFilter[0].adCnt++;
                e3PriceCdsFilter[0].adPrice += parseInt(selectPrice);
            } else {
                obj.priceCd = priceCd;
                obj.adCnt = 1;
                obj.adPrice = parseInt(selectPrice);
                e3PriceCds.push(obj);
            }
        }
    } else { // 요금 차감
        if (selectPersonType === "AD") {
            let adultPriceCdsFilter2 = adultPriceCds.filter(x => x.priceCd === priceCd);

            if (adultPriceCdsFilter2.length > 0) {
                adultPriceCdsFilter2[0].adCnt--;
                adultPriceCdsFilter2[0].adPrice = adultPriceCdsFilter2[0].adPrice - parseInt(selectPrice);
                if (adultPriceCdsFilter2[0].adCnt < 0) {
                    adultPriceCdsFilter2[0].adCnt = 0;
                    adultPriceCdsFilter2[0].adPrice = 0;
                }
            } else {
                obj.priceCd = priceCd;
                obj.adCnt = 0;
                obj.adPrice = 0;
                adultPriceCds.push(obj);
            }
        } else if (selectPersonType === "CD") {
            let childPriceCdsFilter2 = childPriceCds.filter(x => x.priceCd === priceCd);

            if (childPriceCdsFilter2.length > 0) {
                childPriceCdsFilter2[0].adCnt--;
                childPriceCdsFilter2[0].adPrice = childPriceCdsFilter2[0].adPrice - parseInt(selectPrice);
                if (childPriceCdsFilter2[0].adCnt < 0) {
                    childPriceCdsFilter2[0].adCnt = 0;
                    childPriceCdsFilter2[0].adPrice = 0;
                }
            } else {
                obj.priceCd = priceCd;
                obj.adCnt = 0;
                obj.adPrice = 0;
                childPriceCds.push(obj);
            }

        } else if (selectPersonType === "E1") {
            TICKETPASS_RESERVATION_DATA.master.infantCnt--;
            TICKETPASS_RESERVATION_DATA.master.infantTotalPrice = TICKETPASS_RESERVATION_DATA.master.infantTotalPrice - selectPrice;
            if (TICKETPASS_RESERVATION_DATA.master.infantTotalPrice < 0) {
                TICKETPASS_RESERVATION_DATA.master.infantCnt = 0;
                TICKETPASS_RESERVATION_DATA.master.infantTotalPrice = 0;
            }
        } else if (selectPersonType === "E2") {
            let e2PriceCdsFilter2 = e2PriceCds.filter(x => x.priceCd === priceCd);

            if (e2PriceCdsFilter2.length > 0) {
                e2PriceCdsFilter2[0].adCnt--;
                e2PriceCdsFilter2[0].adPrice = e2PriceCdsFilter2[0].adPrice - parseInt(selectPrice);
                if (e2PriceCdsFilter2[0].adCnt < 0) {
                    e2PriceCdsFilter2[0].adCnt = 0;
                    e2PriceCdsFilter2[0].adPrice = 0;
                }
            } else {
                obj.priceCd = priceCd;
                obj.adCnt = 0;
                obj.adPrice = 0;
                e2PriceCds.push(obj);
            }
        } else if (selectPersonType === "E3") {
            let e3PriceCdsFilter2 = e3PriceCds.filter(x => x.priceCd === priceCd);

            if (e3PriceCdsFilter2.length > 0) {
                e3PriceCdsFilter2[0].adCnt--;
                e3PriceCdsFilter2[0].adPrice = e3PriceCdsFilter2[0].adPrice - parseInt(selectPrice);
                if (e3PriceCdsFilter2[0].adCnt < 0) {
                    e3PriceCdsFilter2[0].adCnt = 0;
                    e3PriceCdsFilter2[0].adPrice = 0;
                }
            } else {
                obj.priceCd = priceCd;
                obj.adCnt = 0;
                obj.adPrice = 0;
                e3PriceCds.push(obj);
            }
        }
    }

    // 성인
    let adultTotalCnt = 0;
    let adultTotalPrice = 0;

    for (let i = 0; i < adultPriceCds.length; i++) {
        adultTotalCnt += adultPriceCds[i].adCnt;
        adultTotalPrice += adultPriceCds[i].adPrice;
    }

    // 소아
    let childTotalCnt = 0;
    let childTotalPrice = 0;

    for (let i = 0; i < childPriceCds.length; i++) {
        childTotalCnt += childPriceCds[i].adCnt;
        childTotalPrice += childPriceCds[i].adPrice;
    }

    // 시니어
    let e2TotalCnt = 0;
    let e2TotalPrice = 0;

    for (let i = 0; i < e2PriceCds.length; i++) {
        e2TotalCnt += e2PriceCds[i].adCnt;
        e2TotalPrice += e2PriceCds[i].adPrice;
    }

    // 청소년
    let e3TotalCnt = 0;
    let e3TotalPrice = 0;

    for (let i = 0; i < e3PriceCds.length; i++) {
        e3TotalCnt += e3PriceCds[i].adCnt;
        e3TotalPrice += e3PriceCds[i].adPrice;
    }

    TICKETPASS_RESERVATION_DATA.master.adultCnt = adultTotalCnt;
    TICKETPASS_RESERVATION_DATA.master.adultTotalPrice = adultTotalPrice;

    TICKETPASS_RESERVATION_DATA.master.childCnt = childTotalCnt;
    TICKETPASS_RESERVATION_DATA.master.childTotalPrice = childTotalPrice;

    // 시니어
    TICKETPASS_RESERVATION_DATA.master.e2Cnt = e2TotalCnt;
    TICKETPASS_RESERVATION_DATA.master.e2TotalPrice = e2TotalPrice;

    // 청소년
    TICKETPASS_RESERVATION_DATA.master.e3Cnt = e3TotalCnt;
    TICKETPASS_RESERVATION_DATA.master.e3TotalPrice = e3TotalPrice;

    // BENEFIT_SELECT_PERSON_COUNT = TICKETPASS_RESERVATION_DATA.master.adultCnt + TICKETPASS_RESERVATION_DATA.master.childCnt + TICKETPASS_RESERVATION_DATA.master.infantCnt;
    BENEFIT_SELECT_PERSON_COUNT = TICKETPASS_RESERVATION_DATA.master.adultCnt + TICKETPASS_RESERVATION_DATA.master.childCnt + TICKETPASS_RESERVATION_DATA.master.infantCnt
        + TICKETPASS_RESERVATION_DATA.master.e2Cnt + TICKETPASS_RESERVATION_DATA.master.e3Cnt;

    priceInfoObj[type + "Cnt"] = cnt;
    // 인원수 업데이트
    $("#spn" + type + "Cnt_" + loop).empty().text(cnt + "명");
    // 요금정보 업데이트
    $("#hidPriceInfo").val(encodeURIComponent(JSON.stringify(priceInfoArr)));
    // 선택된 요금 안내, 일행정보
    funcSelectedPriceInfo();
    // 티켓/패스 요금계산
    funcCalcPrice(type, cnt);
});


// 인원 +, - 버튼 (패키지)
$(document).on("click", ".clsCalcBtn", function () {
    var $this = $(this);
    var calc = $this.data("calc");
    var type = $this.data("type");

    if (calc === "minus" && type === "AD" && RESERVATION_DATA.getPeopleCount("AD") === 1) {
        funcGenerateFocusCommonPopup("예약", "성인은 최소 1명 이상 선택해 주세요.", $this.attr("id"));
        return;
    }

    if ($this.hasClass("minus_none")) {
        return;
    }

    var cnt = RESERVATION_DATA.getPeopleCount(type);
    if (calc == "minus") {
        cnt = Math.max(0, cnt - 1);
        if (cnt == 0) {
            $this.addClass("minus_none")
        }
    } else if (calc == "plus") {
        var maxCount = 0;

        switch (type) {
            case "AD":
                maxCount = 40;
                break;
            case "CD":
                maxCount = 10;
                break;
            case "IN":
                maxCount = 10;
                break;
            default:
        }

        if (++cnt > maxCount) {
            return;
        }

        if ($this.siblings(".clsCalcBtn[data-calc=minus]").hasClass("minus_none")) {
            $this.siblings(".clsCalcBtn[data-calc=minus]").removeClass("minus_none");
        }
    }

    RESERVATION_DATA.setPeopleCount(type, cnt);
    RESERVATION_DATA.discountCoupon.couponCd = "";
    RESERVATION_DATA.discountCoupon.detailSeq = 0;
    RESERVATION_DATA.discountCoupon.discountPrice = 0;
    RESERVATION_DATA.perkCoupon.couponCd = "";
    RESERVATION_DATA.perkCoupon.detailSeq = 0;
    RESERVATION_DATA.perkCoupon.useCount = 0;
    let couponArray = JSON.parse($("#hidCouponData").val());
    if (couponArray.length == 0 || RESERVATION_DATA.getPeopleCount("AD") + RESERVATION_DATA.getPeopleCount("CD") + RESERVATION_DATA.getPeopleCount("IN") == 0) {
        $("#sectionCoupon").hide();
        SelectDiscountCoupon("", 0);
    } else {
        $("#sectionCoupon").show();
        initDiscountCoupon();
        initBenefitCoupon();
        initDuplicationBenefitCoupon();

        let totalPerksCouponCnt = perksCouponCnt + duplicationPerksCouponCnt;

        if (totalPerksCouponCnt > 0) {
            $("#perksCouponDesc").show();
        } else {
            $("#perksCouponDesc").hide();
        }
    }
    $("#spn" + type + "Cnt").empty().text(cnt + "명");
    setDiscountCouponSort();
});

function priceDescriptionPopup(description) {
    funcGenerateCommonPopup("요금 설명", description, "");
}

function setDiscountCouponSort() {
    $("#tbodyDiscountCoupon").html("");
    const adultPrice = parseInt($("#adultPrice").val());

    let totalPaymentNotDiscount = 0;

    if ($("#isTicket").val() !== "true") {
        totalPaymentNotDiscount = RESERVATION_DATA.payment.totalPaymentNotDiscount;
    } else {
        totalPaymentNotDiscount = TICKETPASS_RESERVATION_DATA.payment.totalPaymentNotDiscount;
    }

    let couponArray = JSON.parse($("#hidCouponData").val());
    let couponDetailArray = JSON.parse($("#hidCouponDetailData").val());

    let str = "";

    let activateCoupons = [];
    let activateCoupons2 = [];
    let activateCoupons3 = [];
    let activateCoupons4 = [];
    let activateCoupons5 = [];

    for (let i = 0; i < couponDetailArray.length; i++) {
        if (!(adultPrice > couponDetailArray[i].ApplyEndPrice)) {
            let budGetFilterItem = couponArray.filter(x => x.CouponCd === couponDetailArray[i].CouponCd && x.CouponCcd === "COUPONT01");
            
            if (budGetFilterItem[0].UnlimitedYn === "N") {
                let discountPrice = 0;
                if (couponDetailArray[i].CouponCondCcd === "ACCPAYGB02") {
                    discountPrice = (parseFloat(adultPrice) * parseFloat(couponDetailArray[i].DiscountCouponPercent)) * 0.01;
                } else {
                    discountPrice = parseInt(couponDetailArray[i].DiscountCouponPrice); 
                }

                if (discountPrice <= budGetFilterItem[0].BudGetAmount) {
                    activateCoupons.push(couponDetailArray[i]);
                }
            } else {
                activateCoupons.push(couponDetailArray[i]);
            }
        }
    }

    if (activateCoupons.length > 0) {
        for (let i = 0; i < activateCoupons.length; i++) {
            if (activateCoupons[i].CouponCondCcd === "ACCPAYGB02") {
                let discountPrice = parseInt((parseFloat(totalPaymentNotDiscount) * parseFloat(activateCoupons[i].DiscountCouponPercent)) * 0.01);
                activateCoupons[i].DiscountCouponPrice = discountPrice;

                if (totalPaymentNotDiscount > discountPrice) {
                    activateCoupons2.push(activateCoupons[i]);
                }
            } else {
                if (totalPaymentNotDiscount > activateCoupons[i].DiscountCouponPrice) {
                    activateCoupons2.push(activateCoupons[i]);
                }
            }
        }
    } else {
        $("#divListWrap").hide();
        $("#btnDiscountPopupShow").hide();
    }

    if (activateCoupons2.length > 0) {
        // 트래블 클럽, 일반 기준 sort
        for (let i = 0; i < activateCoupons2.length; i++) {
            switch (activateCoupons2[i].ApplyGradeCcd) {
                case "NORMAL":
                    activateCoupons2[i].Priority = 1; break;
                case "BASIC":
                    activateCoupons2[i].Priority = 2; break;
                case "SMART":
                    activateCoupons2[i].Priority = 3; break;
                case "GOLD":
                    activateCoupons2[i].Priority = 4; break;
            }
        }

        let sortPriorityActivateCoupons = activateCoupons2.sort(function (a, b) {
            return b.Priority - a.Priority;
        });

        activateCoupons2 = sortPriorityActivateCoupons;

        // 할인율 높은 순으로 sort
        activateCoupons3 = activateCoupons2.sort(function (a, b) {
            return b.DiscountCouponPrice - a.DiscountCouponPrice;
        });

        for (let i = 0; i < activateCoupons3.length; i++) {
            if (activateCoupons3[i].ApplyStartPrice <= totalPaymentNotDiscount && totalPaymentNotDiscount <= activateCoupons3[i].ApplyEndPrice) {
                activateCoupons4.push(activateCoupons3[i]);
            }
        }

        if (activateCoupons4.length === 0) {
            for (let i = 0; i < activateCoupons3.length; i++) {
                let gradeStr = "";
                let gradeIcon = "";
                let gradeClass = "";

                switch (activateCoupons3[i].ApplyGradeCcd) {
                    case "BASIC":
                        gradeStr = "베이직 등급";
                        gradeIcon = "B";
                        gradeClass = "02";
                        break;
                    case "SMART":
                        gradeStr = "스마트 등급";
                        gradeIcon = "S";
                        gradeClass = "04";
                        break;
                    case "GOLD":
                        gradeStr = "골드 등급";
                        gradeIcon = "G";
                        gradeClass = "03";
                        break;
                    default:
                        gradeStr = "모든 회원";
                        gradeIcon = "A";
                        gradeClass = "01";
                        break;
                }

                let couponFilter = couponArray.filter(x => x.CouponCd === activateCoupons3[i].CouponCd);

                str += "<tr class='clsCouponItem' id='trDiscountItem" + activateCoupons3[i].Seq + "' style='cursor:pointer' data-position='{dataCnt}' data-discount-price='0' data-active='N' data-no-coupon='N' data-select-coupon-cd='" + activateCoupons3[i].CouponCd + "' data-select-seq='" + activateCoupons3[i].Seq + "' data-seq='rdoDiscountCoupon" + activateCoupons3[i].Seq + "'>";
                str += "<td class='bdrn'>";
                str += "<input class='form-check-input c01' type='radio' name='rdoDiscountCoupon' id='rdoDiscountCoupon" + activateCoupons3[i].Seq + "' data-select-coupon-cd='" + activateCoupons3[i].CouponCd + "' data-select-seq='" + activateCoupons3[i].Seq + "' data-seq='trDiscountItem" + activateCoupons3[i].Seq + "' value='" + activateCoupons3[i].Seq + "' />";
                str += "</td>";
                str += "<td class='tal'>";
                str += "<span class='c_txt01'>" + couponFilter[0].Name + "</span>";
                str += "<div class='c_gp01'>";
                str += "<span class='c_tt02'>할인 대상 구간 : " + activateCoupons3[i].ApplyStartPrice.toNumberWithComma() + "원 ~ " + activateCoupons3[i].ApplyEndPrice.toNumberWithComma() + "원</span>";
                str += "</div>";

                if (activateCoupons3[i].MaxDiscountPrice > 0) {
                    str += "<div class='c_gp01'>";
                    str += "<span class='c_txt02'>할인 한도 최대 " + activateCoupons3[i].MaxDiscountPrice.toNumberWithComma() + "원</span>";
                    str += "</div>";
                }

                str += "<div class='c_gp01 chooseWhenChangingAmount' id='chooseWhenChangingAmount_" + activateCoupons3[i].CouponCd + "_" + activateCoupons3[i].Seq + "'>";
                str += "<span class='c_txt02' style='color:red;'>결제 금액 변경시 선택 가능</span>";
                str += "</div>";

                str += "</td>";
                str += "<td>";
                str += "<i class='icoGrade c" + gradeClass + "'>" + gradeIcon + "</i>";
                str += "<div class='c_txt03_" + gradeClass + "'>" + gradeStr + "</div>";
                str += "</td>";

                if (activateCoupons3[i].CouponCondCcd === "ACCPAYGB01") {
                    str += "<td>" + activateCoupons3[i].DiscountCouponPrice.toNumberWithComma() + "</td>";
                } else {
                    str += "<td>" + activateCoupons3[i].DiscountCouponPercent + " % </td>";
                }

                str += "</tr>";
            }
        } else {

            let addedSeqs = [];

            for (let i = 0; i < activateCoupons4.length; i++) {
                activateCoupons5.push(activateCoupons4[i]);
                addedSeqs.push(activateCoupons4[i].Seq);
            }

            let notActivateCoupons = [];
            let notActivateCouponOrders = [];

            for (let i = 0; i < activateCoupons3.length; i++) {
                if (!addedSeqs.includes(activateCoupons3[i].Seq)) {
                    notActivateCoupons.push(activateCoupons3[i]);
                }
            }

            // 선택 대상이 아닌 쿠폰들을 트래블 클럽, 일반 기준 sort
            for (let i = 0; i < notActivateCoupons.length; i++) {
                switch (notActivateCoupons[i].ApplyGradeCcd) {
                    case "NORMAL":
                        notActivateCoupons[i].Priority = 1; break;
                    case "BASIC":
                        notActivateCoupons[i].Priority = 2; break;
                    case "SMART":
                        notActivateCoupons[i].Priority = 3; break;
                    case "GOLD":
                        notActivateCoupons[i].Priority = 4; break;
                }
            }

            let sortPriorityNotActivateCoupons = notActivateCoupons.sort(function (a, b) {
                return b.Priority - a.Priority;
            });

            // 선택대상이 아닌 쿠폰들을 할인율 높은 순으로 sort
            notActivateCouponOrders = sortPriorityNotActivateCoupons.sort(function (a, b) {
                return b.DiscountCouponPrice - a.DiscountCouponPrice;
            });

            for (let i = 0; i < notActivateCouponOrders.length; i++) {
                activateCoupons5.push(notActivateCouponOrders[i]);
            }

            for (let i = 0; i < activateCoupons5.length; i++) {
                let gradeStr = "";
                let gradeIcon = "";
                let gradeClass = "";

                switch (activateCoupons5[i].ApplyGradeCcd) {
                    case "BASIC":
                        gradeStr = "베이직 등급";
                        gradeIcon = "B";
                        gradeClass = "02";
                        break;
                    case "SMART":
                        gradeStr = "스마트 등급";
                        gradeIcon = "S";
                        gradeClass = "04";
                        break;
                    case "GOLD":
                        gradeStr = "골드 등급";
                        gradeIcon = "G";
                        gradeClass = "03";
                        break;
                    default:
                        gradeStr = "모든 회원";
                        gradeIcon = "A";
                        gradeClass = "01";
                        break;
                }

                let couponFilter = couponArray.filter(x => x.CouponCd === activateCoupons5[i].CouponCd);

                str += "<tr class='clsCouponItem' id='trDiscountItem" + activateCoupons5[i].Seq + "' style='cursor:pointer' data-position='{dataCnt}' data-discount-price='0' data-active='N' data-no-coupon='N' data-select-coupon-cd='" + activateCoupons5[i].CouponCd + "' data-select-seq='" + activateCoupons5[i].Seq + "' data-seq='rdoDiscountCoupon" + activateCoupons5[i].Seq + "'>";
                str += "<td class='bdrn'>";
                str += "<input class='form-check-input c01' type='radio' name='rdoDiscountCoupon' id='rdoDiscountCoupon" + activateCoupons5[i].Seq + "' data-select-coupon-cd='" + activateCoupons5[i].CouponCd + "' data-select-seq='" + activateCoupons5[i].Seq + "' data-seq='trDiscountItem" + activateCoupons5[i].Seq + "' value='" + activateCoupons5[i].Seq + "' />";
                str += "</td>";
                str += "<td class='tal'>";
                str += "<span class='c_txt01'>" + couponFilter[0].Name + "</span>";
                str += "<div class='c_gp01'>";
                str += "<span class='c_tt02'>할인 대상 구간 : " + activateCoupons5[i].ApplyStartPrice.toNumberWithComma() + "원 ~ " + activateCoupons5[i].ApplyEndPrice.toNumberWithComma() + "원</span>";
                str += "</div>";

                if (activateCoupons5[i].MaxDiscountPrice > 0) {
                    str += "<div class='c_gp01'>";
                    str += "<span class='c_txt02'>할인 한도 최대 " + activateCoupons5[i].MaxDiscountPrice.toNumberWithComma() + "원</span>";
                    str += "</div>";
                }

                str += "<div class='c_gp01 chooseWhenChangingAmount' id='chooseWhenChangingAmount_" + activateCoupons5[i].CouponCd + "_" + activateCoupons5[i].Seq + "'>";
                str += "<span class='c_txt02' style='color:red;'>결제 금액 변경시 선택 가능</span>";
                str += "</div>";

                str += "</td>";
                str += "<td>";
                str += "<i class='icoGrade c" + gradeClass + "'>" + gradeIcon + "</i>";
                str += "<div class='c_txt03_" + gradeClass + "'>" + gradeStr + "</div>";
                str += "</td>";

                if (activateCoupons5[i].CouponCondCcd === "ACCPAYGB01") {
                    str += "<td>" + activateCoupons5[i].DiscountCouponPrice.toNumberWithComma() + "</td>";
                } else {
                    str += "<td>" + activateCoupons5[i].DiscountCouponPercent + " % </td>";
                }

                str += "</tr>";
            }
        }
    }

    str += "<tr class='clsCouponItem' id='trDiscountItem0' style='cursor:pointer' data-position='999' data-discount-price='-999' data-active='Y' data-no-coupon='Y' data-select-coupon-cd='0' data-select-seq='0' data-seq='rdoDiscountCoupon0'>";
    str += "<td class='bdrn'>";
    str += "<input class='form-check-input c01' type='radio' name='rdoDiscountCoupon' id='rdoDiscountCoupon0' data-select-coupon-cd='0' data-select-seq='0' data-seq='trDiscountItem0' value='0' />";
    str += "</td>";
    str += "<td class='tal' colspan='3'>";
    str += "<span class='c_txt01'>쿠폰 사용 안 함</span>";
    str += "</td>";
    str += "</tr>";

    $("#tbodyDiscountCoupon").html(str);
    setDiscountCheckActivate(false);
}

// 요금 계산 (티켓/패스)
function funcCalcPrice(type, cnt) {
    var totalNetPrice = 0;

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

    var totalActPrice = totalNetPrice;

    // display
    $("#spnNetPrice").text(totalNetPrice.toNumberWithComma());
    $("#spnActPrice").text(totalActPrice.toNumberWithComma());
    $("#spnActPrice2").text(totalActPrice.toNumberWithComma());
    $("#sNowPayment").text(totalActPrice.toNumberWithComma() + "원");
    // $("#pResCnt").text("( 성인" + adCnt + " / " + "소아 " + cdCnt + " / " + "유아 " + e1Cnt + " )");
    $("#pResCnt").text("( 성인 " + adCnt + " / " + "시니어 " + e2Cnt + " / " + "청소년 " + e3Cnt + " / " + "소아 " + cdCnt + " / " + "유아 " + e1Cnt + " )");

    var nowHtml = '';
    if (adCnt > 0 || cdCnt > 0 || e1Cnt > 0 || e2Cnt > 0 || e3Cnt > 0) {
        // nowHtml += '<li><p>상품</p><span>총 ' + (adCnt + cdCnt + e1Cnt) + ' 명 (성인 ' + adCnt + ' / 소아 ' + cdCnt + ' / 유아 ' + e1Cnt + ')</span><span class="sm_txt color-grey">' + totalActPrice.toNumberWithComma() + '원</span></li>';
        nowHtml += '<li><p>상품</p><span>총 ' + (adCnt + cdCnt + e1Cnt + e2Cnt + e3Cnt) + ' 명 (성인 ' + adCnt + ' / 시니어 ' + e2Cnt + ' / 청소년 ' + e3Cnt + ' / 소아 ' + cdCnt + ' / 유아 ' + e1Cnt + ')</span><span class="sm_txt color-grey">' + totalActPrice.toNumberWithComma() + '원</span></li>';
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
                // $("#strAccPoint" + promotion.PromotionCd).text(promotionAmount.toNumberWithComma() + " 원");
                $("#strAccPoint" + promotion.PromotionCd).text(Math.ceil(promotionAmount).toNumberWithComma() + " 원");
                accPromotionAmount += promotionAmount;

                if (promotion.PromotionTypeCcd == "PROMOTYPE01") {
                    sumAccPercent += promotion.NPayAccPercent;
                }

                if (promotion.NPayAccLimit > 0) {
                    if (promotion.PromotionTypeCcd == "PROMOTYPE01") {
                        $("#normalAccLimit").text(promotion.NPayAccLimit.toNumberWithComma());
                    }
                }

                if (promotion.PromotionTypeCcd === "PROMOTYPE01") {
                    normalNPayAccPercent = promotion.NPayAccPercent;
                    normalNPayAccLimit = promotion.NPayAccLimit;
                    normalNPayAccPointTargetElementId = "strAccPoint" + promotion.PromotionCd;
                } else {
                    cardNPayAccPercent = promotion.NPayAccPercent;
                    cardNPayAccLimit = promotion.NPayAccLimit;
                    cardNPayAccPointTargetElementId = "strAccPoint" + promotion.PromotionCd;
                }
            });
            $(".clsPromotion").show();
        }

        sTotalPayment = totalActPrice;
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
        
        let totalAccPercent = 0;

        if (PROMOTION_DATA != null && PROMOTION_DATA != undefined && PROMOTION_DATA.length > 0) {
            PROMOTION_DATA.forEach(function (promotion) {
                totalAccPercent += promotion.NPayAccPercent;
            });
        }

        totalAccPercent = totalAccPercent + 1;

        var dropdownTopTemplateTemp = dropdownTopTemplate;
        // dropdownTopTemplateTemp = dropdownTopTemplateTemp.replace(/#MAX_ACCPERCENT#/g, (Math.max(...npayAccPercentArr) + (sumAccPercent + 1)));
        dropdownTopTemplateTemp = dropdownTopTemplateTemp.replace(/#MAX_ACCPERCENT#/g, totalAccPercent);
        dropdownTopTemplateTemp = dropdownTopTemplateTemp.replace(/#MAX_NPAY_POINT#/g, (basicPromotionAmount + normalPromotionPrice + cardPromotionPrice).toNumberWithComma() + " 원");

        $("#spanMaxAccPoint").text(sumAccPercent);
        $("#aDropdownTop").html(dropdownTopTemplateTemp);

        //결제 버튼 영역
        $("#sTotalPaymentBtn").text($("#sTotalPayment").text());
        // $("#pResCntBtn").text("( 성인" + adCnt + " / " + "소아 " + cdCnt + " / " + "유아 " + e1Cnt + " )");
        $("#pResCntBtn").text("( 성인 " + adCnt + " / " + "시니어 " + e2Cnt + " / " + "청소년 " + e3Cnt + " / " + "소아 " + cdCnt + " / " + "유아 " + e1Cnt + " )");
        $("#payBtn").text($("#sTotalPayment").text());
        $("#fullPayYn").text("결제금액");
        basicPromotionAccPoint = basicPromotionAmount;
        $("#strBasicPromotionAccPoint").text(Math.ceil(basicPromotionAmount).toNumberWithComma() + " 원");
        // $("#strNPayMaxPoint").text((basicPromotionAmount + normalPromotionPrice + cardPromotionPrice).toNumberWithComma() + " 원");
        $("#strNPayMaxPoint").text(Math.ceil(basicPromotionAmount + normalPromotionPrice + cardPromotionPrice).toNumberWithComma() + " 원");
        $("#strDropdownTopNPayMaxPoint").text(Math.ceil(basicPromotionAmount + normalPromotionPrice + cardPromotionPrice).toNumberWithComma() + " 원");

        ticketPassNormalPromotionPrice = normalPromotionPrice;
        ticketPassCardPromotionPrice = cardPromotionPrice;

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

    $("#hidNetPrice").val(totalNetPrice);
    $("#hidActPrice").val(totalActPrice);
    $("#hidPromotionAmount").val(accPromotionAmount);

    // TICKETPASS_RESERVATION_DATA.payment.promotionAmount = accPromotionAmount;
    TICKETPASS_RESERVATION_DATA.discountCoupon.couponCd = "";
    TICKETPASS_RESERVATION_DATA.discountCoupon.detailSeq = 0;
    TICKETPASS_RESERVATION_DATA.discountCoupon.discountPrice = 0;
    TICKETPASS_RESERVATION_DATA.perkCoupon.couponCd = "";
    TICKETPASS_RESERVATION_DATA.perkCoupon.detailSeq = 0;
    TICKETPASS_RESERVATION_DATA.perkCoupon.useCount = 0;

    let couponArray = JSON.parse($("#hidCouponData").val());

    // if (couponArray.length == 0 || TICKETPASS_RESERVATION_DATA.getPeopleCount("AD") + TICKETPASS_RESERVATION_DATA.getPeopleCount("CD") + TICKETPASS_RESERVATION_DATA.getPeopleCount("IN") == 0) {
    if (couponArray.length == 0 || TICKETPASS_RESERVATION_DATA.getPeopleCount("AD") + TICKETPASS_RESERVATION_DATA.getPeopleCount("CD") + TICKETPASS_RESERVATION_DATA.getPeopleCount("IN") + TICKETPASS_RESERVATION_DATA.getPeopleCount("E2") + TICKETPASS_RESERVATION_DATA.getPeopleCount("E3") == 0) {
        $("#sectionCoupon").hide();
        SelectDiscountCoupon("", 0);
    } else {
        $("#sectionCoupon").show();
        initDiscountCoupon();
        initBenefitCoupon();
        initDuplicationBenefitCoupon();

        let totalPerksCouponCnt = perksCouponCnt + duplicationPerksCouponCnt;

        if (totalPerksCouponCnt > 0) {
            $("#perksCouponDesc").show();
        } else {
            $("#perksCouponDesc").hide();
        }
    }

    setDiscountCouponSort();
}

// 선택된 요금 안내, 일행정보 (티켓/패스)
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

            // 일행 정보
            var coInputTemplate = funcDecodeUriHiddenInfo($("#hidCoInputTemplate").val());

            var selectedPriceInput = "";
            if (containerLoop > 1) {
                selectedPriceInput = "<hr class='hr_2'>";
            }
            
            selectedPriceInput += selectedTicketPassPriceInputTemplate;

            if (priceInfoObj.ADCnt > 0 || priceInfoObj.CDCnt > 0 || priceInfoObj.E1Cnt > 0 || priceInfoObj.E2Cnt > 0 || priceInfoObj.E3Cnt > 0) {
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

            // 시니어
            if (priceInfoObj.E2Cnt > 0) {
                selectedPriceInput = selectedPriceInput.replace(/#E2_INFO#/g, e2InfoTemplate);

                var e2CoInputTotal = "";
                for (var e2Loop = 1; e2Loop <= priceInfoObj.E2Cnt; e2Loop++) {
                    var cdCoInput = coInputTemplate;
                    cdCoInput = cdCoInput.replace(/#COLOOP#/g, e2Loop);
                    cdCoInput = cdCoInput.replace(/#PRICECD#/g, priceInfoObj.PriceCd);
                    cdCoInput = cdCoInput.replace(/#PRICECD_REPLACE#/g, priceInfoObj.PriceCd.replaceAll("|", "_"));
                    cdCoInput = cdCoInput.replace(/#TYPE#/g, "E2");
                    e2CoInputTotal += cdCoInput;
                }
                selectedPriceInput = selectedPriceInput.replace(/#COINPUTE2#/g, e2CoInputTotal);
            } else {
                selectedPriceInput = selectedPriceInput.replace(/#E2_INFO#/g, "");
            }

            // 청소년
            if (priceInfoObj.E3Cnt > 0) {
                selectedPriceInput = selectedPriceInput.replace(/#E3_INFO#/g, e3InfoTemplate);

                var e3CoInputTotal = "";
                for (var e3Loop = 1; e3Loop <= priceInfoObj.E3Cnt; e3Loop++) {
                    var cdCoInput = coInputTemplate;
                    cdCoInput = cdCoInput.replace(/#COLOOP#/g, e3Loop);
                    cdCoInput = cdCoInput.replace(/#PRICECD#/g, priceInfoObj.PriceCd);
                    cdCoInput = cdCoInput.replace(/#PRICECD_REPLACE#/g, priceInfoObj.PriceCd.replaceAll("|", "_"));
                    cdCoInput = cdCoInput.replace(/#TYPE#/g, "E3");
                    e3CoInputTotal += cdCoInput;
                }
                selectedPriceInput = selectedPriceInput.replace(/#COINPUTE3#/g, e3CoInputTotal);
            } else {
                selectedPriceInput = selectedPriceInput.replace(/#E3_INFO#/g, "");
            }


            selectedPriceInput = selectedPriceInput.replace(/#PRODUCTLOOP#/g, priceInfoLoop);
            selectedPriceInput = selectedPriceInput.replace(/#PRICECD#/g, priceInfoObj.PriceCd);
            selectedPriceInput = selectedPriceInput.replace(/#LOOP#/g, containerLoop++);
            selectedPriceInput = selectedPriceInput.replace(/#OPTIONCCDNM#/g, priceInfoObj.FeeFilterName + " / " + priceInfoObj.FeeName);
            selectedPriceInput = selectedPriceInput.replace(/#ADCNT#/g, priceInfoObj.ADCnt);
            selectedPriceInput = selectedPriceInput.replace(/#CDCNT#/g, priceInfoObj.CDCnt);
            selectedPriceInput = selectedPriceInput.replace(/#E1CNT#/g, priceInfoObj.E1Cnt);
            selectedPriceInput = selectedPriceInput.replace(/#E2CNT#/g, priceInfoObj.E2Cnt);
            selectedPriceInput = selectedPriceInput.replace(/#E3CNT#/g, priceInfoObj.E3Cnt);

            $("#divCoInfoContainer").append(selectedPriceInput);
        }
    });

    if ($("#divCoInfoContainer").children().length == 0) {
        $("#hrCoInfo").hide();
    } else {
        $("#hrCoInfo").show();
    }
}

function setDiscountCheckActivate(isInit) {
    let targetReservationData;

    if ($("#isTicket").val() === "true") {
        targetReservationData = TICKETPASS_RESERVATION_DATA;
    } else {
        targetReservationData = RESERVATION_DATA;
    }
    
    let couponArray = JSON.parse($("#hidCouponData").val());
    let discountCouponUseCountArray = JSON.parse($("#hidCouponUseData").val());

    let activateItems = [];
    let discountCouponDetailArray = JSON.parse($("#hidCouponDetailData").val());

    $("#rdoDiscountCoupon0").prop("checked", true);
    $(".chooseWhenChangingAmount").show();

    for (let i = 0; i < discountCouponDetailArray.length; i++) {
        let discountCouponDetail = discountCouponDetailArray[i];
        $("#rdoDiscountCoupon" + discountCouponDetail.Seq).prop("checked", false);
        $("#trDiscountItem" + discountCouponDetail.Seq).data("discountPrice", 0);
        $("#trDiscountItem" + discountCouponDetail.Seq).data("active", "N");
        $("#rdoDiscountCoupon" + discountCouponDetail.Seq).prop("disabled", true);
        $("#rdoDiscountCoupon" + discountCouponDetail.Seq).hide();
        $("#trDiscountItem" + discountCouponDetail.Seq).prop("style", "cursor: default");
    }

    for (let i = 0; i < discountCouponDetailArray.length; i++) {
        let discountCouponDetail = discountCouponDetailArray[i];

        let couponData = couponArray.filter(x => x.CouponCd === discountCouponDetail.CouponCd);
        let discountCouponUseData = discountCouponUseCountArray.filter(x => x.CouponCd === discountCouponDetail.CouponCd);

        let discountPrice = 0;

        if (discountCouponDetail.CouponCondCcd == "ACCPAYGB01") {
            discountPrice = discountCouponDetail.DiscountCouponPrice;
        } else {
            discountPrice = Math.ceil(targetReservationData.payment.totalPayment * discountCouponDetail.DiscountCouponPercent * 0.01);
        }
        if (discountCouponDetail.MaxDiscountPrice > 0 && discountPrice > discountCouponDetail.MaxDiscountPrice) {
            discountPrice = discountCouponDetail.MaxDiscountPrice;
        }

        if (discountCouponDetail.ApplyStartPrice <= targetReservationData.payment.totalPaymentNotDiscount &&
            targetReservationData.payment.totalPaymentNotDiscount <= discountCouponDetail.ApplyEndPrice) {

            if (targetReservationData.payment.totalPaymentNotDiscount > discountCouponDetail.DiscountCouponPrice) {
                if (couponData[0].UnlimitedYn === "Y") {
                    let activateItem = { seq: 0, couponCd: "", discountPrice: 0, applyGradeCcd: '', priority: 0 };

                    activateItem.seq = discountCouponDetail.Seq;
                    activateItem.couponCd = discountCouponDetail.CouponCd;
                    activateItem.discountPrice = discountPrice;
                    activateItem.applyGradeCcd = discountCouponDetail.ApplyGradeCcd;
                    activateItem.priority = 0;

                    activateItems.push(activateItem);

                    $("#trDiscountItem" + discountCouponDetail.Seq).data("discountPrice", discountPrice);
                    $("#trDiscountItem" + discountCouponDetail.Seq).data("active", "Y");
                    $("#rdoDiscountCoupon" + discountCouponDetail.Seq).prop("disabled", false);
                    $("#rdoDiscountCoupon" + discountCouponDetail.Seq).show();
                    $("#trDiscountItem" + discountCouponDetail.Seq).prop("style", "cursor: pointer");

                    $("#chooseWhenChangingAmount_" + discountCouponDetail.CouponCd + "_" + discountCouponDetail.Seq).hide();
                } else {
                    let useAmount = 0;
                    let budGetAmount = couponData[0].BudGetAmount;
                    if (discountCouponUseData[0] != undefined) {
                        useAmount = discountCouponUseData[0].UseAmount;
                    }
                    else {
                        useAmount = 0;
                    }
                    if ((useAmount + discountPrice) < budGetAmount) {
                        let activateItem = { seq: 0, couponCd: "", discountPrice: 0, applyGradeCcd: '', priority: 0 };

                        activateItem.seq = discountCouponDetail.Seq;
                        activateItem.couponCd = discountCouponDetail.CouponCd;
                        activateItem.discountPrice = discountPrice;
                        activateItem.applyGradeCcd = discountCouponDetail.ApplyGradeCcd;
                        activateItem.priority = 0;

                        activateItems.push(activateItem);

                        $("#trDiscountItem" + discountCouponDetail.Seq).data("discountPrice", discountPrice);
                        $("#trDiscountItem" + discountCouponDetail.Seq).data("active", "Y");
                        $("#rdoDiscountCoupon" + discountCouponDetail.Seq).prop("disabled", false);
                        $("#rdoDiscountCoupon" + discountCouponDetail.Seq).show();
                        $("#trDiscountItem" + discountCouponDetail.Seq).prop("style", "cursor: pointer");

                        $("#chooseWhenChangingAmount_" + discountCouponDetail.CouponCd + "_" + discountCouponDetail.Seq).hide();
                    } else {
                        // 예산 초과된 쿠폰
                        // $("#chooseWhenChangingAmount_" + discountCouponDetail.CouponCd + "_" + discountCouponDetail.Seq).html("<span class='c_txt02' style='color:red;'>해당 쿠폰은 예산이 초과되어 사용할 수 없습니다.</span>");
                        $("#trDiscountItem" + discountCouponDetail.Seq).hide();
                    }
                }
            }
        }
    }

    if (activateItems.length > 0) {
        for (let i = 0; i < activateItems.length; i++) {
            switch (activateItems[i].applyGradeCcd) {
                case "NORMAL":
                    activateItems[i].priority = 1; break;
                case "BASIC":
                    activateItems[i].priority = 2; break;
                case "SMART":
                    activateItems[i].priority = 3; break;
                case "GOLD":
                    activateItems[i].priority = 4; break;
            }
        }

        let sortActivateItems = activateItems.sort(function (a, b) {
            return a.priority - b.priority;
        });

        activateItems = sortActivateItems;

        let discountCoupons = [];

        for (let i = 0; i < activateItems.length; i++) {
            let discountCoupon = { seq: 0, discountPrice: 0 };

            discountCoupon.seq = activateItems[i].seq;
            discountCoupon.discountPrice = activateItems[i].discountPrice;

            discountCoupons.push(discountCoupon);
        }

        let discountPrices = [];

        for (let i = 0; i < discountCoupons.length; i++) {
            discountPrices.push(discountCoupons[i].discountPrice);
        }

        let maxDiscountPrice = Math.max.apply(null, discountPrices);

        let targetSeq = 0;
        let targetCouponCd = "";

        for (let i = 0; i < activateItems.length; i++) {
            if (activateItems[i].discountPrice === maxDiscountPrice) {
                targetSeq = activateItems[i].seq;
                targetCouponCd = activateItems[i].couponCd;
                $("#rdoDiscountCoupon" + activateItems[i].seq).prop("checked", true);
                $("#chooseWhenChangingAmount_" + targetCouponCd + "_" + targetSeq).hide();
            }
        }

        CHECK_OPTION = true;
        SelectDiscountCoupon(targetCouponCd, targetSeq);

        //if (isInit === false) {
        //    CHECK_OPTION = true;
        //    SelectDiscountCoupon(targetCouponCd, targetSeq);
        //}
    } else {
        SelectDiscountCoupon("", 0);
    }
}

function initDiscountCoupon() {
    let discountCouponDetailArray = JSON.parse($("#hidCouponDetailData").val());
    if (discountCouponDetailArray.length > 0) {
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
                if (couponDetailArray[couponItemIndex].ApplyStartPrice <= RESERVATION_DATA.payment.totalPaymentNotDiscount && couponDetailArray[couponItemIndex].ApplyEndPrice >= RESERVATION_DATA.payment.totalPaymentNotDiscount) {
                    if (couponDetailArray[couponItemIndex].CouponCondCcd == "ACCPAYGB01") {
                        discountPrice = couponDetailArray[couponItemIndex].DiscountCouponPrice;
                    } else {
                        discountPrice = Math.ceil(RESERVATION_DATA.payment.totalPaymentNotDiscount * couponDetailArray[couponItemIndex].DiscountCouponPercent * 0.01);
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
            SelectDiscountCoupon("", "0");
        }
    } else {
        // $("#divListWrap").hide();
        // $("#divCouponButton").hide();
    }
}

function SelectDiscountCoupon(coupon, seq) {
    if ($("#isTicket").val() !== "true") {
        if (coupon == "") {
            RESERVATION_DATA.payment.discountPayment = 0;
            RESERVATION_DATA.calculatePayment();
            $("#sectionDiscountPopupArea01").html(RESERVATION_DATA.payment.totalPaymentNotDiscount.toNumberWithComma() + "원");
            $("#sectionDiscountPopupArea02").html("할인금액");
            $("#sectionDiscountPopupArea03").html("0원");
            $("#sectionDiscountPopupArea04").html(RESERVATION_DATA.payment.totalPaymentNotDiscount.toNumberWithComma() + "원");
            $("#divListWrap").hide();
            RESERVATION_DATA.discountCoupon.couponCd = "";
            RESERVATION_DATA.discountCoupon.detailSeq = 0;
            RESERVATION_DATA.discountCoupon.discountPrice = 0;
        } else {
            if (RESERVATION_DATA.discountCoupon.couponCd != coupon || CHECK_OPTION == true) {
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
                    discountPrice = Math.ceil(RESERVATION_DATA.payment.totalPaymentNotDiscount * discountCouponDetailData[0].DiscountCouponPercent * 0.01);
                }
                if (discountCouponDetailData[0].MaxDiscountPrice > 0 && discountPrice > discountCouponDetailData[0].MaxDiscountPrice) {
                    discountPrice = discountCouponDetailData[0].MaxDiscountPrice;
                }
                $("#sectionDiscountPopupArea01").html(RESERVATION_DATA.payment.totalPaymentNotDiscount.toNumberWithComma() + "원");
                $("#sectionDiscountPopupArea02").html(couponData[0].Name);
                $("#sectionDiscountPopupArea03").html((discountPrice * -1).toNumberWithComma() + "원");
                $("#sectionDiscountPopupArea04").html((RESERVATION_DATA.payment.totalPaymentNotDiscount - discountPrice).toNumberWithComma() + "원");
                $("#spanTotalDiscountTitle").html(couponData[0].Name);
                $("#spanTotalDiscountPrice").html((discountPrice * -1).toNumberWithComma() + "원");

                RESERVATION_DATA.payment.discountPayment = discountPrice;
                RESERVATION_DATA.calculatePayment();
                $("#sNowPayment").text(RESERVATION_DATA.payment.totalPaymentNotDiscount.toNumberWithComma() + "원");
                $("#divListWrap").show();
                RESERVATION_DATA.discountCoupon.couponCd = coupon;
                RESERVATION_DATA.discountCoupon.detailSeq = seq;
                RESERVATION_DATA.discountCoupon.discountPrice = discountPrice;
                CHECK_OPTION = false;
            }
        }
    } else {
        if (coupon == "") {
            TICKETPASS_RESERVATION_DATA.payment.discountPayment = 0;
            TICKETPASS_RESERVATION_DATA.calculatePayment();
            $("#sectionDiscountPopupArea01").html(TICKETPASS_RESERVATION_DATA.payment.totalPaymentNotDiscount.toNumberWithComma() + "원");
            $("#sectionDiscountPopupArea02").html("할인금액");
            $("#sectionDiscountPopupArea03").html("0원");
            $("#sectionDiscountPopupArea04").html(TICKETPASS_RESERVATION_DATA.payment.totalPaymentNotDiscount.toNumberWithComma() + "원");

            $("#divListWrap").hide();
            TICKETPASS_RESERVATION_DATA.discountCoupon.couponCd = "";
            TICKETPASS_RESERVATION_DATA.discountCoupon.detailSeq = 0;
            TICKETPASS_RESERVATION_DATA.discountCoupon.discountPrice = 0;

            sTotalPayment = TICKETPASS_RESERVATION_DATA.payment.totalPaymentNotDiscount;
            $("#sTotalPayment").text(TICKETPASS_RESERVATION_DATA.payment.totalPaymentNotDiscount.toNumberWithComma() + "원");
            $("#sTotalPaymentBtn").text(TICKETPASS_RESERVATION_DATA.payment.totalPayment.toNumberWithComma() + "원");
            $("#payBtn").text(TICKETPASS_RESERVATION_DATA.payment.totalPayment.toNumberWithComma() + "원");

            let accumulatePrice = (TICKETPASS_RESERVATION_DATA.payment.totalPaymentNotDiscount) * 0.01;
            let basicPontPrice = accumulatePrice;
            if (accumulatePrice > 100000) {
                basicPontPrice = 100000;
                basicPromotionAccPoint = 100000;
                $("#strBasicPromotionAccPoint").text("100,000 원");
            } else {
                basicPromotionAccPoint = accumulatePrice;
                $("#strBasicPromotionAccPoint").text(Math.ceil(accumulatePrice).toNumberWithComma() + " 원");
            }

            let normalPointPrice = 0;
            let cardPointPrice = 0;

            if (normalNPayAccLimit > 0) {
                if ((accumulatePrice * normalNPayAccPercent) > normalNPayAccLimit) {
                    normalPointPrice = normalNPayAccLimit;
                } else {
                    normalPointPrice = (accumulatePrice * normalNPayAccPercent);
                }
            } else {
                normalPointPrice = (accumulatePrice * normalNPayAccPercent);
            }

            if (cardNPayAccLimit > 0) {
                if ((accumulatePrice * cardNPayAccPercent) > cardNPayAccLimit) {
                    cardPointPrice = cardNPayAccLimit;
                } else {
                    cardPointPrice = (accumulatePrice * cardNPayAccPercent);
                }
            } else {
                cardPointPrice = (accumulatePrice * cardNPayAccPercent);
            }
            basicPromotionAccPoint = basicPontPrice;
            $("#strBasicPromotionAccPoint").text(Math.ceil(basicPontPrice).toNumberWithComma() + " 원");
            if (normalNPayAccPointTargetElementId !== "") {
                $("#" + normalNPayAccPointTargetElementId).text(Math.ceil(normalPointPrice).toNumberWithComma() + " 원");
            }
            if (cardNPayAccPointTargetElementId !== "") {
                $("#" + cardNPayAccPointTargetElementId).text(Math.ceil(cardPointPrice).toNumberWithComma() + " 원");
            }

            // $("#strDropdownTopNPayMaxPoint").text((basicPontPrice + normalPointPrice + cardPointPrice).toNumberWithComma() + " 원");
            $("#strDropdownTopNPayMaxPoint").text(Math.ceil(basicPontPrice + normalPointPrice + cardPointPrice).toNumberWithComma() + " 원");
            let strDropDownNPayMaxPoint = "";
            // strDropDownNPayMaxPoint += (basicPontPrice + normalPointPrice + cardPointPrice).toNumberWithComma() + " 원";
            strDropDownNPayMaxPoint += Math.ceil(basicPontPrice + normalPointPrice + cardPointPrice).toNumberWithComma() + " 원";
            strDropDownNPayMaxPoint += "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" fill=\"currentColor\" class=\"bi bi-chevron-down\" viewBox=\"0 0 16 16\">";
            strDropDownNPayMaxPoint += "    <path fill-rule=\"evenodd\" d=\"M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z\" />";
            strDropDownNPayMaxPoint += "</svg>";
            $("#strDropDownNPayMaxPoint").html(strDropDownNPayMaxPoint);
            // $("#strNPayMaxPoint").text((basicPontPrice + normalPointPrice + cardPointPrice).toNumberWithComma() + " 원");
            $("#strNPayMaxPoint").text(Math.ceil(basicPontPrice + normalPointPrice + cardPointPrice).toNumberWithComma() + " 원");
        } else {
            if (TICKETPASS_RESERVATION_DATA.discountCoupon.couponCd != coupon || CHECK_OPTION == true) {
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
                    discountPrice = Math.ceil(TICKETPASS_RESERVATION_DATA.payment.totalPaymentNotDiscount * discountCouponDetailData[0].DiscountCouponPercent * 0.01);
                }
                if (discountCouponDetailData[0].MaxDiscountPrice > 0 && discountPrice > discountCouponDetailData[0].MaxDiscountPrice) {
                    discountPrice = discountCouponDetailData[0].MaxDiscountPrice;
                }
                $("#sectionDiscountPopupArea01").html(TICKETPASS_RESERVATION_DATA.payment.totalPaymentNotDiscount.toNumberWithComma() + "원");
                $("#sectionDiscountPopupArea02").html(couponData[0].Name);
                $("#sectionDiscountPopupArea03").html((discountPrice * -1).toNumberWithComma() + "원");
                $("#sectionDiscountPopupArea04").html((TICKETPASS_RESERVATION_DATA.payment.totalPaymentNotDiscount - discountPrice).toNumberWithComma() + "원");

                $("#spanTotalDiscountTitle").html(couponData[0].Name);
                $("#spanTotalDiscountPrice").html((discountPrice * -1).toNumberWithComma() + "원");

                TICKETPASS_RESERVATION_DATA.payment.discountPayment = discountPrice;
                TICKETPASS_RESERVATION_DATA.calculatePayment();
                $("#sNowPayment").text(TICKETPASS_RESERVATION_DATA.payment.totalPaymentNotDiscount.toNumberWithComma() + "원");
                $("#divListWrap").show();
                TICKETPASS_RESERVATION_DATA.discountCoupon.couponCd = coupon;
                TICKETPASS_RESERVATION_DATA.discountCoupon.detailSeq = seq;
                TICKETPASS_RESERVATION_DATA.discountCoupon.discountPrice = discountPrice;

                sTotalPayment = TICKETPASS_RESERVATION_DATA.payment.totalPaymentNotDiscount - discountPrice;
                $("#sTotalPayment").text((TICKETPASS_RESERVATION_DATA.payment.totalPaymentNotDiscount - discountPrice).toNumberWithComma() + "원");
                $("#sTotalPaymentBtn").text(TICKETPASS_RESERVATION_DATA.payment.totalPayment.toNumberWithComma() + "원");
                $("#payBtn").text(TICKETPASS_RESERVATION_DATA.payment.totalPayment.toNumberWithComma() + "원");
                let accumulatePrice = (TICKETPASS_RESERVATION_DATA.payment.totalPaymentNotDiscount - discountPrice) * 0.01;
                let basicPontPrice = accumulatePrice;
                if (accumulatePrice > 100000) {
                    basicPontPrice = 100000;
                    basicPromotionAccPoint = 100000;
                    $("#strBasicPromotionAccPoint").text("100,000 원");
                } else {
                    basicPromotionAccPoint = accumulatePrice;
                    $("#strBasicPromotionAccPoint").text(Math.ceil(accumulatePrice).toNumberWithComma() + " 원");
                }
                let normalPointPrice = 0;
                let cardPointPrice = 0;
                if (normalNPayAccLimit > 0) {
                    if ((accumulatePrice * normalNPayAccPercent) > normalNPayAccLimit) {
                        normalPointPrice = normalNPayAccLimit;
                    } else {
                        normalPointPrice = (accumulatePrice * normalNPayAccPercent);
                    }
                } else {
                    normalPointPrice = (accumulatePrice * normalNPayAccPercent);
                }
                if (cardNPayAccLimit > 0) {
                    if ((accumulatePrice * cardNPayAccPercent) > cardNPayAccLimit) {
                        cardPointPrice = cardNPayAccLimit;
                    } else {
                        cardPointPrice = (accumulatePrice * cardNPayAccPercent);
                    }
                } else {
                    cardPointPrice = (accumulatePrice * cardNPayAccPercent);
                }
                basicPromotionAccPoint = basicPontPrice;
                $("#strBasicPromotionAccPoint").text(Math.ceil(basicPontPrice).toNumberWithComma() + " 원");
                if (normalNPayAccPointTargetElementId !== "") {
                    $("#" + normalNPayAccPointTargetElementId).text(Math.ceil(normalPointPrice).toNumberWithComma() + " 원");
                }
                if (cardNPayAccPointTargetElementId !== "") {
                    $("#" + cardNPayAccPointTargetElementId).text(Math.ceil(cardPointPrice).toNumberWithComma() + " 원");
                }

                // $("#strDropdownTopNPayMaxPoint").text((basicPontPrice + normalPointPrice + cardPointPrice).toNumberWithComma() + " 원");
                $("#strDropdownTopNPayMaxPoint").text((Math.ceil(basicPontPrice + normalPointPrice + cardPointPrice)).toNumberWithComma() + " 원");
                let strDropDownNPayMaxPoint = "";
                // strDropDownNPayMaxPoint += (basicPontPrice + normalPointPrice + cardPointPrice).toNumberWithComma() + " 원";
                strDropDownNPayMaxPoint += Math.ceil(basicPontPrice + normalPointPrice + cardPointPrice).toNumberWithComma() + " 원";
                strDropDownNPayMaxPoint += "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" fill=\"currentColor\" class=\"bi bi-chevron-down\" viewBox=\"0 0 16 16\">";
                strDropDownNPayMaxPoint += "    <path fill-rule=\"evenodd\" d=\"M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z\" />";
                strDropDownNPayMaxPoint += "</svg>";
                $("#strDropDownNPayMaxPoint").html(strDropDownNPayMaxPoint);
                // $("#strNPayMaxPoint").text((basicPontPrice + normalPointPrice + cardPointPrice).toNumberWithComma() + " 원");
                $("#strNPayMaxPoint").text(Math.ceil(basicPontPrice + normalPointPrice + cardPointPrice).toNumberWithComma() + " 원");
                CHECK_OPTION = false;
            }
        }
    }

    calcMaxAccPoint();
}

function calcTicketPassPromotionAmount() {
    let accPromotionAmount = 0;

    PROMOTION_DATA.forEach(function (promotion) {
        var promotionAmount = 0;

        if (promotion.NPayAccTypeCcd == "ACCPAYGB01") {
            promotionAmount = promotion.NPayAccAmountAdult * adCnt + promotion.NPayAccAmountChild * cdCnt + promotion.NPayAccAmountEtc1 * e1Cnt + promotion.NPayAccAmountEtc2 * e2Cnt + promotion.NPayAccAmountEtc3 * e3Cnt;
        } else if (promotion.NPayAccTypeCcd == "ACCPAYGB02") {
            promotionAmount = Math.ceil(TICKETPASS_RESERVATION_DATA.payment.totalPayment * promotion.NPayAccPercent * 0.01);
        }

        if (promotion.NPayAccLimit > 0) {
            promotionAmount = Math.min(promotion.NPayAccLimit, promotionAmount);
        }

        accPromotionAmount += promotionAmount;
    });

    return accPromotionAmount;
}

function calcMaxAccPoint() {
    maxAccPoint = 0;

    if (PROMOTION_DATA != null && PROMOTION_DATA != undefined && PROMOTION_DATA.length > 0) {
        PROMOTION_DATA.forEach(function (promotion) {
            let applyAccPrice = 0;
            let calcApplyAccPrice = (sTotalPayment * promotion.NPayAccPercent) * 0.01;    

            if (promotion.NPayAccLimit > 0) {
                if (promotion.NPayAccLimit < calcApplyAccPrice) {
                    applyAccPrice = promotion.NPayAccLimit;
                } else {
                    applyAccPrice = calcApplyAccPrice;
                }
            } else {
                applyAccPrice = calcApplyAccPrice;
            }

            maxAccPoint += applyAccPrice;
        });
    }

    maxAccPoint = maxAccPoint + basicPromotionAccPoint;

    $("#strDropdownTopNPayMaxPoint").text(Math.ceil(maxAccPoint).toNumberWithComma() + " 원");
    $("#strNPayMaxPoint").text(Math.ceil(maxAccPoint).toNumberWithComma() + " 원");
    // $("#strDropDownNPayMaxPoint").text(Math.ceil(maxAccPoint).toNumberWithComma() + " 원");

    let strDropDownNPayMaxPoint = "";
    strDropDownNPayMaxPoint += Math.ceil(maxAccPoint).toNumberWithComma() + " 원";
    strDropDownNPayMaxPoint += "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" fill=\"currentColor\" class=\"bi bi-chevron-down\" viewBox=\"0 0 16 16\">";
    strDropDownNPayMaxPoint += "    <path fill-rule=\"evenodd\" d=\"M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z\" />";
    strDropDownNPayMaxPoint += "</svg>";
    $("#strDropDownNPayMaxPoint").html(strDropDownNPayMaxPoint);
}

// 중복 사용 불가 특전 초기화
function initBenefitCoupon() {
    if ($("#ulBenefitList").children().length > 0) {
        let benefitCnt = 0;

        let targetReservationData;

        if ($("#isTicket").val() === "true") {
            targetReservationData = TICKETPASS_RESERVATION_DATA;
        } else {
            targetReservationData = RESERVATION_DATA;
        }

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
                if (couponData[0].PerksUseGubun === "P") {
                    let totalPeopleCnt = 0;

                    if ($("#isTicket").val() === "true") {
                        totalPeopleCnt = BENEFIT_SELECT_PERSON_COUNT;
                    } else {
                        totalPeopleCnt = targetReservationData.getPeopleCount("AD") + targetReservationData.getPeopleCount("CD") + targetReservationData.getPeopleCount("IN");
                    }

                    if (couponData[0].PerksApplyCnt <= totalPeopleCnt) {
                        $(item).data("view", "1");
                        $(item).show();
                        benefitCnt++;
                    } else {
                        $(item).data("view", "0");
                        $(item).hide();
                    }
                } else {
                    $(item).data("view", "1");
                    $(item).show();
                    benefitCnt++;
                }
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
                        benefitCnt++;
                    } else {
                        $(item).data("view", "0");
                        $(item).hide();
                    }
                } else {
                    let totalPeopleCnt = 0;

                    if ($("#isTicket").val() === "true") {
                        totalPeopleCnt = targetReservationData.getPeopleCount("AD") + targetReservationData.getPeopleCount("CD") + targetReservationData.getPeopleCount("IN") + targetReservationData.getPeopleCount("E2") + targetReservationData.getPeopleCount("E3");
                    } else {
                        totalPeopleCnt = targetReservationData.getPeopleCount("AD") + targetReservationData.getPeopleCount("CD") + targetReservationData.getPeopleCount("IN");
                    }

                    let checkCnt = parseInt(totalPeopleCnt / couponData[0].PerksApplyCnt);
                    if (checkCnt == 0 || (remainCnt - checkCnt) < 0) {
                        $(item).data("view", "0");
                        $(item).hide();
                    } else {
                        $(item).data("view", "1");
                        $(item).show();
                        benefitCnt++;
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

        perksCouponCnt = benefitCnt;

        if (benefitCnt == 0) {
            $("#benefitCouponDesc").hide();
        } else {
            $("#benefitCnt").text(benefitCnt);
            $("#benefitCouponDesc").show();
        }
        
    } else {
        $("#divBenefitWrap").hide();
        $("#benefitCouponDesc").hide();
    }
}

// 중복 사용 가능 특전 초기화
function initDuplicationBenefitCoupon() {
    if ($("#ulDuplicationBenefitList").children().length > 0) {
        let duplicationBenefitCnt = 0;

        let targetReservationData;

        if ($("#isTicket").val() === "true") {
            targetReservationData = TICKETPASS_RESERVATION_DATA;
        } else {
            targetReservationData = RESERVATION_DATA;
        }

        $("#ulDuplicationBenefitList li").each(function (index, item) {
            let couponArray = JSON.parse($("#hidCouponData").val());
            let couponData = couponArray.filter(function (e) {
                return e.CouponCd == $(item).data("couponCd");
            })
            let perkUseCountArray = JSON.parse($("#hidPerkUseData").val());
            let perkUseCountData = perkUseCountArray.filter(function (e) {
                return e.CouponCd == $(item).data("couponCd");
            })
            if (couponData[0].UnlimitedYn == "Y") {
                if (couponData[0].PerksUseGubun === "P") {
                    let totalPeopleCnt = 0;

                    if ($("#isTicket").val() === "true") {
                        totalPeopleCnt = BENEFIT_SELECT_PERSON_COUNT;
                    } else {
                        totalPeopleCnt = targetReservationData.getPeopleCount("AD") + targetReservationData.getPeopleCount("CD") + targetReservationData.getPeopleCount("IN");
                    }

                    if (couponData[0].PerksApplyCnt <= totalPeopleCnt) {
                        $(item).data("view", "1");
                        $(item).show();
                        duplicationBenefitCnt++;
                    } else {
                        $(item).data("view", "0");
                        $(item).hide();

                        if (alppyDuplicationBenefitCoupons.length > 0) {
                            let removeTargetSeqs = alppyDuplicationBenefitCoupons.filter(x => x.detailSeq.toString() == $(item).data("selectSeq"));

                            if (removeTargetSeqs != null && removeTargetSeqs != undefined && removeTargetSeqs.length > 0) {
                                let temps = alppyDuplicationBenefitCoupons.filter(x => x.detailSeq != removeTargetSeqs[0].detailSeq);

                                alppyDuplicationBenefitCoupons = temps;
                            }
                        }
                    }
                } else {
                    $(item).data("view", "1");
                    $(item).show();
                    duplicationBenefitCnt++;
                }
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
                        duplicationBenefitCnt++;
                    } else {
                        $(item).data("view", "0");
                        $(item).hide();

                        if (alppyDuplicationBenefitCoupons.length > 0) {
                            let removeTargetSeqs = alppyDuplicationBenefitCoupons.filter(x => x.detailSeq.toString() == $(item).data("selectSeq"));

                            if (removeTargetSeqs != null && removeTargetSeqs != undefined && removeTargetSeqs.length > 0) {
                                let temps = alppyDuplicationBenefitCoupons.filter(x => x.detailSeq != removeTargetSeqs[0].detailSeq);

                                alppyDuplicationBenefitCoupons = temps;
                            }
                        }
                    }
                } else {
                    let totalPeopleCnt = 0;

                    if ($("#isTicket").val() === "true") {
                        totalPeopleCnt = targetReservationData.getPeopleCount("AD") + targetReservationData.getPeopleCount("CD") + targetReservationData.getPeopleCount("IN") + targetReservationData.getPeopleCount("E2") + targetReservationData.getPeopleCount("E3");
                    } else {
                        totalPeopleCnt = targetReservationData.getPeopleCount("AD") + targetReservationData.getPeopleCount("CD") + targetReservationData.getPeopleCount("IN");
                    }

                    let checkCnt = parseInt(totalPeopleCnt / couponData[0].PerksApplyCnt);
                    if (checkCnt == 0 || (remainCnt - checkCnt) < 0) {
                        $(item).data("view", "0");
                        $(item).hide();
                        
                        if (alppyDuplicationBenefitCoupons.length > 0) {
                            let removeTargetSeqs = alppyDuplicationBenefitCoupons.filter(x => x.detailSeq.toString() == $(item).data("selectSeq"));

                            if (removeTargetSeqs != null && removeTargetSeqs != undefined && removeTargetSeqs.length > 0) {
                                let temps = alppyDuplicationBenefitCoupons.filter(x => x.detailSeq != removeTargetSeqs[0].detailSeq);

                                alppyDuplicationBenefitCoupons = temps;
                            }
                        }
                    } else {
                        $(item).data("view", "1");
                        $(item).show();

                        $("#duplicationBenefitCouponDesc").show();

                        duplicationBenefitCnt++;
                    }
                }
            }
        });

        $("#ulDuplicationBenefitList li").each(function (index, item) {
            if ($(item).data("view") == "1") {
                const seq = $(item).data("select-seq");
                const couponCd = $(item).data("coupon-cd");

                let obj = { couponCd: "", detailSeq: 0, useCount: 0 };

                obj.couponCd = couponCd;
                obj.detailSeq = seq;
                obj.useCount = 0;

                // 기존에 추가된 중복 특전이 아니면 체크
                let filters = alppyDuplicationBenefitCoupons.filter(x => x.detailSeq.toString() == $(item).data("selectseq"));

                if (filters.length == 0) {
                    $(item).children().first().click();
                    $(item).addClass("on");
                }
            }
        });

        duplicationPerksCouponCnt = duplicationBenefitCnt;

        if (duplicationBenefitCnt == 0) {
            $("#duplicationBenefitCouponDesc").hide();
        } else {
            $("#duplicationBenefitCnt").text(duplicationBenefitCnt);
        }
    } else {
        $("#divDuplicationBenefitWrap").hide();
        $("#duplicationBenefitCouponDesc").hide();
    }   

    $("#ulDuplicationBenefitList li").each(function (index, item) {
        if ($(item).data("view") == "1") {
            if (!$(item).children().first().is(":checked")) {

                let filters = alppyDuplicationBenefitCoupons.filter(x => x.detailSeq.toString() == $(item).data("selectseq"));

                if (filters == 0) {
                    $(item).children().first().click();
                }
            }
        }
    });
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
    $("#sectionPerkPopupArea03").html("");
    $("#sectionPerkPopupArea04").html("");
    $("#sectionPerkPopupArea05").html("");
    $("#sectionPerkPopupArea06_NORMAL").hide();
    $("#sectionPerkPopupArea06_BASIC").hide();
    $("#sectionPerkPopupArea06_SMART").hide();
    $("#sectionPerkPopupArea06_GOLD").hide();
    $("#sectionPerkPopupArea09").html("");

    // 데이터 설정
    $("#sectionPerkPopupArea01").html(perkDetailData[0].PerksDesc);
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
    $("#sectionPerkPopupArea09").html(perkDetailData[0].UseCond);
    $("#sectionPerkPopup").addClass("visible");
}

function DuplicationPerkPopupShow(coupon, seq) {
    let couponArray = JSON.parse($("#hidCouponData").val());
    let couponData = couponArray.filter(function (e) {
        return e.CouponCd == coupon;
    })
    let perkDetailArray = JSON.parse($("#hidDuplicationPerkDetailData").val());
    let perkDetailData = perkDetailArray.filter(function (e) {
        return e.Seq == seq;
    });
    let perkUseCountArray = JSON.parse($("#hidPerkUseData").val());
    let perkUseCountData = perkUseCountArray.filter(function (e) {
        return e.CouponCd == coupon;
    })
    // 데이터 초기화
    $("#sectionPerkPopupArea01").html("");
    $("#sectionPerkPopupArea03").html("");
    $("#sectionPerkPopupArea04").html("");
    $("#sectionPerkPopupArea05").html("");
    $("#sectionPerkPopupArea06_NORMAL").hide();
    $("#sectionPerkPopupArea06_BASIC").hide();
    $("#sectionPerkPopupArea06_SMART").hide();
    $("#sectionPerkPopupArea06_GOLD").hide();
    $("#sectionPerkPopupArea09").html("");

    // 데이터 설정
    $("#sectionPerkPopupArea01").html(perkDetailData[0].PerksDesc);
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
    $("#sectionPerkPopupArea09").html(perkDetailData[0].UseCond);
    $("#sectionPerkPopup").addClass("visible");
}

function SelectPerkCoupon(coupon, seq) {
    if ($("#isTicket").val() === "true") {
        let useCount = 0;
        let couponArray = JSON.parse($("#hidCouponData").val());
        let couponData = couponArray.filter(function (e) {
            return e.CouponCd == coupon;
        })
        if (couponData[0].PerksUseGubun == "R") {
            useCount = 1;
        } else {
            let totalPeopleCnt = TICKETPASS_RESERVATION_DATA.getPeopleCount("AD") + TICKETPASS_RESERVATION_DATA.getPeopleCount("CD") + TICKETPASS_RESERVATION_DATA.getPeopleCount("IN") + TICKETPASS_RESERVATION_DATA.getPeopleCount("E2") + TICKETPASS_RESERVATION_DATA.getPeopleCount("E3");
            useCount = parseInt(totalPeopleCnt / couponData[0].PerksApplyCnt);
        }
        TICKETPASS_RESERVATION_DATA.perkCoupon.couponCd = coupon;
        TICKETPASS_RESERVATION_DATA.perkCoupon.useCount = useCount;
        TICKETPASS_RESERVATION_DATA.perkCoupon.detailSeq = seq;
    } else {
        let useCount = 0;
        let couponArray = JSON.parse($("#hidCouponData").val());
        let couponData = couponArray.filter(function (e) {
            return e.CouponCd == coupon;
        })
        if (couponData[0].PerksUseGubun == "R") {
            useCount = 1;
        } else {
            let totalPeopleCnt = RESERVATION_DATA.getPeopleCount("AD") + RESERVATION_DATA.getPeopleCount("CD") + RESERVATION_DATA.getPeopleCount("IN");
            useCount = parseInt(totalPeopleCnt / couponData[0].PerksApplyCnt);
        }
        RESERVATION_DATA.perkCoupon.couponCd = coupon;
        RESERVATION_DATA.perkCoupon.useCount = useCount;
        RESERVATION_DATA.perkCoupon.detailSeq = seq;
    }
}

//function SelectPerkCoupon(coupon, seq) {
//    if ($("#isTicket").val() === "true") {
//        if (TICKETPASS_RESERVATION_DATA.perkCoupon.couponCd != coupon) {
//            let useCount = 0;
//            let couponArray = JSON.parse($("#hidCouponData").val());
//            let couponData = couponArray.filter(function (e) {
//                return e.CouponCd == coupon;
//            })
//            if (couponData[0].PerksUseGubun == "R") {
//                useCount = 1;
//            } else {
//                let totalPeopleCnt = TICKETPASS_RESERVATION_DATA.getPeopleCount("AD") + TICKETPASS_RESERVATION_DATA.getPeopleCount("CD") + TICKETPASS_RESERVATION_DATA.getPeopleCount("IN");
//                useCount = parseInt(totalPeopleCnt / couponData[0].PerksApplyCnt);
//            }
//            TICKETPASS_RESERVATION_DATA.perkCoupon.couponCd = coupon;
//            TICKETPASS_RESERVATION_DATA.perkCoupon.useCount = useCount;
//            TICKETPASS_RESERVATION_DATA.perkCoupon.detailSeq = seq;
//        }
//    } else {
//        if (RESERVATION_DATA.perkCoupon.couponCd != coupon) {
//            let useCount = 0;
//            let couponArray = JSON.parse($("#hidCouponData").val());
//            let couponData = couponArray.filter(function (e) {
//                return e.CouponCd == coupon;
//            })
//            if (couponData[0].PerksUseGubun == "R") {
//                useCount = 1;
//            } else {
//                let totalPeopleCnt = RESERVATION_DATA.getPeopleCount("AD") + RESERVATION_DATA.getPeopleCount("CD") + RESERVATION_DATA.getPeopleCount("IN");
//                useCount = parseInt(totalPeopleCnt / couponData[0].PerksApplyCnt);
//            }
//            RESERVATION_DATA.perkCoupon.couponCd = coupon;
//            RESERVATION_DATA.perkCoupon.useCount = useCount;
//            RESERVATION_DATA.perkCoupon.detailSeq = seq;
//        }
//    }
//}

function SelectDuplicationPerkCoupon() {
    if (alppyDuplicationBenefitCoupons.length > 0) {
        let reservationData;

        if ($("#isTicket").val() === "true") {
            reservationData = TICKETPASS_RESERVATION_DATA;
        } else {
            reservationData = RESERVATION_DATA;
        }

        let couponArray = JSON.parse($("#hidCouponData").val());

        for (let i = 0; i < couponArray.length; i++) {
            for (let j = 0; j < alppyDuplicationBenefitCoupons.length; j++) {
                if (couponArray[i].CouponCd == alppyDuplicationBenefitCoupons[j].couponCd) {
                    if (couponArray[i].PerksUseGubun == "R") {
                        alppyDuplicationBenefitCoupons[j].useCount = 1;
                    } else {
                        let useCount = 0;

                        // let totalPeopleCnt = reservationData.getPeopleCount("AD") + reservationData.getPeopleCount("CD") + reservationData.getPeopleCount("IN");

                        let totalPeopleCnt = 0;

                        if ($("#isTicket").val() === "true") {
                            totalPeopleCnt = reservationData.getPeopleCount("AD") + reservationData.getPeopleCount("CD") + reservationData.getPeopleCount("IN") + + reservationData.getPeopleCount("E2") + + reservationData.getPeopleCount("E3");
                        } else {
                            totalPeopleCnt = reservationData.getPeopleCount("AD") + reservationData.getPeopleCount("CD") + reservationData.getPeopleCount("IN");
                        }


                        useCount = parseInt(totalPeopleCnt / couponArray[i].PerksApplyCnt);

                        alppyDuplicationBenefitCoupons[j].useCount = useCount;
                    }
                }
            }
        }
    }

    return true;
}

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
    if ($("#isTicket").val() !== "true") {
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
    } else {
        var $adContainer;

        if (TICKETPASS_RESERVATION_DATA.master.adultCnt > 0) {
            $adContainer = $("[id^=divCoInputContainer][id$=AD]").children(".clsCoContainer").eq(0);
        } else {
            $adContainer = $("[id^=divCoInputContainer][id$=CD]").children(".clsCoContainer").eq(0);
        }

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
    }
});

$(document).on("click", ".clsBtnDelSelectedOptionalOption", function () {
    var $container = $(this).parents(".clsSelectedOptionalOption");
    $container.remove();
    $(".clsOptionalOption").removeClass("act");

    if ($(".clsSelectedOptionalOption").length == 0) {
        $("#divSelectedOption").html('<div class="no_list">선택하신 추가경비가 없습니다.</div>');
    }

    RESERVATION_DATA.removeOption($container.data("optionSeq"));
    CHECK_OPTION = true;
    setDiscountCouponSort();
    SelectDiscountCoupon(RESERVATION_DATA.discountCoupon.couponCd, RESERVATION_DATA.discountCoupon.detailSeq);
});

$(document).on("click", ".clsBtnCalcOption", function () {
    var $this = $(this);
    var calc = $this.data("calc");
    var optionSeq = $this.parents(".clsSelectedOptionalOption").data("optionSeq");
    var unitprice = Number($(this).parents('.det').find('.price').data('option-unitprice').replace(/,/g, ''))

    if ($this.hasClass("minus_none")) {
        return;
    }

    var option = RESERVATION_DATA.getOption(optionSeq);

    var cnt = option.count;
    if (calc == "minus") {
        cnt = Math.max(1, cnt - 1);
        if (cnt == 1) {
            $this.addClass("minus_none")
        }
    } else if (calc == "plus") {
        cnt++;
        if ($this.siblings(".clsBtnCalcOption[data-calc=minus]").hasClass("minus_none")) {
            $this.siblings(".clsBtnCalcOption[data-calc=minus]").removeClass("minus_none");
        }
    }

    option.count = cnt;

    //옵션 + - 가격변경
    $(this).parents('.det').find('.price').text((unitprice * cnt).toNumberWithComma());

    RESERVATION_DATA.setOption(option);
    $this.siblings(".clsOptionCount").text(cnt);
    CHECK_OPTION = true;
    SelectDiscountCoupon(RESERVATION_DATA.discountCoupon.couponCd, RESERVATION_DATA.discountCoupon.detailSeq);
    setDiscountCouponSort();
});

$(document).on("click", "#info_icon", function (e) {
    e.preventDefault();
    $('#info_modal').modal("show");
});

// FUNCTION
function funcInit() {
    //popupCheck();

    RESERVATION_DATA = new ReservationData();

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

    // promotionData init
    if ($("#taPromotionData").length > 0) {
        PROMOTION_DATA = JSON.parse(funcDecodeUriHiddenInfo($("#taPromotionData").text()));
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

        // 추가경비
        for (var i = 0; i < resData.Options.length; i++) {
            var option = resData.Options[i];

            $(".clsOptionalOption").each(function () {
                if ($(this).data("optionSeq") == option.OptionSeq) {
                    funcDisplaySelectedOption(this);
                }
            });
        }

        // 요청사항
        $("#taAsk").val(resData.Ask);


        // 인원, 개수 설정
        var resPrice = resData.CountInfos[0];

        for (var i = 0; i < resPrice.ADCnt; i++) {
            $(".clsCalcBtn[data-calc=plus][data-type=AD]").click();
        }
        for (var i = 0; i < resPrice.CDCnt; i++) {
            $(".clsCalcBtn[data-calc=plus][data-type=CD]").click();
        }
        for (var i = 0; i < resPrice.E1Cnt; i++) {
            $(".clsCalcBtn[data-calc=plus][data-type=IN]").click();
        }

        for (var i = 0; i < resData.Options.length; i++) {
            var option = resData.Options[i];

            $(".clsSelectedOptionalOption").each(function () {
                if ($(this).data("optionSeq") == option.OptionSeq) {
                    for (var j = 1; j < option.Count; j++) {
                        $(this).find(".clsBtnCalcOption[data-calc=plus]").click();
                    }
                }
            });
        }

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


    let couponArray = JSON.parse($("#hidCouponData").val());
    if (couponArray.length == 0) {
        $("#sectionCoupon").hide();
    } else {
        $("#sectionCoupon").show();
    }
    $("#spanTotalDiscountTitle").html("");
    $("#spanTotalDiscountPrice").html("");
}

function funcDisplayPayment() {
    var nowHtml = '';
    if (RESERVATION_DATA.master.adultCnt > 0 || RESERVATION_DATA.master.childCnt > 0 || RESERVATION_DATA.master.infantCnt > 0) {
        nowHtml += '<li><p>기본</p><span>총 ' + (RESERVATION_DATA.master.adultCnt + RESERVATION_DATA.master.childCnt + RESERVATION_DATA.master.infantCnt) + ' 명 (성인 ' + RESERVATION_DATA.master.adultCnt + ' / 소아 ' + RESERVATION_DATA.master.childCnt + ' / 유아 ' + RESERVATION_DATA.master.infantCnt + ')</span><span class="sm_txt color-grey">' + RESERVATION_DATA.payment.nowMasterPayment.toNumberWithComma() + '원</span></li>';
        RESERVATION_DATA.options.forEach(function (option) {
            nowHtml += '<li><p>추가경비</p><span>' + option.name + '</span><span>' + (option.price * option.count).toNumberWithComma() + ' 원</span></li>';
        });
        $("#ulSelectedPrice2").show();
    } else {
        $("#ulSelectedPrice2").hide();
    }
    $("#ulSelectedPrice2").html(nowHtml);

    $("#pResCnt").text("( 성인" + RESERVATION_DATA.master.adultCnt + " / " + "소아 " + RESERVATION_DATA.master.childCnt + " / " + "유아 " + RESERVATION_DATA.master.infantCnt + " )");
    $("#sNowPayment").text(RESERVATION_DATA.payment.totalPayment.toNumberWithComma() + "원");

    var adCnt = RESERVATION_DATA.master.adultCnt;
    var cdCnt = RESERVATION_DATA.master.childCnt;
    var e1Cnt = RESERVATION_DATA.master.infantCnt;

    var accPromotionAmount = 0;
    if (RESERVATION_DATA.payment.nowPayment > 0) {
        var basicPromotionAmount = Math.ceil(Math.min(100000, (RESERVATION_DATA.payment.totalPayment * 0.01)));
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
                    // promotionAmount = promotion.NPayAccAmountAdult * adCnt + promotion.NPayAccAmountChild * cdCnt + promotion.NPayAccAmountEtc1 * e1Cnt + promotion.NPayAccAmountEtc2 * e2Cnt + promotion.NPayAccAmountEtc3 * e3Cnt;
                    promotionAmount = promotion.NPayAccAmountAdult * adCnt + promotion.NPayAccAmountChild * cdCnt + promotion.NPayAccAmountEtc1 * e1Cnt;
                } else if (promotion.NPayAccTypeCcd == "ACCPAYGB02") {
                    promotionAmount = Math.ceil(RESERVATION_DATA.payment.totalPayment * promotion.NPayAccPercent * 0.01);
                }

                if (promotion.NPayAccLimit > 0) {
                    promotionAmount = Math.min(promotion.NPayAccLimit, promotionAmount);
                }

                $("#str" + promotion.PromotionCd).text(promotionAmount.toNumberWithComma() + " 원");
                // $("#strAccPoint" + promotion.PromotionCd).text(promotionAmount.toNumberWithComma() + " 원");
                $("#strAccPoint" + promotion.PromotionCd).text(Math.ceil(promotionAmount).toNumberWithComma() + " 원");
                accPromotionAmount += promotionAmount;

                if (promotion.PromotionTypeCcd == "PROMOTYPE01") {
                    sumAccPercent += promotion.NPayAccPercent;
                }

                if (promotion.NPayAccLimit > 0) {
                    if (promotion.PromotionTypeCcd == "PROMOTYPE01") {
                        $("#normalAccLimit").text(promotion.NPayAccLimit.toNumberWithComma());
                    }
                }
            });
            $(".clsPromotion").show();
        }

        sTotalPayment = RESERVATION_DATA.payment.totalPayment;
        $("#sTotalPayment").text(RESERVATION_DATA.payment.totalPayment.toNumberWithComma() + "원");
        $("#strPaymentPc").text(RESERVATION_DATA.payment.nowPayment.toNumberWithComma() + "원");

        //결제버튼영역
        $("#sTotalPaymentBtn").text(RESERVATION_DATA.payment.totalPayment.toNumberWithComma() + "원");
        $("#pResCntBtn").text("( 성인" + RESERVATION_DATA.master.adultCnt + " / " + "소아 " + RESERVATION_DATA.master.childCnt + " / " + "유아 " + RESERVATION_DATA.master.infantCnt + " )");

        if (RESERVATION_DATA.payment.totalPaymentNotDiscount != RESERVATION_DATA.payment.nowPayment) {
            var FullpayYnBtn = "예약금";
            $("#payBtn").text(RESERVATION_DATA.payment.nowPayment.toNumberWithComma() + "원");
        } else {
            var FullpayYnBtn = "결제금액";
            $("#payBtn").text(RESERVATION_DATA.payment.totalPayment.toNumberWithComma() + "원");
        }
        $("#fullPayYn").text(FullpayYnBtn);

        // 일발적립 금액 계산
        var normalPromotionPrice = Math.ceil(RESERVATION_DATA.payment.totalPayment * sumAccPercent * 0.01);

        // 카드사적립 금액 계산
        var cardPromotionPrice = Math.ceil(RESERVATION_DATA.payment.totalPayment * Math.max(...npayAccPercentArr) * 0.01);

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

        // $("#strNPayMaxPoint").text((basicPromotionAmount + normalPromotionPrice + cardPromotionPrice).toNumberWithComma() + " 원");
        $("#strNPayMaxPoint").text(Math.ceil(basicPromotionAmount + normalPromotionPrice + cardPromotionPrice).toNumberWithComma() + " 원");
        $("#strDropdownTopNPayMaxPoint").text(Math.ceil(basicPromotionAmount + normalPromotionPrice + cardPromotionPrice).toNumberWithComma() + " 원");

        var dropdownTopTemplateTemp = dropdownTopTemplate;
        dropdownTopTemplateTemp = dropdownTopTemplateTemp.replace(/#MAX_ACCPERCENT#/g, (Math.max(...npayAccPercentArr) + (sumAccPercent + 1)));
        dropdownTopTemplateTemp = dropdownTopTemplateTemp.replace(/#MAX_NPAY_POINT#/g, (basicPromotionAmount + normalPromotionPrice + cardPromotionPrice).toNumberWithComma() + " 원");

        $("#aDropdownTop").html(dropdownTopTemplateTemp);

        $("#pBalancePaymentPc").text("( 남은 결제금액: " + (RESERVATION_DATA.payment.totalPayment - RESERVATION_DATA.payment.nowPayment).toNumberWithComma() + " 원 )");

        $("#strBasicPromotion").text(basicPromotionAmount.toNumberWithComma() + " 원");
        basicPromotionAccPoint = basicPromotionAmount;
        $("#strBasicPromotionAccPoint").text(Math.ceil(basicPromotionAmount).toNumberWithComma() + " 원");
        $("#spnBasicPromotion").text("※ 출발일(" + $("#hidDepartureDay").data("month") + "/" + $("#hidDepartureDay").data("day") + ") 이후 1영업일에 적립");
        $("#pBasicPromotion").text("적립 예정일: 출발일(" + $("#hidDepartureDay").data("month") + "/" + $("#hidDepartureDay").data("day") + ") 이후 1영업일에 적립");

        $("#strTotalPaymentPrice").text(RESERVATION_DATA.payment.totalPayment.toNumberWithComma() + " 원");
        $("#strNPayPrice").text(Math.max(0, (RESERVATION_DATA.payment.totalPayment - (basicPromotionAmount + accPromotionAmount))).toNumberWithComma() + " 원");
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

        $("#strTotalPaymentPrice").empty();
        $("#strNPayPrice").empty();
        $("#divNPayPrice").hide();
    }

    RESERVATION_DATA.payment.promotionAmount = accPromotionAmount;

    if (RESERVATION_DATA.payment.nowPayment > RESERVATION_DATA.payment.totalPayment) {
        if ($("#isTicket").val() != "true") {
            if ($("#pkgFullPaymentYn").val() != "Y") {
                $("#btnNPay").hide();
                $("#reservationNotPossibleBtn").show();
            } else {
                $("#reservationNotPossibleBtn").hide();
                $("#btnNPay").show();
            }
        } else {
            $("#reservationNotPossibleBtn").hide();
            $("#btnNPay").show();
        }
    }
    else {
        $("#reservationNotPossibleBtn").hide();
        $("#btnNPay").show();
    }
}

function funcDisplayResInput() {
    if (RESERVATION_DATA.master.adultCnt > 0 || RESERVATION_DATA.master.childCnt > 0 || RESERVATION_DATA.master.infantCnt > 0) {
        // 일행 정보
        var coInputTemplate = funcDecodeUriHiddenInfo($("#hidCoInputTemplate").val());

        var selectedPriceInput = "";
        selectedPriceInput += selectedPriceInputTemplate;

        if (RESERVATION_DATA.master.adultCnt > 0 || RESERVATION_DATA.master.childCnt > 0 || RESERVATION_DATA.master.infantCnt > 0) {
            $("#divCoInfoMarkContainer").empty().append(coInputMarkTemplate);
        }

        var priceCd = $("#hidPriceCd").val();

        if (RESERVATION_DATA.master.adultCnt > 0) {

            // 성인 + - 성인가격 변경
            $("#divAdultPrice").text(($("#divAdultPrice").attr('data-total-payment-price') * RESERVATION_DATA.master.adultCnt).toNumberWithComma());

            selectedPriceInput = selectedPriceInput.replace(/#AD_INFO#/g, adInfoTemplate);

            var adCoInputTotal = "";
            for (var adLoop = 1; adLoop <= RESERVATION_DATA.master.adultCnt; adLoop++) {
                var adCoInput = coInputTemplate;
                adCoInput = adCoInput.replace(/#COLOOP#/g, adLoop);
                adCoInput = adCoInput.replace(/#PRICECD#/g, priceCd);
                adCoInput = adCoInput.replace(/#PRICECD_REPLACE#/g, priceCd.replaceAll("|", "_"));
                adCoInput = adCoInput.replace(/#TYPE#/g, "AD");
                adCoInputTotal += adCoInput;
            }
            selectedPriceInput = selectedPriceInput.replace(/#COINPUTAD#/g, adCoInputTotal);
        } else {
            selectedPriceInput = selectedPriceInput.replace(/#AD_INFO#/g, "");
        }

        if (RESERVATION_DATA.master.childCnt > 0) {

            // 소아인원 + - 소아가격 변경
            $("#divChildPrice").text(($("#divChildPrice").attr('data-total-payment-price') * RESERVATION_DATA.master.childCnt).toNumberWithComma());

            selectedPriceInput = selectedPriceInput.replace(/#CD_INFO#/g, cdInfoTemplate);

            var cdCoInputTotal = "";
            for (var cdLoop = 1; cdLoop <= RESERVATION_DATA.master.childCnt; cdLoop++) {
                var cdCoInput = coInputTemplate;
                cdCoInput = cdCoInput.replace(/#COLOOP#/g, cdLoop);
                cdCoInput = cdCoInput.replace(/#PRICECD#/g, priceCd);
                cdCoInput = cdCoInput.replace(/#PRICECD_REPLACE#/g, priceCd.replaceAll("|", "_"));
                cdCoInput = cdCoInput.replace(/#TYPE#/g, "CD");
                cdCoInputTotal += cdCoInput;
            }
            selectedPriceInput = selectedPriceInput.replace(/#COINPUTCD#/g, cdCoInputTotal);
        } else {
            selectedPriceInput = selectedPriceInput.replace(/#CD_INFO#/g, "");
        }

        if (RESERVATION_DATA.master.infantCnt > 0) {

            // 유아 + - 유아가격 변경
            $("#divInfantPrice").text(($("#divInfantPrice").attr('data-total-payment-price') * RESERVATION_DATA.master.infantCnt).toNumberWithComma());

            selectedPriceInput = selectedPriceInput.replace(/#E1_INFO#/g, e1InfoTemplate);

            var e1CoInputTotal = "";
            for (var e1Loop = 1; e1Loop <= RESERVATION_DATA.master.infantCnt; e1Loop++) {
                var cdCoInput = coInputTemplate;
                cdCoInput = cdCoInput.replace(/#COLOOP#/g, e1Loop);
                cdCoInput = cdCoInput.replace(/#PRICECD#/g, priceCd);
                cdCoInput = cdCoInput.replace(/#PRICECD_REPLACE#/g, priceCd.replaceAll("|", "_"));
                cdCoInput = cdCoInput.replace(/#TYPE#/g, "E1");
                e1CoInputTotal += cdCoInput;
            }
            selectedPriceInput = selectedPriceInput.replace(/#COINPUTE1#/g, e1CoInputTotal);
        } else {
            selectedPriceInput = selectedPriceInput.replace(/#E1_INFO#/g, "");
        }

        selectedPriceInput = selectedPriceInput.replace(/#PRODUCTLOOP#/g, 0);
        selectedPriceInput = selectedPriceInput.replace(/#PRICECD#/g, priceCd);
        selectedPriceInput = selectedPriceInput.replace(/#LOOP#/g, 0);
        selectedPriceInput = selectedPriceInput.replace(/#OPTIONCCDNM#/g, '옵션네임');
        selectedPriceInput = selectedPriceInput.replace(/#ADCNT#/g, RESERVATION_DATA.master.adultCnt);
        selectedPriceInput = selectedPriceInput.replace(/#CDCNT#/g, RESERVATION_DATA.master.childCnt);
        selectedPriceInput = selectedPriceInput.replace(/#E1CNT#/g, RESERVATION_DATA.master.infantCnt);

        $("#divCoInfoContainer").html(selectedPriceInput);
    }

    if ($("#divCoInfoContainer").children().length == 0) {
        $("#hrCoInfo").hide();
    } else {
        $("#hrCoInfo").show();
    }
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
    if ($("#isTicket").val() === "true") {
        let promotionAmount = calcTicketPassPromotionAmount();
        TICKETPASS_RESERVATION_DATA.payment.promotionAmount = promotionAmount;
        // 요금 정보
        var priceInfo = $("#hidPriceInfo").val();
        // 마스터
        var reservationMaster = JSON.stringify(TICKETPASS_RESERVATION_DATA.master);
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
        totalPriceInfoObj["TotalMasterPayment"] = TICKETPASS_RESERVATION_DATA.payment.totalMasterPayment;
        totalPriceInfoObj["TotalPaymentNotDiscount"] = TICKETPASS_RESERVATION_DATA.payment.totalPaymentNotDiscount;
        totalPriceInfoObj["DiscountPayment"] = TICKETPASS_RESERVATION_DATA.payment.discountPayment;
        totalPriceInfoObj["TotalPayment"] = TICKETPASS_RESERVATION_DATA.payment.totalPayment;
        totalPriceInfoObj["PromotionAmount"] = TICKETPASS_RESERVATION_DATA.payment.promotionAmount;
        var totalPriceInfo = JSON.stringify(totalPriceInfoObj);

        // 쿠폰
        var couponInfoObj = {};
        couponInfoObj["DiscountCouponCouponCd"] = TICKETPASS_RESERVATION_DATA.discountCoupon.couponCd;
        couponInfoObj["DiscountCouponDetailSeq"] = TICKETPASS_RESERVATION_DATA.discountCoupon.detailSeq;
        couponInfoObj["DiscountCouponDiscountPrice"] = TICKETPASS_RESERVATION_DATA.discountCoupon.discountPrice;
        couponInfoObj["PerkCouponCouponCd"] = TICKETPASS_RESERVATION_DATA.perkCoupon.couponCd;
        couponInfoObj["PerkCouponDetailSeq"] = TICKETPASS_RESERVATION_DATA.perkCoupon.detailSeq;
        couponInfoObj["PerkCouponUseCount"] = TICKETPASS_RESERVATION_DATA.perkCoupon.useCount;
        var couponInfo = JSON.stringify(couponInfoObj);

        // 추가 입력 정보
        let questionDatas = [];
        $(".clsTicketPassQuestion").each(function (_, input) {
            $this = $(input);

            let obj = { seq: 0, masterCd: "", organSeq: 0, question: "", answer: "" };

            obj.seq = $this.data("seq");
            obj.masterCd = $this.data("master-cd");
            obj.organSeq = $this.data("organ-seq");
            obj.question = $this.data("question");
            obj.answer = $this.val();

            questionDatas.push(obj);
        });
        var questionInfo = JSON.stringify(questionDatas);

        // 요청사항
        var ask = $("#taAsk").val().escapeXSS();
        // 임시예약번호
        var tempReservationId = $("#hidTempReservationId").val();
        // 결제 타입
        var paymentType = $("#hidPaymentType").val();
        // 등급
        var grade = $("#hidGrade").val();
        // 상품명
        var productNm = $("#hidProductNm").val().trim().escapeXSS();

        var reservationData = {
            isTicketPass: true,
            questionInfo: questionInfo,
            priceInfo: priceInfo,
            reservationMaster: reservationMaster,
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

        // 중복 선택 가능 특전
        if (alppyDuplicationBenefitCoupons.length > 0) {
            let duplicationBenefitCoupons = [];

            for (let i = 0; i < alppyDuplicationBenefitCoupons.length; i++) {
                let obj = { PerkCouponCouponCd: "", PerkCouponDetailSeq: 0, PerkCouponUseCount: 0 };

                obj.PerkCouponCouponCd = alppyDuplicationBenefitCoupons[i].couponCd;
                obj.PerkCouponDetailSeq = alppyDuplicationBenefitCoupons[i].detailSeq;
                obj.PerkCouponUseCount = alppyDuplicationBenefitCoupons[i].useCount;

                duplicationBenefitCoupons.push(obj);
            }

            reservationData["duplicationBenefitCouponsJson"] = JSON.stringify(duplicationBenefitCoupons);
        } else {
            reservationData["duplicationBenefitCouponsJson"] = "[]";
        }

        // 시간 선택 정보(있으면 추가)
        if (isTicketTimeSelect) {
            $("#divCoInfoContainer .clsCoInputContainer").each(function (index, item) {
                let obj = { priceCd: "", timeInfo: "" };

                let priceCd = $(item).data("price-cd");

                let selectTimeValue = $("#timeSelect_" + priceCd).val();

                obj.PriceCd = priceCd;
                obj.TimeInfo = selectTimeValue;

                TICKETPASS_RESERVATION_DATA.timeSelectInfos.push(obj);
            });
        }

        if (TICKETPASS_RESERVATION_DATA.timeSelectInfos.length == 0) {
            reservationData["ticketPassTimeSelectInfoJson"] = "[]";
        } else {
            reservationData["ticketPassTimeSelectInfoJson"] = JSON.stringify(TICKETPASS_RESERVATION_DATA.timeSelectInfos);
        }

        return reservationData;
    } else {
        // 요금 정보
        var reservationMaster = JSON.stringify(RESERVATION_DATA.master);

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

        if ($("#pkgFullPaymentYn").val() !== null && $("#pkgFullPaymentYn").val() !== "") {
            if ($("#pkgFullPaymentYn").val() === "Y") {
                totalPriceInfoObj["NowPayment"] = RESERVATION_DATA.payment.totalPayment;
            } else {
                totalPriceInfoObj["NowPayment"] = RESERVATION_DATA.payment.nowPayment;
            }
        } else {
            totalPriceInfoObj["NowPayment"] = 0;
        }
        
        totalPriceInfoObj["TotalPayment"] = RESERVATION_DATA.payment.totalPayment;
        totalPriceInfoObj["DiscountPayment"] = RESERVATION_DATA.payment.discountPayment;
        // totalPriceInfoObj["NowPayment"] = RESERVATION_DATA.payment.nowPayment;
        totalPriceInfoObj["TotalMasterPayment"] = RESERVATION_DATA.payment.totalMasterPayment;
        totalPriceInfoObj["NowMasterPayment"] = RESERVATION_DATA.payment.nowMasterPayment;
        totalPriceInfoObj["OptionPayment"] = RESERVATION_DATA.payment.optionPayment;
        totalPriceInfoObj["PromotionAmount"] = RESERVATION_DATA.payment.promotionAmount;
        var totalPriceInfo = JSON.stringify(totalPriceInfoObj);
        // 추가경비
        var optionArr = [];
        RESERVATION_DATA.options.forEach(function (option) {
            optionArr.push({
                optionSeq: option.seq,
                optionNm: option.name,
                price: option.price,
                count: option.count
            });
        });
        var optionInfo = JSON.stringify(optionArr);
        // 요청사항
        var ask = $("#taAsk").val().escapeXSS();
        // 임시예약번호
        var tempReservationId = $("#hidTempReservationId").val();
        // 결제 타입
        var paymentType = $("#hidPaymentType").val();
        // 등급
        var grade = $("#hidGrade").val();
        // 상품명
        var productNm = $("#hidProductNm").val().trim().escapeXSS();
        // 쿠폰
        var couponInfoObj = {};
        couponInfoObj["DiscountCouponCouponCd"] = RESERVATION_DATA.discountCoupon.couponCd;
        couponInfoObj["DiscountCouponDetailSeq"] = RESERVATION_DATA.discountCoupon.detailSeq;
        couponInfoObj["DiscountCouponDiscountPrice"] = RESERVATION_DATA.discountCoupon.discountPrice;
        couponInfoObj["PerkCouponCouponCd"] = RESERVATION_DATA.perkCoupon.couponCd;
        couponInfoObj["PerkCouponDetailSeq"] = RESERVATION_DATA.perkCoupon.detailSeq;
        couponInfoObj["PerkCouponUseCount"] = RESERVATION_DATA.perkCoupon.useCount;
        var couponInfo = JSON.stringify(couponInfoObj);
        var reservationData = {
            isTicketPass: false,
            reservationMaster: reservationMaster,
            resUserInfo: resUserInfo,
            coUserInfo: coUserInfo,
            totalPriceInfo: totalPriceInfo,
            couponInfo: couponInfo,
            optionInfo: optionInfo,
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

        // 중복 선택 가능 특전
        if (alppyDuplicationBenefitCoupons.length > 0) {
            let duplicationBenefitCoupons = [];

            for (let i = 0; i < alppyDuplicationBenefitCoupons.length; i++) {
                let obj = { PerkCouponCouponCd: "", PerkCouponDetailSeq: 0, PerkCouponUseCount: 0 };

                obj.PerkCouponCouponCd = alppyDuplicationBenefitCoupons[i].couponCd;
                obj.PerkCouponDetailSeq = alppyDuplicationBenefitCoupons[i].detailSeq;
                obj.PerkCouponUseCount = alppyDuplicationBenefitCoupons[i].useCount;

                duplicationBenefitCoupons.push(obj);
            }

            reservationData["duplicationBenefitCouponsJson"] = JSON.stringify(duplicationBenefitCoupons);
        } else {
            reservationData["duplicationBenefitCouponsJson"] = "[]";
        }

        return reservationData;
    }
}

// 예약 전처리
function funcResPreProcess() {
    funcShowReservationLoading();

    var reservationData = funcCreateReservationData();

    $.ajax({
        url: PATH_STATIC_AJAX + "AjaxReservationPreProcessOversea.aspx",
        data: reservationData,
        type: "POST",
        success: function (res) {
            alppyDuplicationBenefitCoupons = [];

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
            var returnUrl = SERVICE_URL + $("#hidOrganUrl").val() + "ReservationCompleteOversea.aspx?tempReservationId=" + res.TempReservationId + "&type=" + paymentType;
            if (paymentType == "NPAYPT01") { // 일반 결제
                var tr = $("#hidShoppingLiveTr").val();
                var trx = $("#hidShoppingLiveTrx").val();
                var merchantExtraParameter = tr + "|" + trx + "|" + res.ReservationId + "|" + res.TotalPayment;
                var npayDataObj = {
                    "merchantPayKey": "" + res.ReservationId + "",
                    "merchantUserKey": "" + res.BookerId + "",
                    "productName": "" + res.ProductName + "",
                    "productCount": res.TotalTraveler,
                    "totalPayAmount": res.NowPayment,
                    "taxScopeAmount": res.NowPayment,
                    "taxExScopeAmount": 0,
                    "returnUrl": returnUrl,
                    "useCfmYmdt": "" + res.ConfrimDate + "",
                    "productItems": [{
                        "categoryType": "TRAVEL",
                        "categoryId": "OVERSEA",
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
                    "totalPayAmount": res.NowPayment,
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
        url: PATH_STATIC_AJAX + "AjaxCalendarPriceOversea.aspx",
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

// 예약 정보 validation (패키지)
function funcReservationValidation() {
    if (RESERVATION_DATA.master.adultCnt < 1 && RESERVATION_DATA.master.childCnt < 1 && RESERVATION_DATA.master.infantCnt < 1) {
        funcGenerateCommonPopup("예약", "기본상품을 선택해 주십시오.", "PriceInfoError");
        return false;
    } else if (RESERVATION_DATA.master.adultCnt < 1 && (RESERVATION_DATA.master.childCnt > 0 || RESERVATION_DATA.master.infantCnt > 0)) {
        funcGenerateCommonPopup("예약", "소아 또는 유아 인원만 예약은 불가합니다.<br />다시 확인해주십시오.", "PriceInfoError");
        return false;
    } else if (RESERVATION_DATA.master.adultCnt < Number($("#hidMinResCnt").val())) {
        funcGenerateCommonPopup("예약", "성인 최소 예약인원은 " + Number($("#hidMinResCnt").val()) + " 명 입니다.<br />다시 확인해주십시오.", "PriceInfoError");
        return false;
    }

    var isVal = true;

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

// 예약 정보 validation (티켓/패스)
function funcTicketPassReservationValidation() {
    if (TICKETPASS_RESERVATION_DATA.payment.totalPayment === 0) {
        funcGenerateCommonPopup("예약", "예약할 상품을 선택해주시기 바랍니다.", "PriceInfoError");
        return false;
    }

    var isVal = true;

    //if (TICKETPASS_RESERVATION_DATA.master.adultCnt <= 0) {
    //    if (TICKETPASS_RESERVATION_DATA.master.childCnt <= 0) {
    //        funcGenerateCommonPopup("예약", "성인 혹은 아동을 1명 이상 선택해 주세요.", "PriceInfoError");
    //        isVal = false;
    //        return false;
    //    }
    //}

    if (TICKETPASS_RESERVATION_DATA.master.adultCnt <= 0) {
        if (TICKETPASS_RESERVATION_DATA.master.childCnt <= 0) {
            if (TICKETPASS_RESERVATION_DATA.master.e2Cnt <= 0) {
                if (TICKETPASS_RESERVATION_DATA.master.e3Cnt <= 0) {
                    funcGenerateCommonPopup("예약", "유아(24개월 미만)를 제외한 예약 인원을 1명 이상 선택해 주세요.", "PriceInfoError");
                    isVal = false;
                    return false;
                }
            }    
        }
    }
    

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

    // 추가 입력 사항
    $(".clsTicketPassQuestion").each(function (_, input) {
        $this = $(input);
        if ($this.val() === "" || $this.val().trim() === "") {
            funcGenerateFocusCommonPopup("예약", "추가 입력 사항을 입력해주시기 바랍니다.", $this.attr("id"));
            isVal = false;
            return false;
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

// 티켓/패스 예약 데이터
function TicketPassReservationData() {
    this.master = {
        masterCd: $("#hidMasterCd").val(),
        detailCd: $("#hidDetailCd").val(),
        agencyDetailCd: $("#hidAgencyDetailCd").val(),
        organSeq: $("#hidOrganSeq").val(),
        priceCd: $("#hidPriceCd").val(),
        rateKey: $("#hidRateKey").val(),
        adultCnt: 0,
        adultTotalPrice: 0,
        childCnt: 0,
        childTotalPrice: 0,
        infantCnt: 0,
        infantTotalPrice: 0,
        e2Cnt: 0,
        e2TotalPrice: 0,
        e3Cnt: 0,
        e3TotalPrice: 0
    };

    this.payment = {
        totalMasterPayment: 0,
        totalPayment: 0,
        totalPaymentNotDiscount: 0,
        discountPayment: 0,
        promotionAmount: 0
    };

    this.getPeopleCount = function (gubun) {
        switch (gubun) {
            case "AD":
                return this.master.adultCnt;
                break;
            case "CD":
                return this.master.childCnt;
                break;
            case "IN":
                return this.master.infantCnt;
                break;
            case "E2":
                return this.master.e2Cnt;
                break;
            case "E3":
                return this.master.e3Cnt;
                break;
            default:
        }
    }

    this.setPeopleCount = function (gubun, count) {
        switch (gubun) {
            case "AD":
                this.master.adultCnt = count;
                break;
            case "CD":
                this.master.childCnt = count;
                break;
            case "IN":
                this.master.infantCnt = count;
                break;
            case "E2":
                this.master.infantCnt = e2Cnt;
                break;
            case "E3":
                this.master.infantCnt = e3Cnt;
                break;
            default:
        }

        this.calculatePayment();
    }

    this.calculatePayment = function () {
        // this.payment.totalMasterPayment =  this.master.adultTotalPrice + this.master.childTotalPrice + this.master.infantTotalPrice;
        this.payment.totalMasterPayment = this.master.adultTotalPrice + this.master.childTotalPrice + this.master.infantTotalPrice + this.master.e2TotalPrice + this.master.e3TotalPrice;
        
        this.payment.totalPayment = this.payment.totalMasterPayment - this.payment.discountPayment;
        this.payment.totalPaymentNotDiscount = this.payment.totalMasterPayment;
    }

    this.discountCoupon = {
        couponCd: "",
        detailSeq: 0,
        discountPrice: 0
    };

    this.perkCoupon = {
        couponCd: "",
        detailSeq: 0,
        useCount: 0
    };

    this.timeSelectInfos = [];
}

function ReservationData() {
    this.master = {
        masterCd: $("#hidMasterCd").val(),
        detailCd: $("#hidDetailCd").val(),
        agencyDetailCd: $("#hidAgencyDetailCd").val(),
        organSeq: $("#hidOrganSeq").val(),
        priceCd: $("#hidPriceCd").val(),
        rateKey: $("#hidRateKey").val(),
        adultCnt: 0,
        adultTotalPrice: Number($("#divAdultPrice").data("totalPaymentPrice")),
        adultNowPrice: Number($("#divAdultPrice").data("nowPaymentPrice")),
        childCnt: 0,
        childTotalPrice: Number($("#divChildPrice").data("totalPaymentPrice")),
        childNowPrice: Number($("#divChildPrice").data("nowPaymentPrice")),
        infantCnt: 0,
        infantTotalPrice: Number($("#divInfantPrice").data("totalPaymentPrice")),
        infantNowPrice: Number($("#divInfantPrice").data("nowPaymentPrice"))
    };

    this.options = [];

    this.payment = {
        totalMasterPayment: 0,
        nowMasterPayment: 0,
        totalPayment: 0,
        totalPaymentNotDiscount: 0,
        discountPayment: 0,
        nowPayment: 0,
        optionPayment: 0,
        promotionAmount: 0
    };

    this.getPeopleCount = function (gubun) {
        switch (gubun) {
            case "AD":
                return this.master.adultCnt;
                break;
            case "CD":
                return this.master.childCnt;
                break;
            case "IN":
                return this.master.infantCnt;
                break;
            default:
        }
    }

    this.setPeopleCount = function (gubun, count) {
        switch (gubun) {
            case "AD":
                this.master.adultCnt = count;
                break;
            case "CD":
                this.master.childCnt = count;
                break;
            case "IN":
                this.master.infantCnt = count;
                break;
            default:
        }

        funcDisplayResInput();

        this.calculatePayment();
    }

    this.getOption = function (seq) {
        for (var i = 0; i < this.options.length; i++) {
            var option = this.options[i];
            if (option.seq == seq) {
                return option;
            }
        }

        return null;
    }

    this.addOption = function (option) {
        this.options.push(option);

        this.calculatePayment();
    }

    this.setOption = function (newOption) {
        for (var i = 0; i < this.options.length; i++) {
            var option = this.options[i];
            if (option.seq == newOption.seq) {
                this.options[i] = newOption;
            }
        }

        this.calculatePayment();
    }

    this.removeOption = function (seq) {
        var index = -1;

        for (var i = 0; i < this.options.length; i++) {
            var option = this.options[i];
            if (option.seq == seq) {
                index = i;
            }
        }

        if (index > -1) {
            this.options.splice(index, 1);
        }

        this.calculatePayment();
    }

    this.removeAllOptions = function () {
        this.options = [];

        this.calculatePayment();
    }

    this.calculatePayment = function () {
        this.payment.totalMasterPayment = this.master.adultCnt * this.master.adultTotalPrice + this.master.childCnt * this.master.childTotalPrice + this.master.infantCnt * this.master.infantTotalPrice;
        this.payment.nowMasterPayment = this.master.adultCnt * this.master.adultNowPrice + this.master.childCnt * this.master.childNowPrice + this.master.infantCnt * this.master.infantNowPrice;

        if (this.options.length) {
            this.payment.optionPayment = this.options.map(function (option) { return option.price * option.count }).reduce(function (prevPrice, curPrice) { return prevPrice + curPrice });
        } else {
            this.payment.optionPayment = 0;
        }

        this.payment.totalPayment = (this.payment.totalMasterPayment + this.payment.optionPayment) - this.payment.discountPayment;
        this.payment.totalPaymentNotDiscount = (this.payment.totalMasterPayment + this.payment.optionPayment);

        if (RESERVATION_DATA.payment.totalPayment != RESERVATION_DATA.payment.nowPayment) {
            this.payment.nowPayment = this.payment.nowMasterPayment + this.payment.optionPayment;
        } else {
            this.payment.nowPayment = (this.payment.nowMasterPayment + this.payment.optionPayment) - this.payment.discountPayment;
        }

        funcDisplayPayment();
    }

    this.discountCoupon = {
        couponCd: "",
        detailSeq: 0,
        discountPrice: 0
    };

    this.perkCoupon = {
        couponCd: "",
        detailSeq: 0,
        useCount: 0
    };
}

function funcDisplaySelectedOption(el) {
    $(".clsOptionalOption").removeClass("act");
    $(el).addClass("act");

    var seq = $(el).data("optionSeq");
    var optionNm = $(el).find(".clsOptionNm").text();
    var price = $(el).find(".clsOptionPrice").text();

    if ($("#divSelectedOption").children(".clsSelectedOptionalOption").length == 0) {
        $("#divSelectedOption").empty();
    } else {
        for (var i = 0; i < $("#divSelectedOption").children(".clsSelectedOptionalOption").length; i++) {
            var $option = $("#divSelectedOption").children(".clsSelectedOptionalOption").eq(i);

            if ($option.data("optionSeq") == seq) {
                return;
            }
        }
    }

    var html = '';
    html += '<div class="list_det clsSelectedOptionalOption" data-option-seq="' + seq + '">';
    html += '    <div class="tit">';
    html += '        <span>' + optionNm + '</span>';
    html += '        <button class="close clsBtnDelSelectedOptionalOption"></button>';
    html += '    </div>';
    html += '    <div class="det">';
    html += '        <div class="count">';
    html += '            <button type="button" class="ov_minus minus_none clsBtnCalcOption" data-calc="minus"></button>';
    html += '            <span class="clsOptionCount">1</span>';
    html += '            <button type="button" class="clsBtnCalcOption" data-calc="plus"></button>';
    html += '        </div>';
    html += '        <div class="price" data-option-unitprice="' + price + '">' + price + '</div>';
    html += '    </div>';
    html += '</div>';
    $("#divSelectedOption").append(html);

    RESERVATION_DATA.addOption({
        seq: seq,
        name: optionNm,
        count: 1,
        price: Number(price.replace(/,/g, ''))
    });
    CHECK_OPTION = true;
    SelectDiscountCoupon(RESERVATION_DATA.discountCoupon.couponCd, RESERVATION_DATA.discountCoupon.detailSeq);
}

// Template
// 상세요금
var priceInfoTemplate = "";
priceInfoTemplate += "<li class='clsPriceContainer' data-price-cd='#PRICECD#' data-detail-cd='#DETAILCD#' data-master-cd='#MASTERCD#' data-organ-seq='#ORGANSEQ#' data-loop='#LOOP#'>";
priceInfoTemplate += "    <div class='p_td type'>";
priceInfoTemplate += "        #OPTION_GUBUN#";
priceInfoTemplate += "    </div>";
priceInfoTemplate += "    <div class='p_td'>";
priceInfoTemplate += "        <div class='tit_age'><span class='type_age'>성인</span><span class='age'>#ADULT_RANGE_INFO#</span><span class='price'>#ADPRICE# 원</span></div>";
priceInfoTemplate += "        <div class='count'>";
priceInfoTemplate += "            <button type='button' class='clsCalcBtn #OV_ADULT#' data-calc='minus' data-type='AD'></button>";
priceInfoTemplate += "            <span id='spnADCnt_#LOOP#'>#ADCNT#명</span>";
priceInfoTemplate += "            <button type='button' class='clsCalcBtn' data-calc='plus' data-type='AD'></button>";
priceInfoTemplate += "        </div>";
priceInfoTemplate += "    </div>";
priceInfoTemplate += "    #CHILD_PRICE_DIV#";
priceInfoTemplate += "    <div class='p_td p_td2'>";
priceInfoTemplate += "        <div class='tit_age'><span class='type_age'>유아</span><span class='age'>#INFANT_RANGE_INFO#</span><span class='price'></span></div>";
priceInfoTemplate += "            <div class='count count2'>";
priceInfoTemplate += "                <button type='button' class='minus_none'></button>";
priceInfoTemplate += "                <span>불가</span>";
priceInfoTemplate += "                <button type='button' class='plus_none'></button>";
priceInfoTemplate += "            </div>";
priceInfoTemplate += "    </div>";
priceInfoTemplate += "</li>";

var childPriceInfoTemplate = "";
childPriceInfoTemplate += "    <div class='p_td'>";
childPriceInfoTemplate += "        <div class='tit_age'><span class='type_age'>소아</span><span class='age'>#CHILD_RANGE_INFO#</span><span class='price'>#CDPRICE# 원</span></div>";
childPriceInfoTemplate += "        <div class='count'>";
childPriceInfoTemplate += "            <button type='button' class='clsCalcBtn #OV_CHILD#' data-calc='minus' data-type='CD'></button>";
childPriceInfoTemplate += "            <span id='spnCDCnt_#LOOP#'>#CDCNT#명</span>";
childPriceInfoTemplate += "            <button type='button' class='clsCalcBtn' data-calc='plus' data-type='CD'></button>";
childPriceInfoTemplate += "        </div>";
childPriceInfoTemplate += "    </div>";

var childZeroPriceInfoTemplate = "";
childZeroPriceInfoTemplate += "<div class='p_td p_td2'>";
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
selectedPriceInputTemplate += "    #AD_INFO#";
selectedPriceInputTemplate += "    #CD_INFO#";
selectedPriceInputTemplate += "    #E1_INFO#";
selectedPriceInputTemplate += "</div>";

// 일행 정보 입력폼 (티켓/패스)
var selectedTicketPassPriceInputTemplate = "";
selectedTicketPassPriceInputTemplate += "<div class='clsCoInputContainer' data-price-cd='#PRICECD#'>";
selectedTicketPassPriceInputTemplate += "    <h3>";
selectedTicketPassPriceInputTemplate += "        <span>상품 #LOOP#</span>";
selectedTicketPassPriceInputTemplate += "        <span>#OPTIONCCDNM#</span>";
selectedTicketPassPriceInputTemplate += "    </h3>";
selectedTicketPassPriceInputTemplate += "    <br>";
selectedTicketPassPriceInputTemplate += "    #AD_INFO#";
selectedTicketPassPriceInputTemplate += "    #E2_INFO#";
selectedTicketPassPriceInputTemplate += "    #E3_INFO#";
selectedTicketPassPriceInputTemplate += "    #CD_INFO#";
selectedTicketPassPriceInputTemplate += "    #E1_INFO#";
selectedTicketPassPriceInputTemplate += "</div>";

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

var e2InfoTemplate = "";
e2InfoTemplate += "    <h4>시니어 (<span>#E2CNT#</span>명)</h4>";
e2InfoTemplate += "    <div id='divCoInputContainer_#PRODUCTLOOP#_E2' class='list_wrap' data-price-cd='#PRICECD#'>";
e2InfoTemplate += "        #COINPUTE2#";
e2InfoTemplate += "    </div>";

var e3InfoTemplate = "";
e3InfoTemplate += "    <h4>청소년 (<span>#E3CNT#</span>명)</h4>";
e3InfoTemplate += "    <div id='divCoInputContainer_#PRODUCTLOOP#_E3' class='list_wrap' data-price-cd='#PRICECD#'>";
e3InfoTemplate += "        #COINPUTE3#";
e3InfoTemplate += "    </div>";

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


