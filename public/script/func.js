/*global
    $, jQuery, alert, console, moment,
    diary,
    iconData, weatherData, emotionData, indexData:true, memoryData:true, myDropzone
*/

function showBalloon(x, y, text, alter) {
    'use strict';
    var node;
    if (alter === 3) {
        node = $('<div class="balloon balloon_alter3" style="left:' + x + 'rem;top:' + y + 'rem"><span>' + text + '</span></div>');
    } else if (alter === 2) {
        node = $('<div class="balloon balloon_alter2" style="left:' + x + 'rem;top:' + y + 'rem"><span>' + text + '</span></div>');
    } else if (alter === 1) {
        node = $('<div class="balloon balloon_alter1" style="left:' + x + 'rem;top:' + y + 'rem"><span>' + text + '</span></div>');
    } else {
        node = $('<div class="balloon" style="left:' + x + 'rem;top:' + y + 'rem"><span>' + text + '</span></div>');
    }
    node.appendTo($('#main'));
    setTimeout(function () {
        node.addClass('balloon_hide');
    }, 3000);
    setTimeout(function () {
        node.remove();
    }, 3500);
}

function hideAllBalloon() {
    'use strict';
    $('.balloon').addClass('balloon_hide');
}

function showNode(node) {
    'use strict';
    $(node).show();
    setTimeout(function () {
        $(node).removeClass('hide');
    }, 50);
}

function hideNode(node, n) {
    'use strict';
    $(node).addClass('hide');
    if (n) {
        setTimeout(function () {
            $(node).hide();
        }, 500);
    }
}

function changeAvatar(id) {
    'use strict';
    if (id === -1) {
        $('#diary_avatar').css('color', 'transparent');
    } else {
        iconData.current = id;
        if (iconData.current >= iconData.icons.length) {
            iconData.current = 0;
        }
        $('#diary_avatar').css('color', 'transparent');
        setTimeout(function () {
            $('#diary_avatar').text(iconData.icons[iconData.current]);
            $('#diary_avatar').css('color', 'inherit');
        }, 1000);
    }
}

function changeWeather(id, node) {
    'use strict';
    weatherData.current = id;
    if (weatherData.current >= weatherData.icons.length) {
        weatherData.current = 0;
    }
    node.innerHTML = weatherData.icons[weatherData.current];
    $(node).removeClass('bounce');
    setTimeout(function () {
        $(node).addClass('bounce');
    }, 30);
}

function changeEmotion(id, node) {
    'use strict';
    emotionData.current = id;
    if (emotionData.current >= emotionData.icons.length) {
        emotionData.current = 0;
    }
    node.innerHTML = emotionData.icons[emotionData.current];
    $(node).removeClass('bounce');
    setTimeout(function () {
        $(node).addClass('bounce');
    }, 30);
}

function loadMemory(node, obj) {
    'use strict';
    node.find('.diary_page_title').text(obj.title);
    node.find('.diary_page_subtitle').text(obj.subtitle);
    node.find('.diary_page_text').html("<p>" + obj.content.replace(/(?:\r\n|\r|\n)/g, "</p><p>") + "</p>");
    node.find('.diary_page_date').text(obj.date);
    node.find('.diary_page_day').text(obj.day);
    node.find('.diary_page_weather').html(weatherData.icons[obj.weather]);
    node.find('.diary_page_emotion').html(emotionData.icons[obj.emotion]);
    if (obj.image) {
        node.find('.diary_page_thumb img').attr('src', obj.image);
        node.find('.diary_page_thumb').show();
    } else {
        node.find('.diary_page_thumb').hide();
    }
}

function loadIndexList(node, index) {
    'use strict';
    var str = "",
        i;
    for (i = 15 * index; i < 15 * index + 15; i += 1) {
        if (i >= indexData.length) {
            break;
        }
        str += "<div class='diary_page_index_list' onclick='indexClick(" + i + ")'>" + indexData[i] + "</div>";
    }
    node.find('.diary_page_index_alllist').html(str);
}

