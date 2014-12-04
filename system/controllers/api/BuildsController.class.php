<?php
namespace srms\sof\controllers\api;


use srms\sof\controllers\AppController;
use srms\sof\controllers\DBController;
use srms\sof\models\UserBuildModel;
use srms\sof\models\UserModel;

class BuildsController extends ApiController
{

    // TODO send this value to the front-end
    const MAX_BUILD_QTY = 10;

    public function addAction()
    {
        if (empty($this->requestParams['name']))
            throw new \Exception("Build name expected.");

        $name = $this->requestParams['name'];
        $userCtrl = new UsersController();
        $user = $userCtrl->getLoggedPerson(true);

        if (count($user->builds) >= self::MAX_BUILD_QTY)
            throw new \Exception("Too many builds.");

        if ($this->exists($user, $name))
            throw new \Exception("Build with a same name already exists.");

        $build = new UserBuildModel();
        $build->name = $name;
        $build->_id = new \MongoId();

        DBController::db()->{UsersController::COLLECTION_NAME}->update(
            ['_id' => $user->_id],
            ['$push' => ['builds' => $build->toArray()]]
        );

        return json_encode(['_id' => $build->_id, 'class' => $build->class]);
    }

    public function editAction()
    {
        if (empty($this->requestParams['data']))
            throw new \Exception("Data expected.");

        $params = json_decode($this->requestParams['data'], true);
        if (empty($params['id']) || empty($params['name']))
            throw new \Exception("Not enough data.");

        $userCtrl = new UsersController();
        $user = $userCtrl->getLoggedPerson(true);

        if ($this->exists($user, $params['name']))
            throw new \Exception("Build with a same name already exists.");

        DBController::db()->{UsersController::COLLECTION_NAME}->update(
            ['_id' => $user->_id, 'builds._id' => new \MongoId($params['id']['$id'])],
            ['$set' => ['builds.$.name' => $params['name']]]
        );
    }

    public function deleteAction()
    {
        if (empty($this->requestParams['data']))
            throw new \Exception("Data expected.");

        $params = json_decode($this->requestParams['data'], true);
        if (empty($params['id']))
            throw new \Exception("Not enough data.");

        $userCtrl = new UsersController();
        $user = $userCtrl->getLoggedPerson(true);

        DBController::db()->{UsersController::COLLECTION_NAME}->update(
            ['_id' => $user->_id],
            ['$pull' => ['builds' => ['_id' => new \MongoId($params['id']['$id'])]]]
        );
    }

    public function setClassAction()
    {
        list($classId, $buildId) = $this->getParams(['classId', 'buildId']);
        $userCtrl = new UsersController();
        $user = $userCtrl->getLoggedPerson(true);

        // TODO checks
        $class = DBController::db()->classes->findOne(['_id' => $classId]);
        if (empty($class))
            throw new \Exception("Class not found: " . $classId);

        DBController::db()->{UsersController::COLLECTION_NAME}->update(
            ['_id' => $user->_id, 'builds._id' => new \MongoId($buildId['$id'])],
            [
                '$set' => ['builds.$.class' => $classId],
                '$inc' => ['money' => -1 * $class['price']]
            ]
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