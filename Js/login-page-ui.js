
$(function(){

	/* 요소별 */
	if( $('.footer_container').length ){
		_SECRETMALL_.layout.footer.init();
	}
	if( $('.prdList_type01 .p_content .priceBox .price_in .won').length ){
		_SECRETMALL_.toggleOpen.whole('.prdList_type01 .p_content .priceBox .price_in .won', '.price_in');
		_SECRETMALL_.autoClose('.prdList_type01 .p_content .priceBox .price_in');
	}
	if( $('.selectBox01').length ){
		_SECRETMALL_.selectBox.default.init('.selectBox01');
	}
	if( $('.lawList_type01').length ){
		_SECRETMALL_.toggleOpen.whole('.lawList_type01 .l_item .l_content .btnOpen', '.l_item');
	}
	if( $('.board_type01').length ){
		_SECRETMALL_.toggleOpen.wholeToggle('.board_type01 .b_item', '.b_header');
	}

	
	// _SECRETMALL_.autoClose('.calendar_container', 'visible');
	// _SECRETMALL_.autoClose('.userCount_container', 'visible');
	

	

	if( $('.payment_page').length ){				_SECRETMALL_.pages.payment.init();	}	// 예약및결제

});






var _SECRETMALL_ = {}

_SECRETMALL_ = {
	/* s: layout */
	layout: {
		footer: {
			init: function(){
				$('.footer_container .btnMore').on('click', function(){
					$('.container').toggleClass('footerExpand');
				});
			},
		},
	},
	/* e: layout */
	/* select */
	selectBox : {
		default: {
			init: function(el){
				var _THIS = this;
				
				// 초기값 셋팅
				_THIS.update(el);

				// 셀렉트 선택
				$(document).on('change', el + ' select', function(){
					_THIS.movement( el, $(this) );
				});
			},
			movement: function(el, $this, initFlag){
				// console.log(el, $this, initFlag);
				var $value = $this.closest(el).find('.valTxt');
				if( initFlag && $value.find('.hint').length ){
					return false;
				}
				$value.text( $this.find('option:selected').text() );
			},
			update: function(el){
				var _THIS = this;
				$(el).find('select').each(function(idx){
					_THIS.movement( el, $(this), true );
				});
			},
		},
		list: {
			init: function(wrap){
				var _THIS = this;
				var $wrap = $(wrap)

				// 열고닫기
				$wrap.find('.valTxt').on('click', function(){
					var $this = $(this);
					if( $this.closest(wrap).hasClass('dis') ){
						return;
					}
					if( $this.parent().hasClass('active') ){
						$wrap.removeClass('active');
					} else {
						$wrap.removeClass('active');
						$this.parent().addClass('active');
					}
				});
				_SECRETMALL_.autoClose(wrap, 'active');

				// 데이터변경
				$wrap.find('li a').on('click', function(){
					_THIS.movement( wrap, $(this) );
					return false;
				});

				// 업데이트
				_THIS.update(wrap);
			},
			movement: function(wrap, $this, initFlag){
				var $wrap = $this.closest(wrap);
				$wrap.find('li').removeClass('on');
				$this.closest('li').addClass('on');
				$this.closest(wrap).find('.valTxt').text( $this.closest('li.on a').text() );
				$this.closest(wrap).removeClass('active');
			},
			update: function(wrap){
				var _THIS = this;
				$(wrap).each(function(idx){
					if( $(this).find('li.on').length && !$(this).find('.hint').length ){
						_THIS.movement( wrap, $(this).find('li.on a'), true );
					}
				});
			},
		},
	},
	/* 파일찾기 */
	findFile: {
		init: function(el, findFile){
			var _THIS = this;

			// 파일선택
			$(document).on('change', el + ' ' + findFile, function(){
				_THIS.movement(el, $(this));
			});

			// 파일삭제
			$(document).on('click', el + ' .bDel' , function(){
				$(this).closest(el).find(findFile).val('');
				_THIS.movement(el, $(this));
			});
		},
		movement: function(el, thisEl){
			thisEl.closest(el).find('.f_val input').val( thisEl.val() );
		},
	},
	/* 폼요소_포커스_컨트롤 */
	formFocus: function(el){

		// 마우스오버
		/*$(document).on('mouseover', el, function(){
			$(this).parent().addClass('hover');
		});
		$(document).on('mouseout', el, function(){
			$(this).parent().removeClass('hover');
		});*/

		// 포커스
		$(document).on('focus', el, function(){
			$(this).parent().addClass('focus');
		});
		$(document).on('focusout', el, function(){
			$(this).parent().removeClass('focus');
		});
	},
	/* 폼요소_입력어삭제 */
	formClear: function(el){
		$(document).on('click', el + ' .bDel', function(){
			$(this).parent().find('input, textarea').val('');
		});
	},
	/* 다른 곳 클릭하면 닫기 */
	autoClose: function(trg, _className) {
		var openClass = _className;
		if( !_className ){
			openClass = 'open';
		}
		$(document).click(function (e) {
			var $trg = $(trg);
			if (!$trg.is(e.target) && $trg.has(e.target).length === 0) {
				$trg.each(function () {
					var $this = $(this);
					if ($this.hasClass(openClass)) {
						$this.removeClass(openClass);
						/*if( $('.header_container').length ){
							_SECRETMALL_.layout.header.movement();
						}*/
					}
				})
			}
		});
	},
	tab: {
		init: function(_tab, _tabCont, _tabWrap, _initOpen, _callBack){
			var _THIS = this;

			_THIS.movement(_tab, _tabCont, _tabWrap, _initOpen);

			$(document).on('click', _tab + ' li a', function(){
				var idx = $(this).closest(_tab).find('li').index( $(this).closest('li') );
				_THIS.movement(_tab, _tabCont, _tabWrap, idx, _callBack);				
				return false;
			});
		},
		movement: function(_tab, _tabCont, _tabWrap, _initOpen, _callBack){
			var openIdx = _initOpen;
			if(!openIdx){
				openIdx = 0;
			}
			// console.log(initOpen);

			$(_tab).find('li').removeClass('on');
			$(_tab).find('li').eq(openIdx).addClass('on');

			$(_tab).closest(_tabWrap).find(_tabCont).hide();
			$(_tab).closest(_tabWrap).find(_tabCont).eq(openIdx).show();
			// console.log(_tab, _tabCont, _tabWrap, initOpen);

			if(_callBack){
				_callBack();
			}
		},
	},
	toggleOpen: {
		oneself: function(el){
			$(document).on('click', el, function(){
				$(this).toggleClass('open');
				return false;
			});
		},
		whole: function(el, wrap, aryText){
			$(document).on('click', el, function(){
				var $this = $(this);
				var isOpen = $this.closest(wrap).hasClass('open');
				// console.log(aryText);

				if( isOpen ){
					$this.closest(wrap).removeClass('open');
					if(aryText){
						$this.text(aryText[0]);
					}
				} else {
					$this.closest(wrap).addClass('open');
					if(aryText){
						$this.text(aryText[1]);
					}
				}
				return false;
			});
		},
		wholeToggle: function(wrap, btn){
			$(document).on('click', wrap + ' ' + btn, function(){
				var $this = $(this);
				var isOpen = $this.closest(wrap).hasClass('open');

				$(wrap).removeClass('open');
				if( !isOpen ){
					$this.closest(wrap).addClass('open');
				}
				return false;
			});
		},
	},
	/* 팝업 */
	popup: function(el){
		var $pop = $(el);
		var isOpen = $pop.hasClass('visible');

		if( isOpen ){ // 닫힘
			$pop.removeClass('visible');
			// $('html,body').css('overflow','visible');
			// setTimeout(function(){$('html').scrollTop(scrlTop)}, 10);
		} else { // 열림
			scrlTop = $('html').scrollTop();
			$pop.addClass('visible');
			// $('html,body').css('overflow','hidden');
		}
	},
	searchOpen: {
		init: function(el){
			var _THIS = this;

			$(document).on('focus', el + ' .txtEntry input', function(){
				_THIS.movement(this, el);
			});

			_SECRETMALL_.autoClose(el);
		},
		movement: function(_this, wrap){
			var $this = $(_this);
			$this.closest(wrap).addClass('open');
			$this.closest(wrap).removeClass('black');
		},
	},
	loading: {
		loadingTimer: undefined,
		init: function(){
			if( $('.loading_type01').hasClass('visible') ){
				this.stopLoading();
			} else {
				this.movement();
			}
		},
		movement: function(){
			$('.loading_type01').addClass('visible');

			var degree = 0;
			var timer = setInterval(function(){
				$('.loading_type01 p').css('transform','rotate('+ degree +'deg)');
				degree+=45;
				if(degree > 350){
					degree = 0;
				}
			}, 100);

			this.loadingTimer = timer;
		},
		stopLoading: function(){
			$('.loading_type01').removeClass('visible');
			clearInterval(this.loadingTimer);
		},
	},
	btnFloat: {
		init: function(){
			var _THIS = this;
			_THIS.movement();

			$(window).on('scroll', function(){
				_THIS.movement();
			});
			$(window).on('resize', function(){
				_THIS.movement();
			});
		},
		movement: function(){
			var scrollTop = $(window).scrollTop();
			var innerHeight = $(window).height();
			var scrollHeight = $(document).height();
			var footerHeight =  $('.footer_container').height();
			var $btnFloat = $('.page_type03 .floating_section .btnFloat_wrap');
			var space = 0;
			if($('body').width > 1200){
				space = 150 - 30; // body_container padding-bottom 과 position bottom
			}

			if (scrollTop + innerHeight + footerHeight + 150 - 30 >= scrollHeight) {
				// 풋터가 보이는 시점
				$btnFloat.addClass('fixed');
			} else {
				// 위에서 움직이고 있는 상태
				$btnFloat.removeClass('fixed');
			}
			if( scrollTop > $('.page_type03 .mainContent_section .detail_content .tab_type02').offset().top - $('.header_container').height() ){
				// 보이기
				$btnFloat.show();				
			} else {
				$btnFloat.hide();
			}
		},
	},
}


