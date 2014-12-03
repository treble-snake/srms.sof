<?php
namespace srms\sof\controllers\api;


use srms\sof\controllers\DBController;
use srms\sof\models\UserBuildModel;
use srms\sof\models\UserModel;

class BuildsController extends ApiController {

    // TODO send this value to the front-end
    const MAX_BUILD_QTY = 10;

    public function addAction()
    {
        if (empty($this->requestParams['name']))
            throw new \Exception("Build name expected.");

        $name = $this->requestParams['name'];
        $userCtrl = new UsersController();
        $user = $userCtrl->getLoggedPerson(true);

        if(count($user->builds) >= self::MAX_BUILD_QTY)
            throw new \Exception("Too many builds.");

        if($this->exists($user, $name))
            throw new \Exception("Build with a same name already exists.");

        $build = new UserBuildModel();
        $build->name = $name;

        DBController::db()->{UsersController::COLLECTION_NAME}->update(
            ['_id' => $user->_id],
            ['$push' => ['builds' => $build->toArray()]]
        );
    }

    public function listAction()
    {
        $user = (new UsersController())->getLoggedPerson(true);
        return $this->listItems(UsersController::COLLECTION_NAME, false, ["_id" => $user->_id],
            [], ["builds" => 1]);
    }

    /**
     * @param $user UserModel
     * @param $name
     * @return boolean
     */
    protected function exists($user, $name)
    {
        $result = DBController::db()->{UsersController::COLLECTION_NAME}->findOne([
                '_id' => $user->_id, 'builds.name' => $name]);
        return $result !== null;
    }

} 