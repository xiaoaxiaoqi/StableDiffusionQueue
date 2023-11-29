<?php
/**
 * Notes:
 * User: armstrong
 * Date: 2023/11/9
 * Time: 11:55
 * @return
 */

namespace app\common\job;

use GatewayClient\Gateway;
use think\cache\driver\Redis;
use think\Exception;
use think\Log;
use think\Queue;
use think\queue\job;

class Test
{

    protected $port = '';
    protected $data = [];

    public function fire(Job $job, $data)
    {
        $this->data = $data;
        $redis = new Redis();
        Log::record('Test', 'job');
        try {
            //TODO
            Log::info('执行任务：' . $data['queue_id']);
            $queueId = $data['queue_id'];
            $list = config('site.port');
            Log::info('当前可用服务器数量：' . count($list));
            $name = 'port1';
            $value = $list['port1'];
            while (true) {
                $portIsExist = $redis->get(config('site.name') . '_port_queue_' . $value);
                if (!$portIsExist) {
                    $this->port = $value;
                    $redis->set(config('site.name') . '_port_queue_' . $value, '1');
                    break;
                }
            }
            $job->delete();
            $this->allocatePort($name);
            $redis->removeFromRedisList(config('site.name') . '_user_queue', $queueId);
        } catch (Exception $e) {
            // 队列执行失败
            Log::error('执行失败：' . json_encode($data));
        }
    }

    public function allocatePort($name)
    {
        //消息内容
        $msgData = $this->data;
        $msgData['port'] = $this->port;
        $taskID = Queue::push(Port::class, $msgData, $name);
        $msg = [
            'type' => 'say',
            'msg'  => '排队成功',
        ];
        $this->send($msg);
    }


    private function send($msg)
    {
        Gateway::$registerAddress = '127.0.0.1:1238';
        Gateway::sendToUid($this->data['user_id'], json_encode($msg));
    }
}