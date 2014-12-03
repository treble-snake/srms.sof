<?php
namespace srms\sof\models;

/**
 * Class UserBuildModel
 * @package srms\sof\models
 *
 * @property String _id
 * @property String name
 * @property String class
 * @property array perks
 */
class UserBuildModel extends ModelBase
{
    const BASE_CLASS = "base";

    function __construct() {
        parent::__construct();
        $this->class = self::BASE_CLASS;
        $this->perks = [];
    }
}