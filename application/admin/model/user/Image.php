<?php

namespace app\admin\model\user;

use think\Model;


class Image extends Model
{

    

    

    // 表名
    protected $name = 'user_image';
    
    // 自动写入时间戳字段
    protected $autoWriteTimestamp = 'integer';

    // 定义时间戳字段名
    protected $createTime = 'createtime';
    protected $updateTime = 'updatetime';
    protected $deleteTime = false;

    // 追加属性
    protected $append = [
        'uploadtime_text',
        'is_public_text'
    ];
    

    
    public function getIsPublicList()
    {
        return ['0' => __('Is_public 0'), '1' => __('Is_public 1')];
    }


    public function getUploadtimeTextAttr($value, $data)
    {
        $value = $value ? $value : (isset($data['uploadtime']) ? $data['uploadtime'] : '');
        return is_numeric($value) ? date("Y-m-d H:i:s", $value) : $value;
    }


    public function getIsPublicTextAttr($value, $data)
    {
        $value = $value ? $value : (isset($data['is_public']) ? $data['is_public'] : '');
        $list = $this->getIsPublicList();
        return isset($list[$value]) ? $list[$value] : '';
    }

    protected function setUploadtimeAttr($value)
    {
        return $value === '' ? null : ($value && !is_numeric($value) ? strtotime($value) : $value);
    }


}
