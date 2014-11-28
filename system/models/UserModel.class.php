<?php
namespace srms\sof\models;

/**
 * Class UserModel
 * @package srms\sof\models
 * @property String _id
 * @property String vkId
 * @property String vkLogin
 * @property String name
 * @property int money
 */
class UserModel
{
    /** @var String */
    private $_id;
    /** @var String */
    private $vkId;
    /** @var String */
    private $vkLogin;
    /** @var String */
    private $name;
    /** @var int */
    private $money;

    function __get($name)
    {
        $this->validateProperty($name);
        return $this->$name;
    }

    function __set($name, $value)
    {
        $this->validateProperty($name);
        $this->$name = $value;
    }

    private function validateProperty($name)
    {
        if (!property_exists($this, $name))
            throw new \Exception("No such property.");
    }

    public function toArray()
    {
        return get_object_vars($this);
    }
} 