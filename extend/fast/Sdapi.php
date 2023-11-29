<?php
/**
 * Notes:
 * User: armstrong
 * Date: 2023/11/9
 * Time: 14:35
 * @return
 */

namespace fast;

use think\Log;

class Sdapi
{

    public $baseUrl = '';

    public function __construct($url)
    {
        $this->baseUrl = $url;
    }

    /**
     * Notes:获取进度
     * @return mixed
     */
    public function progress()
    {
        $url = $this->baseUrl . '/sdapi/v1/progress';
        $result = Http::get($url);
        return json_decode($result, true);
    }

    /**
     * Notes:选项列表
     * @return mixed
     */
    public function list()
    {
        $url = $this->baseUrl . '/sdapi/v1/options';
        $result = Http::get($url);
        return json_decode($result, true);
    }

    /**
     * Notes:采样器列表
     * @return mixed
     */
    public function getSamplers()
    {
        $url = $this->baseUrl . '/sdapi/v1/samplers';
        $result = Http::get($url);
        return json_decode($result, true);
    }

    /**
     * Notes:获取模型
     * @return mixed
     */
    public function getModels()
    {
        $url = $this->baseUrl . '/sdapi/v1/sd-models';
        $result = Http::get($url);
        return json_decode($result, true);
    }

    /**
     * Notes:设置模型
     * @param $model
     * @return mixed|string
     */
    public function setModels($model)
    {
        $options = [
            CURLOPT_CONNECTTIMEOUT => 120,
            CURLOPT_TIMEOUT        => 120,
            CURLOPT_HTTPHEADER     => ['Content-Type: application/json', 'accept：application/json']
        ];
        $url = $this->baseUrl . '/sdapi/v1/options';
        $data = [
            'sd_model_checkpoint' => $model
        ];
        return Http::post($url, json_encode($data), $options);
    }

    public function txt2img($data)
    {
        $options = [
            CURLOPT_CONNECTTIMEOUT => 120,
            CURLOPT_TIMEOUT        => 120,
            CURLOPT_HTTPHEADER     => ['Content-Type: application/json', 'accept：application/json']
        ];
        $url = $this->baseUrl . '/sdapi/v1/txt2img';
        $result = Http::post($url, json_encode($data), $options);
        return json_decode($result, true);
    }

}