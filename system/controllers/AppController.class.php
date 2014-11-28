<?php

namespace srms\sof\controllers;


final class AppController
{
    const INI_FILE_NAME = "config.ini";

    /** @var AppController */
    private static $instance = null;

    private $config = null;

    /**
     * @return AppController
     */
    public static function get()
    {
        if(self::$instance == null)
            self::$instance = new AppController();

        return self::$instance;
    }

    private function __construct()
    {
        $this->config =
            parse_ini_file($_SERVER['DOCUMENT_ROOT'] . '/../' . self::INI_FILE_NAME);
        if($this->config === false)
            throw new \Exception("ini file not found.");
    }

    private function __clone() {
        // do nothing
    }

    public function getConfig()
    {
        return $this->config;
    }

    static function printVariable($var)
    {
        echo '<pre>';
        var_dump($var);
        echo '</pre>';
    }

    public function performAction()
    {
        list($ctrlName, $action,$params) = $this->getRequestParams();
        if (!preg_match('/^[a-z]*$/i', $ctrlName) || !preg_match('/^[a-z]*$/i', $action))
            throw new \InvalidArgumentException("Wrong controller or action format.");

        $ctrlName = 'srms\\sof\\controllers\\api\\' . ucfirst($ctrlName) . 'Controller';
        if(!class_exists($ctrlName))
            throw new \InvalidArgumentException("Controller not found.");

        $ctrl = new $ctrlName($params);
        $action .= 'Action';
        if(!method_exists($ctrl, $action))
            throw new \InvalidArgumentException("Action not found.");

        return $ctrl->$action();
    }

    private function getRequestParams()
    {
        if (empty($_REQUEST['controller']) || empty($_REQUEST['action']))
            throw new \InvalidArgumentException("Controller or action is empty.");

        $otherParams = $_REQUEST;
        unset($otherParams['controller']);
        unset($otherParams['action']);

        return [$_REQUEST['controller'], $_REQUEST['action'], $otherParams];
    }

} 