function turnover(direction, callback) {
    'use strict';
    if (diary.flipping) {
        return;
    }
    if ($('#butterfly_main').hasClass('idle')) {
        $('#butterfly_main').removeClass('idle').addClass('leave');
    }
    var node0, node1, dur, tim;
    if (direction > 0) {
        if (diary.index === -1) {
            diary.index += 1;
            diary.flipping = true;
            diary.openCount += 1;
            diary.stage = "first";
            $('#diary_main').addClass('open');
            setTimeout(function () {
                $('#diary_front').css('opacity', 0);
            }, 600);
            if (direction > 1) {
                setTimeout(function () {
                    $('#diary_cover_container').css('z-index', 0);
                    diary.flipping = false;
                    turnover(direction - 1, callback);
                }, 1000);
            } else {
                setTimeout(function () {
                    $('#diary_cover_container').css('z-index', 0);
                    diary.flipping = false;
                }, 1000);
                if (diary.openCount === 1 && diary.hasLogin === false) {
                    setTimeout(function () {
                        showBalloon("3.6", "1.8", "Don't have account? Click here to sign up!", 3);
                    }, 2200);
                }
            }
        } else if (diary.index < diary.pageCount - direction) {
            if (diary.stage === "first") {
                node0 = $('#diary_first_container');
            } else {
                node0 = $('.diary_active_container').eq(diary.currC);
            }

            diary.index += direction;
            diary.flipping = true;
            if (diary.stage !== "index" && diary.index < 1 + diary.indexCount) {
                diary.stage = "index";
            } else if (diary.stage !== "memory" && diary.index >= 1 + diary.indexCount && diary.index <= diary.pageCount - 2) {
                diary.stage = "memory";
            } else if (diary.index === diary.pageCount - 1) {
                diary.stage = "last";
            }
            if (diary.index === 1) {
                node1 = $('.diary_active_container').eq(1);
                if (node1.attr("content") !== "index") {
                    node1.children().empty();
                    $('#diary_page_temp_index').clone(true).removeAttr('id').appendTo(node1.children());
                    node1.attr("content", "index");
                }
                loadIndexList(node1, diary.index - 1);
                diary.currC = 1;
            } else if (diary.stage === "last") {
                node1 = $('#diary_last_container');
            } else if (diary.stage === "index") {
                node1 = $('.diary_active_container').eq(1 - diary.currC);
                if (node1.attr("content") !== "index") {
                    node1.children().empty();
                    $('#diary_page_temp_index').clone(true).removeAttr('id').appendTo(node1.children());
                    node1.attr("content", "index");
                }
                loadIndexList(node1, diary.index - 1);
                diary.currC = 1 - diary.currC;
            } else if (diary.stage === "memory") {
                node1 = $('.diary_active_container').eq(1 - diary.currC);
                if (node1.attr("content") !== "memory") {
                    node1.children().empty();
                    $('#diary_page_temp_memory').clone(true).removeAttr('id').appendTo(node1.children());
                    node1.attr("content", "memory");
                }
                loadMemory(node1, memoryData[diary.index - diary.indexCount - 1]);
                diary.currC = 1 - diary.currC;
            }
            if (diary.stage !== "first") {
                node1.find(".diary_page_pageID").text(diary.index + " / " + (diary.pageCount - 1));
            }

            node0.show();
            node1.show();
            node0.css("z-index", 1001);
            node1.css("z-index", 1000);
            node1.removeClass('flipping flipani flipped');
            if (direction === 1) {
                node0.addClass('flipping flipani');
                setTimeout(function () {
                    node0.addClass('flipped');
                }, 300);
                setTimeout(function () {
                    diary.flipping = false;
                    node0.css("z-index", 1000);
                }, 1000);
            } else {
                dur = direction * 200;
                if (dur > 2000) {
                    dur = 2000;
                }
                node0.addClass('quickflipping flipani');
                node1.addClass('flipped');
                setTimeout(function () {
                    node0.addClass('flipped');
                }, 100);
                setTimeout(function () {
                    diary.flipping = false;
                    node0.removeClass('quickflipping').addClass('flipping');
                    node1.removeClass('flipped');
                    node0.css("z-index", 1000);
                    if (callback) {
                        callback();
                    }
                }, dur);
            }
        }
    } else if (direction < 0) {
        if (diary.index === 0) {
            $('#diary_main').removeClass('open');
            diary.index -= 1;
            diary.flipping = true;
            diary.stage = "cover";
            $('#diary_cover_container').css('z-index', 1000);
            setTimeout(function () {
                $('#diary_front').css('opacity', 1);
            }, 600);
            setTimeout(function () {
                diary.flipping = false;
            }, 2000);
            setTimeout(function () {
                $('#pen_main').removeClass('pen_hide');
            }, 2000);
            if (diary.openCount === 1 && diary.hasLogin === true && diary.newComer) {
                setTimeout(function () {
                    showBalloon("4.4", "1", "Click pen to start your writing!");
                }, 3000);
            }
            setTimeout(function () {
                if ($('#butterfly_main').hasClass('leave')) {
                    $('#butterfly_main').removeClass('leave').addClass('fly');
                    setTimeout(function () {
                        $('#butterfly_main').removeClass('fly').addClass('idle');
                    }, 10000);
                }
            }, 4000);
        } else if (diary.index + direction >= 0) {
            if (diary.stage === "last") {
                node1 = $('#diary_last_container');
            } else {
                node1 = $('.diary_active_container').eq(diary.currC);
            }

            diary.index += direction;
            diary.flipping = true;
            if (diary.index === 0) {
                diary.stage = "first";
            } else if (diary.index < 1 + diary.indexCount) {
                diary.stage = "index";
            } else {
                diary.stage = "memory";
            }

            if (diary.stage === "first") {
                node0 = $('#diary_first_container');
            } else if (diary.stage === "index") {
                node0 = $('.diary_active_container').eq(1 - diary.currC);
                if (node0.attr("content") !== "index") {
                    node0.children().empty();
                    $('#diary_page_temp_index').clone(true).removeAttr('id').appendTo(node0.children());
                    node0.attr("content", "index");
                }
                loadIndexList(node0, diary.index - 1);
                diary.currC = 1 - diary.currC;
            } else if (diary.stage === "memory") {
                node0 = $('.diary_active_container').eq(1 - diary.currC);
                if (node0.attr("content") !== "memory") {
                    node0.children().empty();
                    $('#diary_page_temp_memory').clone(true).removeAttr('id').appendTo(node0.children());
                    node0.attr("content", "memory");
                }
                loadMemory(node0, memoryData[diary.index - diary.indexCount - 1]);
                diary.currC = 1 - diary.currC;
            }
            if (diary.stage !== "first") {
                node0.find(".diary_page_pageID").text(diary.index + " / " + (diary.pageCount - 1));
            }

            if (diary.stage === "first") {
                $('.flipping').removeClass('flipping flipani').hide();
            }
            node0.show();
            node1.show();
            node0.css("z-index", 1001);
            node0.removeClass('flipani');
            if (direction === -1) {
                node0.addClass('flipping flipped');
                setTimeout(function () {
                    node0.addClass('flipani');
                    node0.removeClass('flipping');
                }, 100);
                setTimeout(function () {
                    node0.removeClass('flipped');
                }, 400);
                setTimeout(function () {
                    diary.flipping = false;
                    node0.css("z-index", 1000);
                    node1.css("z-index", 999);
                }, 1000);
            } else {
                dur = direction * -200;
                if (dur > 2000) {
                    dur = 2000;
                }
                node0.addClass('flipani quickflippingback flipped');
                node0.removeClass('flipping');
                setTimeout(function () {
                    node1.addClass('flipped');
                }, 100);
                setTimeout(function () {
                    node0.removeClass('flipped');
                }, dur - 100);
                setTimeout(function () {
                    diary.flipping = false;
                    node0.removeClass('quickflippingback');
                    node0.css("z-index", 1000);
                    node1.css("z-index", 999);
                }, dur);
            }
        }
    }
    hideAllBalloon();
    if (diary.newComer && diary.hasLogin) {
        if (diary.stage === "last") {
            setTimeout(function () {
                showBalloon("3", "3", "Click here to start writing!", 1);
            }, 1000);
        } else if (diary.stage === "index") {
            setTimeout(function () {
                showBalloon("4", "3", "Here is the Index, all your dairies are here.", 1);
            }, 1000);
        } else if (diary.stage === "first") {
            setTimeout(function () {
                showBalloon(".8", "7.5", "Click the bookmark to quickly return.", 1);
            }, 1000);
        }
    }
}

