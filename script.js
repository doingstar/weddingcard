var iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

var wsc_top = 0
var menu_height = 0

var msg_area = 'guest'
var msg_idx = 0
var msg_root = 0

/*
document.addEventListener('gesturestart', function (e) {  //FOR BLOCK USER-ZOOM
    //e.preventDefault();
})
*/

$(window).bind('scroll', function() {

    wsc_top = parseInt($(window).scrollTop())

    //Contact menu off
    if ($('#contact_a').css('display') != 'none' || $('#contact_b').css('display') != 'none') mask(0)

    //Emoticon menu off
    if ($('#msg_emoticon_list_wrapper').css('display') != 'none') mask(0)

    //Photo view menu
    if ($('#photo_view_menu').css('display') != 'none') mask(0)

})
        


$(document).ready(function() {

    //마스크영역 클릭시 끄기 트리거
    $('#mask').bind('click',function() {
        if (mask_release_allow == true && $(this).css('opacity') > 0.1) {
            if ($('#mcni_wrapper').css('display') != 'none') {
                $('body').css('height', $(document).height()+'px')
            }
            mask(0)
        }
    })

    //입력폼 자동완성 끄기
    $('form').each(function() {  $(this).attr('autocomplete', 'off')  })

    //입력상자 크기 자동조절 트리거
    $('textarea').bind('keyup', function(e) {
        textarea_resize($(this))
    })

    /*
             CONTACT
                             */
    $('.contact_button').bind('click', function() {
        alert("작업중...")
        return;
        mask(0.5)
        var type = $(this).data('type')
        $('#contact_'+type).show()
    })





    /*
            PHOTO LIST
                             */

    //사진 리스트 더 보기 기능
    $('#photo_more_row').on('click', function() {        
        // $('#photo_more_img').attr('src', './img/loading4.gif')
        setTimeout(function() {
            $('.photo_wrapper').show()
            $('#photo_list_br_upload_row').show()
            $('#photo_more_row').hide()
        }, 450)
    })





    /*
          [수정하기]
                        */
    $('.msg_edit_button').live('click', function(e) {

        msg_area = $(this).parent().data('area')
        msg_idx = $(this).parent().data('idx')
        msg_root = $(this).parent().data('idx')
        //console.log('msg_area:'+msg_area+', msg_idx:'+msg_idx+', msg_root:'+msg_root)

        //메시지 편집폼
        $('#msg_form_title').text('댓글 수정')
        if (msg_area == 'guest' && msg_idx == msg_root) $('#msg_form_title').text('축하 메시지 수정')
        mask(0.5)
        $('#reply_form').css({
            'display': 'block',
            'left': wrapper_left_margin+'px',
            'width': wrapper_width+'px'
            //'top': window.innerHeight/5+'px'
        })

        //내용읽어서
        var memo = $('.msg_text[data-idx='+msg_idx+']').text()

        //메시지 편집폼 텍스트값 입력
        $('#reply_form_textarea').val(memo)

        //텍스트박스 크기조정
        var tmp = memo.split('\n')
        var row_count = tmp.length
        for(i = 0; i < tmp.length; i++) {
            if (tmp[i].length > 40) row_count++
        }
        $('#reply_form_textarea').attr('alt', row_count)
        textarea_resize($('#reply_form_textarea'))

        //알림체크 적용
        reply_form_notify($(this).data('notify'))


        //작성자만 수정 가능
        if ($(this).parent().data('mail') == $.cookie('mcard_guest_user_mail')) {
            $('#reply_form_textarea').prop('disabled', false)
            $('#reply_mail_notify_row').show()
            $('#reply_form_edit_writer_notice').hide()
            $('#msg_form_submit_button').show()
        } else {
            $('#reply_form_textarea').prop('disabled', true)
            $('#reply_mail_notify_row').hide()
            $('#reply_form_edit_writer_notice').show()
            $('#msg_form_submit_button').hide()
        }


    })





    /*
          [답글달기]
                        */
    $('.msg_reply_button').live('click', function(e) {

        msg_area = $(this).parent().data('area')
        msg_idx = $(this).parent().data('idx')
        msg_root = $(this).parent().data('idx')
        //console.log('msg_area:'+msg_area+', msg_idx:'+msg_idx+', msg_root:'+msg_root)

        var croot_name = $('.msg_name[data-idx='+msg_idx+']').text()
        var parent_idx = $(this).data('parent_idx')

        $('#msg_textarea').val('').attr('placeholder', '@'+croot_name)


            /* 아이폰 스크롤위치 + 텍스트영역 포커스 관련
            var os_keyboard_height = 316;
            $('html, body').animate({scrollTop: $('.msg[data-idx='+msg_root+']').offset().top-44-os_keyboard_height}, 0)  //top menu height = 45, keyboard height = ???
            */


        $('#msg_textarea').focus()  //람다함수 사용금지

        if (!iOS) {
            //원글이 잘 보이게 자동스크롤
            $('html, body').animate({scrollTop: $('.msg[data-idx='+msg_root+']').offset().top-45}, 0)
        }

        
            /* 아이폰 스크롤위치 + 텍스트영역 포커스 관련2
            console.log($('#msg_textarea').css('bottom'))
    
            $('#msg_textarea').focus()
    
            $('#msg_textarea').css({
                'position': 'fixed',
                'top': '0'
            })
            */

    })







    // ** 수정폼의 [등록하기] 버튼 클릭시
    $('#msg_form_submit_button').live('click', function() {

        var user_name = $('input[name=guest_user_name]').val().trim()
        var user_mail = $('input[name=guest_user_mail]').val().trim()

        var post_data = {
            'uid': uid,
            'area': msg_area,
            'idx': msg_idx,
            'name': encodeURIComponent(user_name),
            'mail': user_mail,
            'memo': encodeURIComponent($('#reply_form_textarea').val().trim()),
            'notify': $('input[name=reply_notify]').val(),
            'area': msg_area,
            //'parent': photo_idx,
            'send_type': 'ajax'
        }


        $.ajax({
        
            type: 'POST',
            url: '_msg_proc.php',
            data: post_data,
            //contentType: 'application/x-www-form-urlencoded;charset=euc-kr',
            beforeSend: function(jqXHR) {
                jqXHR.overrideMimeType('application/x-www-form-urlencoded;charset=euc-kr')
            },
            success: function(data) {
    
                mask(0)
                $('.msg[data-idx='+msg_idx+']').replaceWith(data)
                $('.msg[data-idx='+msg_idx+']').css({ 'background-color': '#eaeaea' })
                setTimeout(function() {
                    $('.msg[data-idx='+msg_idx+']').animate({
                        backgroundColor: '#ffffff'
                    }, 1000)
                }, 300)
                msg_root = 0

            },
            error: function(xhr, textStatus) {
                console.log(xhr.responseText)
            }
        
        })


    })


    // ** 수정폼의 [삭제] 버튼 클릭시
    $('#msg_delete_button').live('click', function() {

        var delete_confirm_text = '등록된 메시지가 삭제됩니다.'

        //댓글이 있는지 확인
        var this_reply_count = $('.msg[data-croot='+msg_idx+']').length - 1
        if (this_reply_count > 0) delete_confirm_text += '\n\n댓글이 등록되있습니다. 삭제시, 댓글도 모두 지워집니다.'

        //삭제여부 확인
        if (!confirm(delete_confirm_text)) {
            return false
        }

        //console.log('_msg_del_proc.php?idx='+msg_idx+'&area='+msg_area)

        $.get('_msg_del_proc.php?idx='+msg_idx+'&area='+msg_area, function(data) {
            
            console.log(data)

            mask(0)

            r = JSON.parse(data)
            //console.log(r)
            if (r.error_code == 0 && r.idx) {
                $('.msg[data-idx='+r.idx+'], .msg[data-croot='+r.idx+']').css({ 'background-color': '#eaeaea' })
                $('.msg[data-idx='+r.idx+'], .msg[data-croot='+r.idx+']').animate({
                    opacity: 0
                }, 700, function() {
                    $(this).remove()
                    msg_root = 0
                    if (msg_area == 'photo') photo_reply_update(photo_idx)
                    //전체 메시지 갯수 업데이터 필요
                    if ($('input[name=guest_logout]').val() == 1) {
                        $.cookie('mcard_guest_user_name', null, { 'path': '/' })
                        $.cookie('mcard_guest_user_mail', null, { 'path': '/' })
                        location.reload()  //$('input[name=guest_logout]').val(0)
                    }
                })
            }

        })



    })


    //Guest form close
    $('.form_close_button').on('click', function() {
        mask(0)
    })



    

    //수정모드 입력상자
    $('#reply_form_textarea').on('keyup', function() {
        if ($(this).val().trim().length > 0) {
            $('#msg_form_submit_button').css({
                'color': '#333333',
                'border-color': '#333333'
            })
        } else {
            $('#msg_form_submit_button').css({
                'color': '#efefef',
                'border-color': '#efefef'
            })
        }
    })



    //서브페이지 상단
    $('#mcard_top_back_button').bind('click', function() {
        history.back()
    })



})




