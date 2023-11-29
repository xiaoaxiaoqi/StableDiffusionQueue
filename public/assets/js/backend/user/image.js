define(['jquery', 'bootstrap', 'backend', 'table', 'form'], function ($, undefined, Backend, Table, Form) {

    var Controller = {
        index: function () {
            // 初始化表格参数配置
            Table.api.init({
                extend: {
                    index_url: 'user/image/index' + location.search,
                    add_url: 'user/image/add',
                    edit_url: 'user/image/edit',
                    del_url: 'user/image/del',
                    multi_url: 'user/image/multi',
                    import_url: 'user/image/import',
                    table: 'user_image',
                }
            });

            var table = $("#table");

            // 初始化表格
            table.bootstrapTable({
                url: $.fn.bootstrapTable.defaults.extend.index_url,
                pk: 'id',
                sortName: 'id',
                fixedColumns: true,
                fixedRightNumber: 1,
                columns: [
                    [
                        {checkbox: true},
                        {field: 'id', title: __('Id')},
                        {field: 'category', title: __('Category'), operate: 'LIKE'},
                        {field: 'user_id', title: __('User_id')},
                        {field: 'url', title: __('Url'), operate: 'LIKE', formatter: Table.api.formatter.url},
                        {field: 'imagewidth', title: __('Imagewidth'), operate: 'LIKE'},
                        {field: 'imageheight', title: __('Imageheight'), operate: 'LIKE'},
                        {field: 'imagetype', title: __('Imagetype'), operate: 'LIKE'},
                        {field: 'imageframes', title: __('Imageframes')},
                        {field: 'filename', title: __('Filename'), operate: 'LIKE'},
                        {field: 'filesize', title: __('Filesize')},
                        {field: 'mimetype', title: __('Mimetype'), operate: 'LIKE'},
                        {field: 'extparam', title: __('Extparam'), operate: 'LIKE', table: table, class: 'autocontent', formatter: Table.api.formatter.content},
                        {field: 'createtime', title: __('Createtime'), operate:'RANGE', addclass:'datetimerange', autocomplete:false, formatter: Table.api.formatter.datetime},
                        {field: 'updatetime', title: __('Updatetime'), operate:'RANGE', addclass:'datetimerange', autocomplete:false, formatter: Table.api.formatter.datetime},
                        {field: 'uploadtime', title: __('Uploadtime'), operate:'RANGE', addclass:'datetimerange', autocomplete:false, formatter: Table.api.formatter.datetime},
                        {field: 'storage', title: __('Storage'), operate: 'LIKE'},
                        {field: 'sha1', title: __('Sha1'), operate: 'LIKE'},
                        {field: 'models', title: __('Models'), operate: 'LIKE', table: table, class: 'autocontent', formatter: Table.api.formatter.content},
                        {field: 'is_public', title: __('Is_public'), searchList: {"0":__('Is_public 0'),"1":__('Is_public 1')}, formatter: Table.api.formatter.normal},
                        {field: 'view_count', title: __('View_count')},
                        {field: 'download_count', title: __('Download_count')},
                        {field: 'operate', title: __('Operate'), table: table, events: Table.api.events.operate, formatter: Table.api.formatter.operate}
                    ]
                ]
            });

            // 为表格绑定事件
            Table.api.bindevent(table);
        },
        add: function () {
            Controller.api.bindevent();
        },
        edit: function () {
            Controller.api.bindevent();
        },
        api: {
            bindevent: function () {
                Form.api.bindevent($("form[role=form]"));
            }
        }
    };
    return Controller;
});