function showEdit(obj) {
    'use strict';
    var node = $('#diary_edit_container');
    if (obj) {
        diary.stage = "update";
        node.find('#diary_title_edit').val(obj.title);
        node.find('#diary_subtitle_edit').val(obj.subtitle);
        node.find('#diary_content_edit').val(obj.content);
        node.find('.diary_page_date').text(obj.date);
        node.find('.diary_page_day').text(obj.day);
        node.find('.diary_page_weather').html(weatherData.icons[obj.weather]);
        node.find('.diary_page_emotion').html(emotionData.icons[obj.emotion]);
        if (obj.image) {
            node.find('.diary_page_thumb img').attr('src', obj.image);
            $('#diary_image_upload').attr("src", obj.image);
            node.find('.diary_page_thumb').show();
        } else {
            node.find('.diary_page_thumb img').attr('src', "images/image.svg");
            node.find('.diary_page_thumb').show();
        }
    } else {
        diary.stage = "addnew";
        node.find('#diary_title_edit').val("");
        node.find('#diary_subtitle_edit').val("By " + diary.name);
        node.find('#diary_content_edit').val("");
        node.find('.diary_page_date').text(moment().format('MMM Do'));
        node.find('.diary_page_day').text(moment().format('ddd'));
        weatherData.current = 0;
        emotionData.current = 0;
        node.find('.diary_page_weather').html(weatherData.icons[0]);
        node.find('.diary_page_emotion').html(emotionData.icons[0]);
        node.find('.diary_page_thumb img').attr('src', "images/image.svg");
        $('#diary_image_upload').attr("src", "");
        node.find('.diary_page_thumb').show();
        if (diary.newComer) {
            setTimeout(function () {
                showBalloon("3.4", "1.8", "Click emoji to change it!", 2);
            }, 1000);
            setTimeout(function () {
                showBalloon("3", "2.5", "Drop or select an image to upload!", 3);
            }, 5000);
        }
    }
    weatherData.current = 0;
    emotionData.current = 0;
    $('#diary_edit_apply').text("Save");
    $('#diary_edit_cancel').text("Cancel");
    $('#diary_edit_attention').text("Really leave without saving?");
    $('#diary_edit_attention').addClass("hide").hide();
    $('#diary_uploadicon').show();
    myDropzone.removeAllFiles(true);
    node.removeClass('hide').show();
}

