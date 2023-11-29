<?php

namespace app\api\controller;

use app\common\controller\Api;
use fast\Sdapi;
use think\cache\driver\Redis;

/**
 * 首页接口
 */
class Index extends Api
{
    protected $noNeedLogin = ['*'];
    protected $noNeedRight = ['*'];

    /**
     * 首页
     *
     */
    public function index()
    {
        $this->success('QQ：858438539');
    }

    public function models()
    {
        $list = [
            ['id' => '[LibLib热门]|klklmix-幻魔界V1.safetensors', 'name' => '[LibLib热门]|klklmix-幻魔界V1.safetensors'],
            ['id' => 'ouka_gufeng_S1.safetensors [8a502df32b]', 'name' => 'ouka_gufeng_S1.safetensors [8a502df32b]'],
            ['id' => '全网首发 Everyone_v1.safetensors [ae9e11bc14]', 'name' => '全网首发 Everyone_v1.safetensors [ae9e11bc14]'],
            ['id' => '全网首发｜AWPainting 1.1_v1.1.safetensors [e7aab5067d]', 'name' => '全网首发｜AWPainting 1.1_v1.1.safetensors [e7aab5067d]'],
            ['id' => 'GuoFeng3.ckpt [74c61c3a52]', 'name' => 'GuoFeng3.ckpt [74c61c3a52]'],
            ['id' => 'DarkSushiMix-2.25D.safetensors [cca17b08da]', 'name' => 'DarkSushiMix-2.25D.safetensors [cca17b08da]'],
        ];
        $data['total'] = count($list);
        $data['list'] = $list;
        return json($data);
    }


    public function queue()
    {
        $redis = new Redis();
        $taskID = $this->request->get('id');
        $list = $redis->lRange(config('site.name') . '_user_queue');
        $index = array_search($taskID, $list);
        if ($index !== false) {
            $this->success('查询成功', $index + 1);
        }
        $this->error('查询失败,不存在', 0);
    }

    public function progress()
    {
        $redis = new Redis();
        $progressID = $this->request->get('id');
        $port = $redis->get(config('site.name') . '_progress_' . $progressID);
        if (!$port){
            $this->error('查询失败,不存在', $progressID);
        }
        $sd = new Sdapi($port);
        $res = $sd->progress();
        if (isset($res['progress'])){
            $data['progress'] = $res['progress'];
            if ($res['current_image']) {
                $data['current_image'] = $res['current_image'];
            }
            $this->success('查询成功', $data);
        }
        $this->error('进度查询失败', $progressID);
    }


}
