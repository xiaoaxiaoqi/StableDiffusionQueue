<?php

namespace app\common\job;

use fast\Random;
use fast\Sdapi;
use GatewayClient\Gateway;
use think\cache\driver\Redis;
use think\Exception;
use think\Log;
use think\queue\Job;

class Port
{
    protected $data = [];
    protected $port = '';

    public function fire(Job $job, $data)
    {
        $redis = new Redis();
        $this->data = $data;
        try {
            //TODO
            Log::info('Progress：' . json_encode($data));
            $this->port = $data['port'];
            $sd = new Sdapi($this->port);
            $sd->setModels($this->data['param']['models']);
            $data = $this->data['param'];
            unset($data['models']);
            unset($data['port']);
            $this->sendProgressNotifications();
            $result = $sd->txt2img($data);
            $job->delete();
            $redis->rm(config('site.name') . '_port_queue_' . $this->port);
            $redis->rm(config('site.name').'_user_is_exist_'.$this->data['user_id']);
            $images = $result['images'];
            $msg = [
                'type'  => 'event',
                'event' => 'txt2img',
                'msg'   => '绘图完成',
                'image' => $images
            ];
            $this->send($msg);
        } catch (Exception $e) {
            // 队列执行失败
            Log::error('执行失败：' . $e->getMessage());
        }
    }

    private function saveImage($result)
    {

    }

    private function sendProgressNotifications()
    {
        $redis = new Redis();
        $progressID = Random::uuid();
        $redis->set(config('site.name') . '_progress_' . $progressID, $this->port, 120);
        $msg = [
            'type'  => 'event',
            'event' => 'progress',
            'msg'   => '开始绘图',
            'data'  => $progressID
        ];
        $this->send($msg);
    }


    private function send($msg)
    {
        Gateway::$registerAddress = '127.0.0.1:1238';
        Gateway::sendToUid($this->data['user_id'], json_encode($msg));
    }
}