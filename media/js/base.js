var post_id;

function init()
{
    document.title = channel
    set_background();
    set_height();
    override_reply_submit();
    activate_position_check();
    clear_right();
    activate_scroll();
    activate_mousewheel();
    activate_key_detection();
    $('#left').scrollTop(0);
    $('#right').focus();
    setInterval(refresh_replies, 30000);
    next();
    //$(document).scrollTop(0);
}
function set_height()
{
    height = $(window).height() - $('#header').height() - 2;
    $('#right').css('height', height);
    $('#left').css('height', height);
}
function refresh_replies()
{
    $.get('/refresh_replies/',
        {
            last_reply_id: $('.reply_id:last').html(),
        },
    function(data) 
    {
        if($('.reply_id:last').html() == data['last_reply_id'])
        {
            $('#replies').append(data['replies']);
            if($('#reply_input_text').is(':focus'))
            {
                $('#right').scrollTop($('#right').prop("scrollHeight"));
            }
        }
        return false;
    });
    return false;
}
function set_background()
{
    if(channel === "green")
    {
        $('body').css('background-color', "#7B988F")
    }
    if(channel === "blue")
    {
        $('body').css('background-color', "#6E92A6")
    }
    if(channel === "red")
    {
        $('body').css('background-color', "#B55656")
    }
}
function activate_scroll()
{
    $('#left').niceScroll({mousescrollstep:500,autohidemode:'hidden',enablemousewheel:false});
    $('#right').niceScroll({mousescrollstep:500,autohidemode:'hidden',enablemousewheel:false});
    $('#left').scroll(function()
    {
        $('#right').focus();
    })
}
function show_expanded_image(id)
{
    $('#expanded_image').html("<img style='max-height:100%;max-width:100%' src='/media/img/" + id + "'>");
}        
function remove_expanded_image(id)
{
    $('#expanded_image').html("");
}
function override_reply_submit()
{
    $('#reply_form').submit(function()
    {
        last_reply_id = $('.reply_id').last().html()
        if(last_reply_id === undefined)
        {
            last_reply_id = 0;
        }
        $.get('/reply/',
            {
                post_id: post_id,
                text: $('#reply_input_text').val(),
                last_reply_id: last_reply_id
            },
        function(data) 
        {
            $('#reply_input_text').val('');
            $('#replies').append(data['replies']);
            return false;
        });
        return false;
    });
}
function activate_position_check()
{
    $("#left").scroll(function()
    {
        $('.file').each(function()
        {
            if ($(this).position().top < 180 && $(this).position().top >= 0)
            {
                id = $(this).parent().parent().parent().find(".post_id").html();
                if(post_id != id)
                {
                    change_current_post(id);
                }
            }
        })
        if( $('#left').scrollTop() == 0)
        {
            clear_right();
            post_id = 0;
        }
        if(($('#left').outerHeight() + 10) >= ($('#left').get(0).scrollHeight - $('#left').scrollTop()))
        {
            if(post_id === $('.post_id:last').html())
            {
                if($('.post_id:first').html() !== $('.post_id:last').html())
                {
                    refresh();
                }
            }
        }
    })
}
function change_current_post(id)
{
    post_id = id;
    clear_right();
    $('#reply_input_text').blur();
    $.get('/get_replies/',
    {
        post_id: id
    },
    function(data) 
    {
        $('#replies').html(data['replies']);
        $('.form_ans_container').css('visibility', 'visible');
        $('#right').scrollTop($('#right').prop("scrollHeight"));
        $('#right').focus();
        return false;
    });
    return false;
}
function defocus()
{
    $("#reply_input_text").blur();
    $('#text').blur();
}
function activate_key_detection()
{
    $(document).keyup(function(e)
     {
         code = (e.keyCode ? e.keyCode : e.which);
         if (code == 27)
         {
            defocus();
        }
     });
    $(document).keydown(function(e)
    {
        code = (e.keyCode ? e.keyCode : e.which);
        if($('#reply_input_text').is(':focus') || $('#text').is(':focus'))
        {

        }
        else
        {
            // r - reply
            if(code == 82)
            {
                reply();
                e.preventDefault();
            } 
            // space - next
            if(code == 32)
            {
                next();
                e.preventDefault();
            }                    
            // left arrow
            if(code == 37)
            {
                prev();
                e.preventDefault();
            } 
            // right arrow
            if(code == 39)
            {
                next();
                e.preventDefault();
            } 
            // up arrow
            if(code == 38)
            {
                if($('#right').is(":focus"))
                {
                    $('#right').scrollTop($('#right').scrollTop() - 20);
                }
                else
                {
                    $('#left').scrollTop($('#left').scrollTop() - 20);
                }
                e.preventDefault();
            } 
            // down arrow
            if(code == 40)
            {
                if($('#right').is(":focus"))
                {
                    $('#right').scrollTop($('#right').scrollTop() + 20);
                }
                else
                {
                    $('#left').scrollTop($('#left').scrollTop() + 20);
                }
                e.preventDefault();
            }
            // i - reload
            if(code == 73)
            {
                refresh();
                e.preventDefault();
            }
            // t - go to top
            if(code == 84)
            {
                to_top();
                e.preventDefault();
            }
            // q - green
            if(code == 81)
            {
                window.open("/green","_self");
                e.preventDefault();
            }
            // w - blue
            if(code == 87)
            {
                window.open("/blue","_self");
                e.preventDefault();
            }
            // e - red
            if(code == 69)
            {
                window.open("/red","_self");
                e.preventDefault();
            }
            // a - move posts up
            if(code == 65)
            {
                $('#left').scrollTop($('#left').scrollTop() - 20);
                e.preventDefault();
            }
            // z - move posts down
            if(code == 90)
            {
                $('#left').scrollTop($('#left').scrollTop() + 20);
                e.preventDefault();
            }
            // s - move replies up
            if(code == 83)
            {
                $('#right').scrollTop($('#right').scrollTop() - 20);
                e.preventDefault();
            }
            // x - move replies down
            if(code == 88)
            {
                $('#right').scrollTop($('#right').scrollTop() + 20);
                e.preventDefault();
            }
        }
    });
}
function activate_mousewheel()
{

    $('#left').bind('mousewheel', function(event, delta, deltaX, deltaY) 
    {
        if(delta < 0)
        {
            $('#left').scrollTop($('#left').scrollTop() + 20);
        }
        else
        {
            $('#left').scrollTop($('#left').scrollTop() - 20);
        }
    });            

    $('#right').bind('mousewheel', function(event, delta, deltaX, deltaY) 
    {
        if(delta < 0)
        {
            $('#right').scrollTop($('#right').scrollTop() + 20);
        }
        else
        {
            $('#right').scrollTop($('#right').scrollTop() - 20);
        }
        defocus();
    });
}
function clear_right()
{
    $('#replies').html('');
    $('#reply_input_text').val('');
    $('.form_ans_container').css("visibility", "hidden");
}
function next()
{
    if(post_id === $('.post_id:last').html())
    {
        if($('.post_id:first').html() !== $('.post_id:last').html())
        {
            refresh();
        }
    }
    nextone = 0;
    $('.post_id').each(function()
    {
        if($(this).html() == post_id)
        {
            nextone = $(this).parent().next()
        }
    });
    if(nextone == 0)
    {
        $('#left').scrollTop($('#left').scrollTop() + $('.post:first').position().top - $('#header').height() - 17);
    }
    else
    {
        $('#left').scrollTop($('#left').scrollTop() + nextone.position().top - $('#header').height() - 17);
    }
    return false;
}
function prev()
{
    $('.post_id').each(function()
    {
        if($(this).html() == post_id)
        {
            nextone = $(this).parent().prev()
        }
    });
    if(nextone.html() === undefined)
    {
        $('#left').scrollTop(0);
        clear_right();
    }
    else
    {
        $('#left').scrollTop($('#left').scrollTop() + nextone.position().top - $('#header').height() - 17);
    }
    return false;
}
function reply()
{
    $('#right').scrollTop($('#right').prop("scrollHeight"));
    $('#reply_input_text').focus();
    return false;
}
function to_top()
{
    $('#reply_input_text').blur();
    $('#right').scrollTop(0);
    return false;
}
function refresh()
{
    window.location.reload();
    return false;
}
function validate_submit()
{
    if($('#text').val()=="")
    {
        return false;
    }
    return true;
}