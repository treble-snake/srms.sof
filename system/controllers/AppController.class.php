<?php

namespace srms\sof\controllers;


final class AppController
{

    static function printVariable($var)
    {
        echo '<pre>';
        var_dump($var);
        echo '</pre>';
    }

    public function performAction()
    {
        list($ctrlName, $action) = $this->getRequestParams();
        if (!preg_match('/^[a-z]*$/i', $ctrlName) || !preg_match('/^[a-z]*$/i', $action))
            throw new \InvalidArgumentException("Wrong controller or action format.");

        $ctrlName = 'srms\\sof\\controllers\\api\\' . ucfirst($ctrlName) . 'Controller';
        if(!class_exists($ctrlName))
            throw new \InvalidArgumentException("Controller not found.");

        $ctrl = new $ctrlName();
        $action .= 'Action';
        if(!method_exists($ctrl, $action))
            throw new \InvalidArgumentException("Action not found.");

        return $ctrl->$action();
    }

    private function getRequestParams()
    {

        if (empty($_GET['controller']) || empty($_GET['action']))
            throw new \InvalidArgumentException("Controller or action is empty.");

        return [$_GET['controller'], $_GET['action']];

    }

} 