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