function indexClick(id) {
    'use strict';
    var des = id + diary.indexCount + 1 - diary.index;
    turnover(des);
}

function checkMemory() {
    'use strict';
    indexData = [];
    if (memoryData) {
        memoryData.forEach(function (memory, index) {
            indexData[index] = memory.date + " - " + memory.title;
        });
    } else {
        memoryData = [];
    }
    diary.memoryCount = memoryData.length;
    diary.indexCount = parseInt(indexData.length / 15, 10) + 1;
    diary.pageCount = diary.memoryCount + diary.indexCount + 2;
}

function getMemories(done, error) {
    'use strict';
    $.post("/pages", null, null, "json")
        .done(function (data) {
            memoryData = data.params.pages;
            checkMemory();
            done();
        })
        .error(function () {
            error();
        });
}

function addMemory(obj) {
    'use strict';
    var node;
    memoryData.push(obj);
    checkMemory();

    node = $('.diary_active_container').eq(1 - diary.currC);
    if (node.attr("content") !== "memory") {
        node.children().empty();
        $('#diary_page_temp_memory').clone(true).removeAttr('id').appendTo(node.children());
        node.attr("content", "memory");
    }
    loadMemory(node, memoryData[memoryData.length - 1]);
    diary.currC = 1 - diary.currC;
    diary.index = diary.pageCount - 2;
    node.find(".diary_page_pageID").text(diary.index + " / " + (diary.pageCount - 1));
    node.show()
        .css("z-index", 1000)
        .removeClass('flipping flipani flipped');
    $('#diary_edit_container').addClass("hide").hide();
    diary.stage = "memory";
}

function updateMemory(obj) {
    'use strict';
    var node;
    memoryData[diary.index - diary.indexCount - 1] = obj;
    checkMemory();
    node = $('.diary_active_container').eq(diary.currC);
    loadMemory(node, obj);
    $('#diary_edit_container').addClass("hide").hide();
    diary.stage = "memory";
}

function deleteMemory() {
    'use strict';
    var node0, node1, index;
    index = diary.index - diary.indexCount - 1;
    memoryData.splice(index, 1);
    checkMemory();

    diary.flipping = true;
    node0 = $('.diary_active_container').eq(diary.currC);

    if (diary.index === diary.pageCount - 1) {
        diary.stage = "last";
    } else {
        diary.stage = "memory";
    }

    if (diary.stage === "last") {
        node1 = $('#diary_last_container');
    } else if (diary.stage === "memory") {
        node1 = $('.diary_active_container').eq(1 - diary.currC);
        if (node1.attr("content") !== "memory") {
            node1.children().empty();
            $('#diary_page_temp_memory').clone(true).removeAttr('id').appendTo(node1.children());
            node1.attr("content", "memory");
        }
        loadMemory(node1, memoryData[diary.index - diary.indexCount - 1]);
        diary.currC = 1 - diary.currC;
    }
    node1.find(".diary_page_pageID").text(diary.index + " / " + (diary.pageCount - 1));

    node0.show();
    node1.show();
    node0.css("z-index", 1001);
    node1.css("z-index", 1000);
    node1.removeClass('flipping flipani flipped');
    node0.addClass('leaving flipani');
    setTimeout(function () {
        diary.flipping = false;
        node0.hide().removeClass('leaving').css("z-index", 1000);
    }, 1000);
}

