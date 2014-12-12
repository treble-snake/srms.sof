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
        list($name) = $this->getParams(['name']);
        $name = trim($name);
        $this->validateName($name);
        $user = UsersController::getCurrent();

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
        list($id, $name) = $this->getParams(['id', 'name']);
        $name = trim($name);
        $this->validateName($name);
        $user = UsersController::getCurrent();

        if ($this->exists($user, $name))
            throw new \Exception("Build with a same name already exists.");

        DBController::db()->{UsersController::COLLECTION_NAME}->update(
            ['_id' => $user->_id, 'builds._id' => $this->createMongoId($id)],
            ['$set' => ['builds.$.name' => $name]]
        );
    }

    public function deleteAction()
    {
        list($id) = $this->getParams(['id']);
        $user = UsersController::getCurrent();

        $mongoId = $this->createMongoId($id);
        DBController::db()->{UsersController::COLLECTION_NAME}->update(
            ['_id' => $user->_id], [
                '$pull' => ['builds' => ['_id' => $mongoId]],
                '$inc' => ['money' => round($this->calculatePrice($user, $mongoId) / 2)]
            ]
        );
    }

    public function setClassAction()
    {
        list($classId, $buildId) = $this->getParams(['classId', 'buildId']);
        $buildMongoId = $this->createMongoId($buildId);

        $user = UsersController::getCurrent();
        $class = $this->getClass($classId);
        $this->validateClassAvailability($user, $buildMongoId, $class);
        $this->validateAffordability($user, $class['price']);

        DBController::db()->{UsersController::COLLECTION_NAME}->update(
            ['_id' => $user->_id, 'builds._id' => $buildMongoId],
            [
                '$set' => ['builds.$.class' => $classId],
                '$inc' => ['money' => -1 * $class['price']]
            ]
        );
    }

    public function addPerkAction()
    {
        list($perkId, $buildId) = $this->getParams(['perkId', 'buildId']);
        $buildMongoId = $this->createMongoId($buildId);

        $user = UsersController::getCurrent();
        $perk = $this->getPerk($perkId);
        $this->validatePerkAvailability($user, $buildMongoId, $perk);
        $this->validateAffordability($user, $perk['price']);

        DBController::db()->{UsersController::COLLECTION_NAME}->update(
            ['_id' => $user->_id, 'builds._id' => $buildMongoId],
            [
                '$push' => ['builds.$.perks' => $perkId],
                '$inc' => ['money' => -1 * $perk['price']]
            ]
        );
    }

    public function sellAction()
    {
        list($buildId) = $this->getParams(['buildId']);
        $user = UsersController::getCurrent();

        $mongoId = $this->createMongoId($buildId);
        DBController::db()->{UsersController::COLLECTION_NAME}->update(
            ['_id' => $user->_id, 'builds._id' => $mongoId],
            [
                '$set' => [
                    'builds.$.perks' => [],
                    'builds.$.class' => UserBuildModel::BASE_CLASS
                ],
                '$inc' => ['money' => round($this->calculatePrice($user, $mongoId) / 2)]
            ]
        );
    }

    public function listAction()
    {
        $user = UsersController::getCurrent();
        return $this->listItems(UsersController::COLLECTION_NAME, false, ["_id" => $user->_id],
            [], ["builds" => 1]);
    }

    public function checkNameAction()
    {
        $name = trim($this->requestParams['name']);
        AppController::printVariable($name);
        $this->validateName($name);
        echo 'ok';
    }

    protected function validateName($name)
    {
        if(!preg_match("/^[А-Яа-я\w\-\(\)\s]{1,30}$/ui", $name))
            throw new \Exception("Неверный формат названия.");
    }

    protected function validateAffordability(UserModel $user, $price)
    {
        if($user->money < $price)
            throw new \Exception("Not affordable.");
    }

    protected function validateClassAvailability(UserModel $user, \MongoId $buildId, array $class)
    {
        $build = $this->getBuild($user, $buildId);
        if($class['parent'] != $build['class'])
            throw new \Exception('Class is not available.');
    }

    protected function validatePerkAvailability(UserModel $user, \MongoId $buildId, array $perk)
    {
        $build = $this->getBuild($user, $buildId);
        $restrictions = $perk['for'];
        $class = $this->getClass($build['class']);

        if(!empty($restrictions['level']) && $class['level'] < $restrictions['level'])
            throw new \Exception('Perk is not available (level).');

        if(!empty($restrictions['classOnly']) && !in_array($build['class'], $restrictions['classOnly']))
            throw new \Exception('Perk is not available (wrong class only).');

        if(!empty($restrictions['classExcept']) && in_array($build['class'], $restrictions['classExcept']))
            throw new \Exception('Perk is not available (wrong class except).');

        if(in_array($perk['_id'], $build['perks']))
            throw new \Exception('Perk is already bought.');

        if(!empty($perk['parent']) && !in_array($perk['parent'], $build['perks']))
            throw new \Exception('Perk is not available.');
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

    protected function getBuild($user, \MongoId $id)
    {
        $buildQuery = DBController::db()->{UsersController::COLLECTION_NAME}->findOne(
            ['_id' => $user->_id, 'builds._id' => $id], ['builds.$' => 1]);
        if ($buildQuery == null)
            throw new \Exception("Build not found");

        return $buildQuery['builds'][0];
    }

    protected function getClass($id)
    {
        $class = DBController::db()->classes->findOne(['_id' => $id]);
        if($class == null)
            throw new \Exception("Class not found");

        return $class;
    }

    protected function getPerk($id)
    {
        $perk = DBController::db()->perks->findOne(['_id' => $id]);
        if($perk == null)
            throw new \Exception("Perk not found");

        return $perk;
    }

    protected function calculatePrice($user, \MongoId $buildId)
    {
        $price = 0;
        $build = $this->getBuild($user, $buildId);

        $class = $this->getClass($build['class']);
        $price += $class['price'];

        $perks = DBController::db()->perks->find(['_id' => ['$in' => $build['perks']]]);
        foreach ($perks as $perk) {
            $price += $perk['price'];
        }

        return $price;
    }
}