define(['jquery', 'bootstrap', 'frontend', 'form', 'template'], function ($, undefined, Frontend, Form, Template) {
    var validatoroptions = {
        invalid: function (form, errors) {
            $.each(errors, function (i, j) {
                Layer.msg(j);
            });
        }
    };
    var Controller = {
        txt2img: function () {
            //墨绿深蓝风
            layer.alert('请悉知,由于服务器原因,绘画进度无法显示,请耐心等待绘画即可！', {
                skin: 'layui-layer-molv' //样式类名
                ,closeBtn: 0
            });
            var uid = Config.uid;
            var queueTimeout;
            var progressTimeout;
            var isProgressTimeoutCleared = false;
            const socket = new WebSocket('ws://192.168.1.8:8282');
            socket.onopen = function () {
                console.log('连接成功');
            };
            socket.onmessage = function (e) {
                var message = JSON.parse(e.data);
                if (message.type === 'init') {
                    var bind = {
                        'type': 'bind',
                        'uuid': uid
                    };
                    socket.send(JSON.stringify(bind));
                }
                if (message.type === 'say') {
                    Toastr.success(message.msg);
                }
                if (message.type === 'event') {
                    if (message.event === 'progress') {
                        isProgressTimeoutCleared = false;
                        $('.queue').text('正在执行绘图任务,请稍后');
                        clearTimeout(queueTimeout);
                        progress(message.data);
                    }
                    if (message.event === 'txt2img') {
                        console.log('绘画完毕');
                        isProgressTimeoutCleared = true;
                        $('.queue').text('绘画完毕！');
                        clearTimeout(progressTimeout);
                        $(".res .progress-bar").css("width", "100%");
                        $('.progress-text').text("100%");
                        var base64ImageData = 'data:image/png;base64,' + message.image;
                        // 使用 jQuery 设置图片的 src 属性
                        $('#myImage').attr('src', base64ImageData);
                    }
                }
            };
            //为表单绑定事件
            var txt2imgForm = $("#txt2img-form");
            Form.api.bindevent(txt2imgForm, function (data, ret) {
                queue(data);
                $('.tips-demo').hide();
            });

            Form.api.bindevent($("#config-form"));

            function queue(queueId) {
                $.ajax({
                    url: '/api/index/queue?id=' + queueId,
                    method: 'GET',
                    success: function (data) {
                        if (data.code === 0) {
                            clearTimeout(queueTimeout);
                        } else {
                            // 处理从服务器返回的数据
                            $('.queue').text('正在排队中，第: ' + data.data + '位');
                            // 在请求完成后设置下一次轮询
                            queueTimeout = setTimeout(function () {
                                queue(queueId);
                            }, 1000); // 每隔5秒轮询一次，你可以根据需要调整时间间隔
                        }
                    },
                    timeout: 3000
                });
            }

            function progress(progressID) {
                clearTimeout(progressTimeout);
                if (isProgressTimeoutCleared) {
                    return;  // 如果标志为真，则不执行下面的代码
                }
                $.ajax({
                    url: '/api/index/progress?id=' + progressID,
                    method: 'GET',
                    success: function (data) {
                        // 处理从服务器返回的数据
                        var progress = data.data.progress;
                        progress = progress * 100;
                        progress = Math.round(progress);
                        $(".res .progress-bar").css("width", progress + "%");
                        $('.progress-text').text(progress + "%");
                        // 判断current_image是否存在
                        if (data.data.current_image) {
                            // 使用 jQuery 设置图片的 src 属性
                            var base64ImageData = 'data:image/png;base64,' + data.data.current_image;
                            $('#myImage').attr('src', base64ImageData);
                        }
                    },
                    complete: function () {
                        // 在请求完成后设置下一次轮询
                        progressTimeout = setTimeout(function () {
                            progress(progressID);
                        }, 1000); // 每隔5秒轮询一次，你可以根据需要调整时间间隔
                    },
                    timeout: 3000
                });
            }

            // 为颜色按钮添加点击事件
            $('#color-chooser li a').click(function () {
                // 移除所有按钮的选中状态
                $('#color-chooser li').removeClass('selected');
                // 将点击的按钮设为选中状态
                $(this).parent('li').addClass('selected');
                // 获取点击的按钮的 p 元素的文本值
                var selectedText = $(this).find('p').text();
                // 将值赋给modelsInput
                $('#sizeInput').val(selectedText);
            });
            // 模型选项事件
            $('.timeline-body img').on('click', function () {
                // 移除所有图片的边框
                $('.timeline-body img').removeClass('img-selected');
                // 给点击的图片添加边框
                $(this).addClass('img-selected');
                // 获取点击的图片的 data-models 属性值
                var selectedModels = $(this).data('models');
                // 将值赋给modelsInput或其他需要的地方
                $('#modelsInput').val(selectedModels);
            });
            // 使用模板提示词
            $('.btn-padding').on('click', function () {
                var prompt = $('.demo-prompt').text();
                // 先清空textarea
                $('#c-prompt').val('');
                $('#c-prompt').val(prompt);
            });
            // 模板图片选中事件
            $('.demo-list img').on('click', function () {
                // 先清空
                $('.demo-image').attr('src', '');
                $('.demo-prompt').text('');
                // 获取点击的 src 和 prompt
                var clickedSrc = $(this).attr('src');
                var clickedPrompt = $(this).data('prompt');
                // 设置新的 src 和 prompt
                $('.demo-image').attr('src', clickedSrc);
                $('.demo-prompt').text(clickedPrompt);
            });

        },
        login: function () {

            //本地验证未通过时提示
            $("#login-form").data("validator-options", validatoroptions);

            //为表单绑定事件
            Form.api.bindevent($("#login-form"), function (data, ret) {
                setTimeout(function () {
                    location.href = ret.url ? ret.url : "/";
                }, 1000);
            });

            //忘记密码
            $(document).on("click", ".btn-forgot", function () {
                var id = "resetpwdtpl";
                var content = Template(id, {});
                Layer.open({
                    type: 1,
                    title: __('Reset password'),
                    area: [$(window).width() < 450 ? ($(window).width() - 10) + "px" : "450px", "355px"],
                    content: content,
                    success: function (layero) {
                        var rule = $("#resetpwd-form input[name='captcha']").data("rule");
                        Form.api.bindevent($("#resetpwd-form", layero), function (data) {
                            Layer.closeAll();
                        });
                        $(layero).on("change", "input[name=type]", function () {
                            var type = $(this).val();
                            $("div.form-group[data-type]").addClass("hide");
                            $("div.form-group[data-type='" + type + "']").removeClass("hide");
                            $('#resetpwd-form').validator("setField", {
                                captcha: rule.replace(/remote\((.*)\)/, "remote(" + $(this).data("check-url") + ", event=resetpwd, " + type + ":#" + type + ")")
                            });
                            $(".btn-captcha").data("url", $(this).data("send-url")).data("type", type);
                        });
                    }
                });
            });
        },
        register: function () {
            //本地验证未通过时提示
            $("#register-form").data("validator-options", validatoroptions);

            //为表单绑定事件
            Form.api.bindevent($("#register-form"), function (data, ret) {
                setTimeout(function () {
                    location.href = ret.url ? ret.url : "/";
                }, 1000);
            }, function (data) {
                $("input[name=captcha]").next(".input-group-btn").find("img").trigger("click");
            });
        },
        changepwd: function () {
            //本地验证未通过时提示
            $("#changepwd-form").data("validator-options", validatoroptions);

            //为表单绑定事件
            Form.api.bindevent($("#changepwd-form"), function (data, ret) {
                setTimeout(function () {
                    location.href = ret.url ? ret.url : "/";
                }, 1000);
            });
        },
        profile: function () {
            // 给上传按钮添加上传成功事件
            $("#faupload-avatar").data("upload-success", function (data) {
                var url = Fast.api.cdnurl(data.url);
                $(".profile-user-img").prop("src", url);
                Toastr.success(__('Uploaded successful'));
            });
            Form.api.bindevent($("#profile-form"));
            $(document).on("click", ".btn-change", function () {
                var that = this;
                var id = $(this).data("type") + "tpl";
                var content = Template(id, {});
                Layer.open({
                    type: 1,
                    title: "修改",
                    area: [$(window).width() < 450 ? ($(window).width() - 10) + "px" : "450px", "355px"],
                    content: content,
                    success: function (layero) {
                        var form = $("form", layero);
                        Form.api.bindevent(form, function (data) {
                            location.reload();
                            Layer.closeAll();
                        });
                    }
                });
            });
        },
        attachment: function () {
            require(['table'], function (Table) {

                // 初始化表格参数配置
                Table.api.init({
                    extend: {
                        index_url: 'user/attachment',
                    }
                });
                var urlArr = [];
                var multiple = Fast.api.query('multiple');
                multiple = multiple == 'true' ? true : false;

                var table = $("#table");

                table.on('check.bs.table uncheck.bs.table check-all.bs.table uncheck-all.bs.table', function (e, row) {
                    if (e.type == 'check' || e.type == 'uncheck') {
                        row = [row];
                    } else {
                        urlArr = [];
                    }
                    $.each(row, function (i, j) {
                        if (e.type.indexOf("uncheck") > -1) {
                            var index = urlArr.indexOf(j.url);
                            if (index > -1) {
                                urlArr.splice(index, 1);
                            }
                        } else {
                            urlArr.indexOf(j.url) == -1 && urlArr.push(j.url);
                        }
                    });
                });

                // 初始化表格
                table.bootstrapTable({
                    url: $.fn.bootstrapTable.defaults.extend.index_url,
                    sortName: 'id',
                    showToggle: false,
                    showExport: false,
                    fixedColumns: true,
                    fixedRightNumber: 1,
                    columns: [
                        [
                            {field: 'state', checkbox: multiple, visible: multiple, operate: false},
                            {field: 'id', title: __('Id'), operate: false},
                            {
                                field: 'url', title: __('Preview'), formatter: function (value, row, index) {
                                    var html = '';
                                    if (row.mimetype.indexOf("image") > -1) {
                                        html = '<a href="' + row.fullurl + '" target="_blank"><img src="' + row.fullurl + row.thumb_style + '" alt="" style="max-height:60px;max-width:120px"></a>';
                                    } else {
                                        html = '<a href="' + row.fullurl + '" target="_blank"><img src="' + Fast.api.fixurl("ajax/icon") + "?suffix=" + row.imagetype + '" alt="" style="max-height:90px;max-width:120px"></a>';
                                    }
                                    return '<div style="width:120px;margin:0 auto;text-align:center;overflow:hidden;white-space: nowrap;text-overflow: ellipsis;">' + html + '</div>';
                                }
                            },
                            {
                                field: 'filename', title: __('Filename'), formatter: function (value, row, index) {
                                    return '<div style="width:150px;margin:0 auto;text-align:center;overflow:hidden;white-space: nowrap;text-overflow: ellipsis;">' + Table.api.formatter.search.call(this, value, row, index) + '</div>';
                                }, operate: 'like'
                            },
                            {field: 'imagewidth', title: __('Imagewidth'), operate: false},
                            {field: 'imageheight', title: __('Imageheight'), operate: false},
                            {field: 'mimetype', title: __('Mimetype'), formatter: Table.api.formatter.search},
                            {
                                field: 'createtime',
                                title: __('Createtime'),
                                width: 120,
                                formatter: Table.api.formatter.datetime,
                                datetimeFormat: 'YYYY-MM-DD',
                                operate: 'RANGE',
                                addclass: 'datetimerange',
                                sortable: true
                            },
                            {
                                field: 'operate', title: __('Operate'), width: 85, events: {
                                    'click .btn-chooseone': function (e, value, row, index) {
                                        Fast.api.close({url: row.url, multiple: multiple});
                                    },
                                }, formatter: function () {
                                    return '<a href="javascript:;" class="btn btn-danger btn-chooseone btn-xs"><i class="fa fa-check"></i> ' + __('Choose') + '</a>';
                                }
                            }
                        ]
                    ]
                });

                // 选中多个
                $(document).on("click", ".btn-choose-multi", function () {
                    Fast.api.close({url: urlArr.join(","), multiple: multiple});
                });

                // 为表格绑定事件
                Table.api.bindevent(table);
                require(['upload'], function (Upload) {
                    Upload.api.upload($("#toolbar .faupload"), function () {
                        $(".btn-refresh").trigger("click");
                    });
                });

            });
        }
    };
    return Controller;
});