function loading(callback) {
    'use strict';
    setTimeout(function () {
        $('#loading_sticker').css('transform', 'translateY(0)');
    }, 500);
    setTimeout(function () {
        $('#loading_title div').css('width', '20%');
        $.get("/islogged", null, null, "json")
            .done(function (data) {
                console.log(data);
                if (data.success) {
                    $('#loading_title div').css('width', '60%');
                    $('#loading_text').text(data.params.name);
                    diary.name = data.params.name;
                    diary.id = data.params.id;
                    diary.icon = data.params.icon;
                    diary.newComer = false;
                    changeAvatar(data.params.icon);
                    $('#diary_icon').text(iconData.icons[iconData.current]);
                    $('#diary_title').text(data.params.name.split(" ")[0] + "'s Diary");
                    $('#desk').removeClass('hide');
                    diary.hasLogin = true;

                    $('#diary_info_text_logout').text("Logged in as " + data.params.id);
                    showNode('#diary_info_text_logout');
                    showNode('#diary_info_logout');
                    hideNode('#diary_info_text_signup', true);
                    hideNode('#diary_info_signup', true);
                    $('#diary_page_form').hide();
                    showNode('#diary_page_quote');
                    showNode('#diary_first_container .diary_page_next');
                    showNode('#pen_main');

                    getMemories(function () {
                        $('#loading_title div').css('width', '100%');
                        setTimeout(function () {
                            $('#loading_title div').css('opacity', '0');
                        }, 1000);
                        setTimeout(function () {
                            $('#loading_title div').css("font-size", ".6rem");
                            $('#loading_title div').text("Welcome Back");
                        }, 1500);
                        setTimeout(function () {
                            $('#loading_title div').css('opacity', '1');
                        }, 2000);
                        setTimeout(function () {
                            $('#loading_text').css('opacity', '1');
                        }, 2500);
                        setTimeout(function () {
                            $('#loading_sticker').css('transform', 'translateY(-10rem)');
                            $('#desk').removeClass('blur');
                        }, 4000);
                        setTimeout(function () {
                            callback();
                        }, 5000);
                        setTimeout(function () {
                            $('#loading_panel').remove();
                        }, 6000);
                    }, function () {
                        setTimeout(function () {
                            $('#loading_title div').css('opacity', '0');
                        }, 1000);
                        setTimeout(function () {
                            $('#loading_title div').text("NoNetwork");
                        }, 1300);
                        setTimeout(function () {
                            $('#loading_title div').css('width', '100%');
                            $('#loading_title div').css('opacity', '1');
                        }, 1600);
                    });

                } else {
                    $('#loading_title div').css('width', '50%');
                    $('#desk').removeClass('hide');
                    setTimeout(function () {
                        $('#loading_title div').css('width', '100%');
                    }, 1000);
                    setTimeout(function () {
                        $('#loading_title div').css('opacity', '0');
                    }, 1800);
                    setTimeout(function () {
                        $('#loading_title div').text("Welcome to");
                    }, 2100);
                    setTimeout(function () {
                        $('#loading_title div').css('opacity', '1');
                    }, 2400);
                    setTimeout(function () {
                        $('#loading_text').css('opacity', '1');
                    }, 3800);
                    setTimeout(function () {
                        $('#loading_text').css('opacity', '1');
                    }, 4000);
                    setTimeout(function () {
                        $('#loading_sticker').css('transform', 'translateY(-10rem)');
                        $('#desk').removeClass('blur');
                    }, 5000);
                    setTimeout(function () {
                        callback();
                    }, 6000);
                    setTimeout(function () {
                        $('#loading_panel').remove();
                    }, 7000);
                }
            })
            .error(function () {
                setTimeout(function () {
                    $('#loading_title div').css('opacity', '0');
                }, 1000);
                setTimeout(function () {
                    $('#loading_title div').text("NoNetwork");
                }, 1300);
                setTimeout(function () {
                    $('#loading_title div').css('width', '100%');
                    $('#loading_title div').css('opacity', '1');
                }, 1600);
            });
    }, 1000);

}