_SECRETMALL_.fn = {
	layerPopup: function(wrap, elBtn){
		$(document).on('click', wrap + ' ' + elBtn, function(){
			var $thisWrap = $(this).closest(wrap);
			var isOpen = $thisWrap.hasClass('open');
			if(isOpen){
				$thisWrap.removeClass('open');
				// $thisWrap.find('.layerPopup_container').removeClass('visible');
			} else {
				$thisWrap.addClass('open');
				// $thisWrap.find('.layerPopup_container').addClass('visible');
			}
		});
		/*$(document).on('click', wrap + ' .layerPopup_container .lPop_close', function(){
			$(this).closest(wrap).removeClass('open');
			$(this).closest('.layerPopup_container').removeClass('visible');
		});*/

		_SECRETMALL_.autoClose(wrap);
	},
}


_SECRETMALL_.pages = {
	payment: {
		init: function(){
			this.hotelInfoMore();
			this.asideLoc();
		},
		hotelInfoMore: function(){
			$(document).on('click', '.payment_page .main_content .content_section.hotelInfo .btn_more', function(){
				var $this = $(this);
				var isOpen = $this.closest('.content_section').hasClass('open');

				if( isOpen ){
					$this.closest('.content_section').removeClass('open');
					$this.find('span').text('전체보기');
				} else {
					$this.closest('.content_section').addClass('open');
					$this.find('span').text('접기');
				}
				return false;
			});
		},
		asideLoc: function(){
			$(window).on('scroll', function(){
				var nScrl = $('html').scrollTop();
				var $el = $('.payment_page .aside_content');

				if( nScrl > $('.header_container').height() ){
					$el.css({'top': nScrl-50});
					// $el.stop().animate({'top': nScrl-50}, 500 );
				} else {
					$el.css({'top': 10});
					// $el.stop().animate({'top': 10}, 500 );
				}
			});
		},
	},
}















/******************************
***
***	plugin option
***
******************************/
var _swiperOption = {
	mainRoomViewer : function($el){
		return {
			loop: true,
			speed: 400,
			spaceBetween: 0,
			effect: 'fade',
			navigation: {
				nextEl: $el + ' .swiper-button-next',
				prevEl: $el + ' .swiper-button-prev',
			},
			pagination: {
				el: $el + ' .swiper-pagination',
				type: 'custom',
				renderCustom: function(swiper, current, total){
					return '<span class="current">' + current + '</span>/<span class="total">' + total + '</span>';
				},
			},
		}
	},
}


/*var _masonryOption = {
	item03: function(){
		return {
			itemSelector: '.i_item',
			gutter: 20,
			transitionDuration:0,
		}
	}
}
*/

