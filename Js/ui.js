function toggleEvt(onBtn,onItem){
  let $onBtn = $(onBtn);
  let $onItem = $(onItem);
  $($onBtn).toggleClass('on');
  $($onItem).toggleClass('on');
}

$(document).ready(function(){
  // 화면 768 이하일 때 footer에 #btnNpay높이만큼 패딩 추가
  if($(window).width() <= 768){
      if($("body").has("#btnNpay") && $("#btnNpay").css("position","fixed")){
          var btnNPayHight = $("#btnNPay").innerHeight();
          $(".footer").css("padding-bottom",btnNPayHight+30);
          // 창크기 조절 시 창크기에 맞게 패딩 값 다시 계산하여 적용
          $(window).resize(function(){
              var btnNPayHight = $("#btnNPay").innerHeight();
              $(".footer").css("padding-bottom",btnNPayHight+30);
          });
      }
  }
});