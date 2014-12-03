<?php
namespace srms\sof\models;


class ModelBase {

    protected $mongoArray;

    function __construct($mongoArray = []) {
        $this->mongoArray = $mongoArray;
    }

    function __get($name)
    {
        return isset($this->mongoArray[$name]) ? $this->mongoArray[$name] : null;
    }

    function __set($name, $value)
    {
        $this->mongoArray[$name] = $value;
    }

    protected function validateProperty($name)
    {
        if(!isset($this->mongoArray[$name]))
            throw new \Exception("No such property: " . $name);
    }

    public function toArray()
    {
        return $this->mongoArray;
    }

} 