function checkbox_toggle(inm) {  //input name

    if ($("input[name="+inm+"]").prop("checked")) {
        $("img[alt="+inm+"]").attr("src",$("img[alt="+inm+"]").attr("src").replace("_on.png","_off.png"))
        $("input[name="+inm+"]").prop("checked",false)
    }else{
        $("img[alt="+inm+"]").attr("src",$("img[alt="+inm+"]").attr("src").replace("_off.png","_on.png"))
        $("input[name="+inm+"]").prop("checked",true)
    }

}

function fold_toggle(oid) {  //object id

    if ($("#"+oid).css("display")=="none") {

        $("#"+oid).show()

        $("#"+oid+"_arrow").animate({
            "transform" : "rotate(180deg)"
        })

    } else {

        $("#"+oid).hide()

        $("#"+oid+"_arrow").animate({
            "transform" : "rotate(0deg)"
        })

    }

}

function photo_reply_update(idx) {
    var reply_count = $('.reply[data-parent_idx='+idx+']').length
    $('.photo_reply_counter[data-idx='+idx+']').text(reply_count)
}

function mask(opacity) {

    if (opacity == 0) {

        $('#mask').hide()
        $('.mask_over').hide()

    } else {

        //$('#mask').css({ 'width': $(window).width(), 'height': $(window).height() })
        $('#mask').stop().fadeTo('slow', opacity);  //$('#mask').fadeIn(1000)
        $('#mask').show()

    }

}


function textarea_resize(obj) {

    // count
    var text = $(obj).val()
    var lines = text.split(/\r|\r\n|\n/)
    var count = lines.length


    // resize
    var default_count = Number($(obj).attr('alt'))
    if (!default_count) default_count = 1

    if (count > 1) $(obj).css('height', 'auto')
    if (count > default_count) $(obj).attr('rows', count)
    else $(obj).attr('rows', default_count)

}


function basename(path) { return path.split('/').reverse()[0]; }


function clipboard_copy(str) {
    var tmpTextarea = document.createElement('textarea')
    tmpTextarea.value = str
    document.body.appendChild(tmpTextarea)
    tmpTextarea.select()
    tmpTextarea.setSelectionRange(0, 9999)
    document.execCommand('copy')
    document.body.removeChild(tmpTextarea)
}
