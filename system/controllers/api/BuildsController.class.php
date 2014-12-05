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

        $buildId = $params['id']['$id'];
        DBController::db()->{UsersController::COLLECTION_NAME}->update(
            ['_id' => $user->_id],
            [
                '$pull' => ['builds' => ['_id' => new \MongoId($buildId)]],
                '$inc' => ['money' => round($this->calculatePrice($user, $buildId) / 2)]
            ]
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

    public function addPerkAction()
    {
        list($perkId, $buildId) = $this->getParams(['perkId', 'buildId']);
        $userCtrl = new UsersController();
        $user = $userCtrl->getLoggedPerson(true);

        // TODO checks
        $perk = DBController::db()->perks->findOne(['_id' => $perkId]);
        if (empty($perk))
            throw new \Exception("Perk not found: " . $perkId);

        DBController::db()->{UsersController::COLLECTION_NAME}->update(
            ['_id' => $user->_id, 'builds._id' => new \MongoId($buildId['$id'])],
            [
                '$push' => ['builds.$.perks' => $perkId],
                '$inc' => ['money' => -1 * $perk['price']]
            ]
        );
    }

    public function sellAction()
    {
        list($buildId) = $this->getParams(['buildId']);
        $userCtrl = new UsersController();
        $user = $userCtrl->getLoggedPerson(true);

        // TODO checks
        DBController::db()->{UsersController::COLLECTION_NAME}->update(
            ['_id' => $user->_id, 'builds._id' => new \MongoId($buildId['$id'])],
            [
                '$set' => [
                    'builds.$.perks' => [],
                    'builds.$.class' => UserBuildModel::BASE_CLASS
                ],
                '$inc' => ['money' => round($this->calculatePrice($user, $buildId['$id']) / 2)]
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

    public function calculatePrice($user, $buildId)
    {
        $price = 0;

        $buildQuery = DBController::db()->{UsersController::COLLECTION_NAME}->findOne(
            ['_id' => $user->_id, 'builds._id' => new \MongoId($buildId)], ['builds.$' => 1]);
        if($buildQuery == null)
            throw new \Exception("Build not found");

        $build = $buildQuery['builds'][0];

        $class = DBController::db()->classes->findOne(['_id' => $build['class']]);
        if($class != null)
            $price += $class['price'];

        $perks = DBController::db()->perks->find(['_id' => ['$in' => $build['perks']]]);
        foreach($perks as $perk) {
            $price += $perk['price'];
        }

        return $price;
    }
} 