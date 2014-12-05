<?php
namespace srms\sof\controllers\api;

use srms\sof\controllers\AppController;
use srms\sof\controllers\DBController;
use srms\sof\models\UserModel;

/**
 * Class UsersController
 * @package srms\sof\controllers\api
 */
class UsersController extends ApiController
{
    const COLLECTION_NAME = "users";
    /** @var UserModel|null */
    private static $currentUser = null;

    /**
     * @return null|UserModel
     */
    public static function getCurrent()
    {
        if (self::$currentUser == null) {
            $ctrl = new UsersController();
            self::$currentUser = $ctrl->getLoggedPerson(true);
        }
        return self::$currentUser;
    }

    public function authAction()
    {
        if (empty($this->requestParams['data']))
            throw new \Exception("Auth data expected.");

        $authData = json_decode($this->requestParams['data']);
        if (empty($authData->mid))
            throw new \Exception("No mid in auth data.");

        $cookieData = $this->getAuthOpenAPIMember();
        $userId = $cookieData['id'];
        if ($userId != $authData->mid)
            throw new \Exception("Incorrect auth data.");

        $users = DBController::db()->{self::COLLECTION_NAME};
        $cursor = $users->find(["vkId" => $userId]);

        if (!$cursor->hasNext()) {
            if (!isset($authData->user))
                throw new \Exception("User not found.");

            $user = new UserModel();
            $user->_id = $userId;
            $user->vkId = $userId;
            $user->vkLogin = $authData->user->domain;
            $user->name = $authData->user->first_name . " " . $authData->user->last_name;
            $user->money = 0;

            $user = $user->toArray();
            $users->insert($user);
        } else {
            $user = $cursor->getNext();
        }

        return json_encode($user);
    }

    public function addMoneyAction()
    {
        $cookieData = $this->getAuthOpenAPIMember();
        $money = mt_rand(1, 100);
        DBController::db()->{self::COLLECTION_NAME}->update(['vkId' => $cookieData['id']],
            ['$inc' => ['money' => $money]]
        );
        return json_encode(['added' => $money]);
    }

    public function getVkIdAction()
    {
        return json_encode(["id" => $this->getVkAppId()]);
    }

    /**
     * @param bool $throwIfFailed
     * @return null|UserModel
     * @throws \Exception
     */
    public function getLoggedPerson($throwIfFailed = false)
    {
        $cookieData = $this->getAuthOpenAPIMember();
        $cursor = DBController::db()->{self::COLLECTION_NAME}
            ->find(["vkId" => $cookieData['id']]);

        if (!$cursor->hasNext()) {
            if ($throwIfFailed)
                throw new \Exception("User should be logged in.");

            return null;
        }

        return new UserModel($cursor->getNext());
    }

    private function getVkAppId()
    {
        return AppController::get()->getConfig()['vk_app_id'];
    }

    private function getVkAppSecret()
    {
        return AppController::get()->getConfig()['vk_app_secret'];
    }

    private function getAuthOpenAPIMember()
    {
        if (empty($_COOKIE['vk_app_' . $this->getVkAppId()]))
            throw new \Exception("No auth data.");

        $member = null;
        $session = array();
        $validKeys = array('expire', 'mid', 'secret', 'sid', 'sig');
        $appCookie = $_COOKIE['vk_app_' . $this->getVkAppId()];

        $sessionData = explode('&', $appCookie, 10);
        foreach ($sessionData as $pair) {
            list($key, $value) = explode('=', $pair, 2);
            if (empty($key) || empty($value) || !in_array($key, $validKeys)) {
                continue;
            }
            $session[$key] = $value;
        }

        foreach ($validKeys as $key) {
            if (!isset($session[$key]))
                throw new \Exception("Not enough auth data.");
        }
        ksort($session);

        $sign = '';
        foreach ($session as $key => $value) {
            if ($key != 'sig')
                $sign .= ($key . '=' . $value);
        }

        $sign .= $this->getVkAppSecret();
        $sign = md5($sign);

        if ($session['sig'] == $sign && $session['expire'] > time()) {
            $member = array(
                'id' => intval($session['mid']),
                'secret' => $session['secret'],
                'sid' => $session['sid']
            );
        }
        return $member;
    }
} 